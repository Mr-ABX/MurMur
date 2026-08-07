use anyhow::{Context, Result};
use base64::{engine::general_purpose, Engine as _};
use image::{imageops::FilterType, DynamicImage, ImageFormat};
use reqwest::Client;
use serde_json::json;
use std::io::Cursor;
use tauri::{AppHandle, Manager};
use xcap::Monitor;

use crate::MurmurState;

#[tauri::command]
pub async fn capture_screen_base64() -> Result<String, String> {
    capture_screen_internal().await.map_err(|e| e.to_string())
}

async fn capture_screen_internal() -> Result<String> {
    let monitors = Monitor::all()?;
    let monitor = monitors.into_iter().next().context("No monitors found")?;
    let image = monitor.capture_image()?;
    
    // Scale down image to save tokens
    let dyn_image = DynamicImage::ImageRgba8(image);
    // Resize to max 1920x1080 while preserving aspect ratio
    let resized = dyn_image.resize(1920, 1080, FilterType::Triangle);
    
    let mut buf = Cursor::new(Vec::new());
    resized.write_to(&mut buf, ImageFormat::Jpeg)?;
    
    let b64 = general_purpose::STANDARD.encode(buf.into_inner());
    Ok(b64)
}

#[tauri::command]
pub async fn ask_screen_assistant(
    app: AppHandle,
    prompt: String,
    image_base64: String,
) -> Result<String, String> {
    ask_screen_assistant_internal(&app, prompt, image_base64)
        .await
        .map_err(|e| e.to_string())
}

async fn ask_screen_assistant_internal(
    app: &AppHandle,
    prompt: String,
    mut image_base64: String,
) -> Result<String> {
    let state = app.state::<MurmurState>();
    let settings = state.settings.lock().unwrap().clone();

    let api_key = &settings.gemini_api_key;
    if api_key.is_empty() {
        anyhow::bail!("Gemini API key is not set. Please add your Gemini API key in Settings → Cloud APIs.");
    }

    // Auto-capture screen if image_base64 is empty
    if image_base64.is_empty() {
        if let Ok(cap) = capture_screen_internal().await {
            image_base64 = cap;
        }
    }

    let system_prompt = if settings.system_prompt.is_empty() {
        "You are a helpful screen-aware assistant. Be extremely concise. Only answer what is asked. Do not output markdown unless required."
    } else {
        &settings.system_prompt
    };

    let model_name = if settings.local_assistant_model.is_empty() {
        "gemini-2.0-flash-lite-preview-02-05"
    } else {
        &settings.local_assistant_model
    };

    let url = format!(
        "https://generativelanguage.googleapis.com/v1beta/models/{}:generateContent?key={}",
        model_name, api_key
    );

    let mut parts = Vec::new();
    if !image_base64.is_empty() {
        parts.push(json!({
            "inline_data": {
                "mime_type": "image/jpeg",
                "data": image_base64
            }
        }));
    }
    parts.push(json!({ "text": prompt }));

    let client = Client::new();
    let body = json!({
        "system_instruction": {
            "parts": [
                { "text": system_prompt }
            ]
        },
        "contents": [
            {
                "parts": parts
            }
        ]
    });

    let res = client.post(&url)
        .json(&body)
        .send()
        .await?;

    if !res.status().is_success() {
        let err_text = res.text().await.unwrap_or_default();
        anyhow::bail!("Gemini API Error: {}", err_text);
    }

    let response_json: serde_json::Value = res.json().await?;

    let answer = response_json["candidates"][0]["content"]["parts"][0]["text"]
        .as_str()
        .unwrap_or("No response text found")
        .to_string();

    Ok(answer)
}
