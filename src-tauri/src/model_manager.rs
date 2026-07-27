// model_manager.rs - Handles downloading Whisper model files from HuggingFace

use anyhow::{anyhow, Result};
use reqwest::Client;
use serde::Serialize;
use std::path::PathBuf;
use tauri::{AppHandle, Emitter};
use tokio::io::AsyncWriteExt;

#[derive(Clone, Serialize)]
pub struct ProgressPayload {
    pub progress: u32,
    pub downloaded: u64,
    pub total: u64,
}

/// Download a Whisper model file with progress reporting
pub async fn download_model_file(
    url: &str,
    dest_path: &PathBuf,
    app: &AppHandle,
    model_name: &str,
) -> Result<()> {
    // Ensure parent directory exists
    if let Some(parent) = dest_path.parent() {
        tokio::fs::create_dir_all(parent).await?;
    }

    log::info!("Downloading model from: {}", url);

    let client = Client::builder()
        .timeout(std::time::Duration::from_secs(600))
        .build()?;

    let response = client.get(url).send().await?;

    if !response.status().is_success() {
        return Err(anyhow!("HTTP {} downloading model", response.status()));
    }

    let total = response.content_length().unwrap_or(0);
    let mut downloaded: u64 = 0;
    let mut last_reported = 0u32;
    let mut last_reported_bytes = 0u64;

    let mut file = tokio::fs::File::create(dest_path).await?;
    let mut stream = response.bytes_stream();

    use futures_util::StreamExt;
    while let Some(chunk) = stream.next().await {
        let chunk = chunk?;
        file.write_all(&chunk).await?;
        downloaded += chunk.len() as u64;

        let mut should_report = false;
        let mut progress = 0;

        if total > 0 {
            progress = ((downloaded as f64 / total as f64) * 100.0) as u32;
            if progress != last_reported {
                last_reported = progress;
                should_report = true;
            }
        }
        
        // Always report at least every 500KB to keep the UI feeling responsive
        if downloaded - last_reported_bytes > 500_000 {
            should_report = true;
        }

        if should_report {
            last_reported_bytes = downloaded;
            let _ = app.emit("murmur://download-progress", ProgressPayload {
                progress,
                downloaded,
                total,
            });
        }
    }

    file.flush().await?;
    log::info!("Model '{}' downloaded successfully to {:?}", model_name, dest_path);

    Ok(())
}

pub async fn download_gemma_model(
    model: &crate::settings::GemmaModel,
    dest_dir: &PathBuf,
    app: &AppHandle,
) -> Result<()> {
    let repo_id = model.repo_id();
    let files = [
        "config.json",
        "generation_config.json",
        "model.safetensors",
        "special_tokens_map.json",
        "tokenizer.json",
        "tokenizer_config.json",
    ];

    for file in files.iter() {
        let url = format!("https://huggingface.co/{}/resolve/main/{}", repo_id, file);
        let dest_path = dest_dir.join(file);
        
        let model_name_file = format!("{}/{}", model.as_str(), file);
        download_model_file(&url, &dest_path, app, &model_name_file).await?;
    }

    Ok(())
}

#[tauri::command]
pub async fn delete_model_file(
    model: crate::settings::WhisperModel,
    state: tauri::State<'_, crate::MurmurState>,
) -> Result<(), String> {
    let settings = state.settings.lock().unwrap().clone();
    let model_path = settings.model_path(&model);
    
    if model_path.exists() {
        tokio::fs::remove_file(model_path).await.map_err(|e| e.to_string())?;
    }
    
    Ok(())
}

#[tauri::command]
pub fn open_models_directory() -> Result<(), String> {
    let dir = crate::settings::AppSettings::models_dir();
    
    #[cfg(target_os = "macos")]
    std::process::Command::new("open").arg(&dir).spawn().map_err(|e| e.to_string())?;
    
    #[cfg(target_os = "windows")]
    std::process::Command::new("explorer").arg(&dir).spawn().map_err(|e| e.to_string())?;

    #[cfg(target_os = "linux")]
    std::process::Command::new("xdg-open").arg(&dir).spawn().map_err(|e| e.to_string())?;

    Ok(())
}
