// commands.rs - All Tauri IPC commands exposed to the frontend

use std::collections::HashMap;
use tauri::{AppHandle, Emitter, Manager, State};
use tokio::task;
use anyhow::Result;

use crate::audio::AudioCapture;
use crate::model_manager;
use crate::settings::{AppSettings, WhisperModel, CloudProvider};
use crate::transcriber::{self, TranscriberState};
use crate::voxcoder;
use crate::overlay;
use crate::MurmurState;

// ============================================================
// Recording Commands
// ============================================================

#[tauri::command]
pub async fn start_recording(
    app: AppHandle,
    _state: State<'_, MurmurState>,
) -> Result<(), String> {
    start_recording_internal(&app).await.map_err(|e| e.to_string())
}

pub async fn start_recording_internal(app: &AppHandle) -> Result<()> {
    let state = app.state::<MurmurState>();

    {
        let mut is_recording = state.is_recording.lock().unwrap();
        if *is_recording {
            return Ok(()); // Already recording
        }
        *is_recording = true;
    }

    // Show the overlay
    overlay::show_overlay(app);

    // Emit event to frontend
    app.emit("murmur://recording-started", ())?;

    // Start audio capture in background
    let app_clone = app.clone();
    let settings = state.settings.lock().unwrap().clone();
    let transcriber = state.transcriber.clone();
    let is_recording = state.is_recording.clone();

    task::spawn_blocking(move || {
        let mut audio = AudioCapture::new().expect("Failed to create audio capture");
        audio.clear_buffer();

        if let Err(e) = audio.start() {
            log::error!("Failed to start audio: {}", e);
            let _ = app_clone.emit("murmur://error", format!("Microphone error: {}", e));
            return;
        }

        let is_live = settings.live_streaming;
        let is_deepgram = settings.cloud_provider == CloudProvider::Deepgram;
        
        let (tx_audio, rx_audio) = tokio::sync::mpsc::unbounded_channel::<Vec<f32>>();
        let final_ws_text = std::sync::Arc::new(std::sync::Mutex::new(String::new()));
        let final_ws_text_clone = final_ws_text.clone();

        if is_live && is_deepgram {
            let app_cl = app_clone.clone();
            let key = settings.deepgram_api_key.clone();
            tauri::async_runtime::spawn(async move {
                if let Err(e) = deepgram_ws_loop(app_cl.clone(), key, rx_audio, final_ws_text_clone).await {
                    log::error!("Deepgram WS error: {}", e);
                }
            });
        }

        let mut last_processed_len = 0;
        let mut last_processed_time = std::time::Instant::now();

        // Wait until recording is stopped
        loop {
            std::thread::sleep(std::time::Duration::from_millis(50));
            let recording = is_recording.lock().unwrap();

            if is_live {
                if let Ok(samples) = audio.get_samples() {
                    let current_len = samples.len();
                    if is_deepgram {
                        if current_len > last_processed_len {
                            let new_samples = &samples[last_processed_len..];
                            let _ = tx_audio.send(new_samples.to_vec());
                            last_processed_len = current_len;
                        }
                    } else {
                        // Local streaming hack
                        if last_processed_time.elapsed().as_millis() > 1000 {
                            if current_len > 0 {
                                let samples_clone = samples.clone();
                                let app_cl = app_clone.clone();
                                let set_cl = settings.clone();
                                let tr_cl = transcriber.clone();
                                tauri::async_runtime::spawn(async move {
                                    if let Ok(text) = transcriber::transcribe_hybrid(&samples_clone, &set_cl, &tr_cl).await {
                                        let _ = app_cl.emit("murmur://transcript-partial", text);
                                    }
                                });
                            }
                            last_processed_time = std::time::Instant::now();
                        }
                    }
                }
            }

            if !*recording {
                drop(recording);

                // Stop audio and get samples
                match audio.stop() {
                    Ok(samples) => {
                        let _ = app_clone.emit("murmur://recording-stopped", ());
                        
                        // Close tx_audio to end the WS loop
                        drop(tx_audio);
                        
                        tauri::async_runtime::spawn(async move {
                            if is_live && is_deepgram {
                                // Wait a bit for final WS result
                                tokio::time::sleep(tokio::time::Duration::from_millis(1000)).await;
                                let text = final_ws_text.lock().unwrap().clone();
                                handle_transcription_result(app_clone, text, settings).await;
                            } else {
                                handle_transcription(app_clone, samples, settings, transcriber).await;
                            }
                        });
                    }
                    Err(e) => {
                        let _ = app_clone.emit("murmur://error", format!("Audio error: {}", e));
                    }
                }
                break;
            }
        }
    });

    Ok(())
}

