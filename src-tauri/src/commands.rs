// commands.rs - All Tauri IPC commands exposed to the frontend

use std::collections::HashMap;
use tauri::{AppHandle, Emitter, Manager, State};
use tokio::task;
use anyhow::Result;

use crate::audio::AudioCapture;
use crate::model_manager;
use crate::settings::{AppSettings, WhisperModel};
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

        // Wait until recording is stopped
        loop {
            std::thread::sleep(std::time::Duration::from_millis(50));
            let recording = is_recording.lock().unwrap();
            if !*recording {
                drop(recording);

                // Stop audio and get samples
                match audio.stop() {
                    Ok(samples) => {
                        let _ = app_clone.emit("murmur://recording-stopped", ());
                        tauri::async_runtime::spawn(async move {
                            handle_transcription(app_clone, samples, settings, transcriber).await;
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
        Ok(mut text) => {
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
        Err(e) => {
            let _ = app.emit("murmur://error", format!("Transcription failed: {}", e));
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
        use enigo::{Enigo, Keyboard, Key, Settings, Direction, Modifiers};
        let mut enigo = Enigo::new(&Settings::default())?;
        enigo.key(Key::V, Direction::Click, Modifiers::CONTROL)?;
    }

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
    state: State<'_, MurmurState>,
) -> Result<(), String> {
    let mut current = state.settings.lock().unwrap();
    *current = settings.clone();
    settings.save().map_err(|e| e.to_string())
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