async fn deepgram_ws_loop(
    app: AppHandle,
    api_key: String,
    mut rx_audio: tokio::sync::mpsc::UnboundedReceiver<Vec<f32>>,
    final_ws_text: std::sync::Arc<std::sync::Mutex<String>>,
) -> Result<()> {
    use tokio_tungstenite::{connect_async, tungstenite::protocol::Message};
    use tokio_tungstenite::tungstenite::client::IntoClientRequest;
    use futures_util::{SinkExt, StreamExt};
    use serde_json::Value;

    let mut request = "wss://api.deepgram.com/v1/listen?encoding=linear16&sample_rate=16000&channels=1&interim_results=true".into_client_request()?;
    request.headers_mut().insert("Authorization", format!("Token {}", api_key).parse()?);
    
    let (ws_stream, _) = connect_async(request).await?;
    let (mut write, mut read) = ws_stream.split();

    let mut cumulative_transcript = String::new();

    loop {
        tokio::select! {
            audio_chunk = rx_audio.recv() => {
                match audio_chunk {
                    Some(samples) => {
                        // Convert f32 to i16 bytes
                        let mut pcm_data = Vec::with_capacity(samples.len() * 2);
                        for &sample in &samples {
                            let s = (sample * 32767.0).clamp(-32768.0, 32767.0) as i16;
                            pcm_data.extend_from_slice(&s.to_le_bytes());
                        }
                        if let Err(e) = write.send(Message::Binary(pcm_data)).await {
                            log::error!("WS send error: {}", e);
                            break;
                        }
                    }
                    None => {
                        // Channel closed (recording stopped)
                        let _ = write.send(Message::Binary(Vec::new())).await;
                        break;
                    }
                }
            }
            msg = read.next() => {
                match msg {
                    Some(Ok(Message::Text(t))) => {
                        if let Ok(json) = serde_json::from_str::<Value>(&t) {
                            if let Some(is_final) = json["is_final"].as_bool() {
                                if let Some(transcript) = json["channel"]["alternatives"][0]["transcript"].as_str() {
                                    if !transcript.is_empty() {
                                        if is_final {
                                            cumulative_transcript.push_str(transcript);
                                            cumulative_transcript.push(' ');
                                            *final_ws_text.lock().unwrap() = cumulative_transcript.clone();
                                        }
                                        
                                        let partial = format!("{}{}", cumulative_transcript, if is_final { "" } else { transcript });
                                        let _ = app.emit("murmur://transcript-partial", partial);
                                    }
                                }
                            }
                        }
                    }
                    Some(Ok(_)) => {}
                    Some(Err(e)) => {
                        log::error!("WS read error: {}", e);
                        break;
                    }
                    None => break,
                }
            }
        }
    }

    Ok(())
}

async fn handle_transcription(
    app: AppHandle,
    samples: Vec<f32>,
    settings: AppSettings,
    transcriber: std::sync::Arc<std::sync::Mutex<TranscriberState>>,
) {
    if samples.is_empty() {
        let _ = app.emit("murmur://error", "No audio captured");
        return;
    }

    let max_amp = samples.iter().map(|s| s.abs()).fold(0.0f32, |a, b| a.max(b));
    if max_amp < 0.005 {
        let _ = app.emit("murmur://error", "Microphone input was silent (is it muted?)");
        return;
    }

    // Run inference (cloud first, fallback to local)
    match transcriber::transcribe_hybrid(&samples, &settings, &transcriber).await {
        Ok(text) => {
            handle_transcription_result(app, text, settings).await;
        }
        Err(e) => {
            let _ = app.emit("murmur://error", format!("Transcription failed: {}", e));
        }
    }
}

async fn handle_transcription_result(
    app: AppHandle,
    mut text: String,
    settings: AppSettings,
) {
    if text.is_empty() {
        let _ = app.emit("murmur://error", "No speech detected");
        return;
    }

    // Apply VoxCoder mode if enabled
    if settings.voxcoder_mode {
        text = voxcoder::apply_voxcoder_mode(&text);
    }

    // Emit transcript to UI
    let _ = app.emit("murmur://transcript-done", &text);

    // Auto-paste if enabled
    if settings.auto_paste {
        // Hide overlay immediately so macOS returns focus to the user's text editor
        overlay::hide_overlay(&app);
        
        // Small delay to allow macOS to finish switching focus
        std::thread::sleep(std::time::Duration::from_millis(150));
        if let Err(e) = paste_text(&app, &text) {
            log::error!("Failed to paste text: {}", e);
            let _ = app.emit("murmur://error", format!("Accessibility Permission Required: Go to System Settings -> Privacy & Security -> Accessibility and enable it for your Terminal/IDE."));
        }
    }
}

/// Use the clipboard to paste text into the active window
fn paste_text(app: &AppHandle, text: &str) -> Result<()> {
    use tauri_plugin_clipboard_manager::ClipboardExt;
    
    // Copy the text to the system clipboard
    app.clipboard().write_text(text.to_string()).map_err(|e| anyhow::anyhow!(e))?;

    // Wait a tiny bit for the clipboard to register
    std::thread::sleep(std::time::Duration::from_millis(50));

    #[cfg(target_os = "macos")]
    {
        // Use AppleScript which naturally prompts the user for Accessibility Permissions if missing
        let output = std::process::Command::new("osascript")
            .arg("-e")
            .arg("tell application \"System Events\" to keystroke \"v\" using command down")
            .output()?;
            
        if !output.status.success() {
            return Err(anyhow::anyhow!("Missing Accessibility permissions."));
        }
    }

    #[cfg(target_os = "windows")]
    {
        use enigo::{Enigo, Keyboard, Key, Settings, Direction};
        let mut enigo = Enigo::new(&Settings::default())?;
        // Press Control down, click V, release Control — simulates Ctrl+V
        enigo.key(Key::Control, Direction::Press)?;
        enigo.key(Key::Unicode('v'), Direction::Click)?;
        enigo.key(Key::Control, Direction::Release)?;
    }

    Ok(())
}

#[tauri::command]
pub async fn stop_recording(
    app: AppHandle,
    _state: State<'_, MurmurState>,
) -> Result<(), String> {
    stop_recording_internal(&app).await.map_err(|e| e.to_string())
}

pub async fn stop_recording_internal(app: &AppHandle) -> Result<()> {
    let state = app.state::<MurmurState>();
    let mut is_recording = state.is_recording.lock().unwrap();
    *is_recording = false;
    Ok(())
}

// ============================================================
// Settings Commands
// ============================================================

#[tauri::command]
pub fn get_settings(state: State<'_, MurmurState>) -> AppSettings {
    state.settings.lock().unwrap().clone()
}

#[tauri::command]
pub fn save_settings(
    settings: AppSettings,
    app: AppHandle,
    state: State<'_, MurmurState>,
) -> Result<(), String> {
    let mut current = state.settings.lock().unwrap();
    *current = settings.clone();
    let res = settings.save().map_err(|e| e.to_string());

    #[cfg(target_os = "macos")]
    {
        if settings.show_dock_icon {
            let _ = app.set_activation_policy(tauri::ActivationPolicy::Regular);
        } else {
            let _ = app.set_activation_policy(tauri::ActivationPolicy::Accessory);
        }
    }

    // Update tray icon dynamically
    if let Some(tray) = app.tray_by_id("main") {
        let tray_icon_bytes = match settings.tray_icon_style {
            crate::settings::TrayIconStyle::Flat => include_bytes!("../icons/tray-flat.png").as_slice(),
            crate::settings::TrayIconStyle::Color => include_bytes!("../icons/tray.png").as_slice(),
        };
        if let Ok(tray_icon) = tauri::image::Image::from_bytes(tray_icon_bytes) {
            let _ = tray.set_icon(Some(tray_icon));
            let _ = tray.set_icon_as_template(settings.tray_icon_style == crate::settings::TrayIconStyle::Flat);
        }
    }

    res
}

// ============================================================
// Model Management Commands
// ============================================================

#[tauri::command]
pub fn get_downloaded_models(state: State<'_, MurmurState>) -> HashMap<String, bool> {
    let settings = state.settings.lock().unwrap();
    let models = [WhisperModel::Tiny, WhisperModel::Base, WhisperModel::Small, WhisperModel::Medium];
    models.iter().map(|m| {
        (m.as_str().to_string(), settings.is_model_downloaded(m))
    }).collect()
}

#[tauri::command]
pub async fn download_model(
    model: WhisperModel,
    app: AppHandle,
    state: State<'_, MurmurState>,
) -> Result<(), String> {
    let settings = state.settings.lock().unwrap().clone();
    let model_path = settings.model_path(&model);
    let model_url = model.download_url();
    let model_name = model.as_str().to_string();

    task::spawn(async move {
        match model_manager::download_model_file(&model_url, &model_path, &app, &model_name).await {
            Ok(()) => {
                let _ = app.emit("murmur://model-downloaded", model_name);
            }
            Err(e) => {
                let _ = app.emit("murmur://error", format!("Download failed: {}", e));
            }
        }
    });

    Ok(())
}

#[tauri::command]
pub fn get_downloaded_gemma_models(state: State<'_, MurmurState>) -> HashMap<String, bool> {
    let settings = state.settings.lock().unwrap();
    let models = [crate::settings::GemmaModel::E2B, crate::settings::GemmaModel::E4B];
    models.iter().map(|m| {
        (m.as_str().to_string(), settings.is_gemma_model_downloaded(m))
    }).collect()
}

#[tauri::command]
pub async fn download_gemma_model_cmd(
    model: crate::settings::GemmaModel,
    app: AppHandle,
    state: State<'_, MurmurState>,
) -> Result<(), String> {
    let settings = state.settings.lock().unwrap().clone();
    let dest_dir = settings.gemma_model_path(&model);
    let model_name = model.as_str().to_string();

    task::spawn(async move {
        match model_manager::download_gemma_model(&model, &dest_dir, &app).await {
            Ok(()) => {
                let _ = app.emit("murmur://gemma-downloaded", model_name);
            }
            Err(e) => {
                let _ = app.emit("murmur://error", format!("Gemma download failed: {}", e));
            }
        }
    });

    Ok(())
}

#[tauri::command]
pub async fn delete_gemma_model(
    model: crate::settings::GemmaModel,
    state: State<'_, MurmurState>,
) -> Result<(), String> {
    let settings = state.settings.lock().unwrap().clone();
    let dest_dir = settings.gemma_model_path(&model);

    if dest_dir.exists() {
        tokio::fs::remove_dir_all(dest_dir).await.map_err(|e| e.to_string())?;
    }
    
    Ok(())
}

// ============================================================
// App Commands
// ============================================================

#[tauri::command]
pub fn quit_app() {
    std::process::exit(0);
}

#[tauri::command]
pub async fn clear_all_app_data(app: tauri::AppHandle) -> Result<(), String> {
    // Delete settings directory
    let config_path = crate::settings::AppSettings::config_path();
    if let Some(config_dir) = config_path.parent() {
        if config_dir.exists() {
            let _ = tokio::fs::remove_dir_all(config_dir).await;
        }
    }
    
    // Delete models directory
    let models_dir = crate::settings::AppSettings::models_dir();
    if let Some(data_dir) = models_dir.parent() {
        if data_dir.exists() {
            let _ = tokio::fs::remove_dir_all(data_dir).await;
        }
    }
    
    // Also quit the app after clearing
    app.exit(0);
    Ok(())
}
