// settings.rs - App settings persistence

use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use anyhow::Result;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppSettings {
    pub hotkey: String,
    pub model: WhisperModel,
    pub voxcoder_mode: bool,
    pub auto_paste: bool,
    pub sound_effects: bool,
    pub language: String,
    pub input_device: String,
    pub cloud_provider: CloudProvider,
    pub gemini_api_key: String,
    pub groq_api_key: String,
    pub deepgram_api_key: String,
    pub show_dock_icon: bool,
    pub live_streaming: bool,
    pub ai_rewrite: bool,
    #[serde(default)]
    pub custom_vocabulary: String,
    #[serde(default)]
    pub tray_icon_style: TrayIconStyle,
    #[serde(default)]
    pub system_prompt: String,
    #[serde(default)]
    pub local_assistant_model: String,
    #[serde(default)]
    pub experimental_wake_word: bool,
    #[serde(default)]
    pub operating_mode: OperatingMode,
    #[serde(default)]
    pub assistant_hotkey: String,
    #[serde(default)]
    pub wake_word: String,
    #[serde(default)]
    pub widget_notch_enabled: bool,
    #[serde(default)]
    pub widget_pet_enabled: bool,
    #[serde(default)]
    pub gemma_model: Option<GemmaModel>,
    #[serde(default = "default_true")]
    pub auto_update_check: bool,
    #[serde(default)]
    pub visibility_mode: VisibilityMode,
    #[serde(default)]
    pub notch_style: NotchStyle,
}

fn default_true() -> bool {
    true
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(rename_all = "lowercase")]
pub enum VisibilityMode {
    AlwaysOn,
    AutoHidden,
}

impl Default for VisibilityMode {
    fn default() -> Self {
        Self::AlwaysOn
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(rename_all = "lowercase")]
pub enum NotchStyle {
    DynamicIsland,
    Macbook,
}

impl Default for NotchStyle {
    fn default() -> Self {
        Self::Macbook
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(rename_all = "lowercase")]
pub enum CloudProvider {
    Local,
    Gemini,
    Groq,
    Deepgram,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(rename_all = "lowercase")]
pub enum OperatingMode {
    Dictation,
    Assistant,
    Hybrid,
}

impl Default for OperatingMode {
    fn default() -> Self {
        Self::Dictation
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(rename_all = "lowercase")]
pub enum GemmaModel {
    E2B,
    E4B,
}

impl GemmaModel {
    pub fn as_str(&self) -> &'static str {
        match self {
            GemmaModel::E2B => "e2b",
            GemmaModel::E4B => "e4b",
        }
    }
    
    pub fn repo_id(&self) -> &'static str {
        match self {
            GemmaModel::E2B => "google/gemma-4-E2B-it-assistant",
            GemmaModel::E4B => "google/gemma-4-E4B-it-assistant",
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(rename_all = "lowercase")]
pub enum WhisperModel {
    Tiny,
    Base,
    Small,
    Medium,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(rename_all = "lowercase")]
pub enum TrayIconStyle {
    Color,
    Flat,
}

impl Default for TrayIconStyle {
    fn default() -> Self {
        Self::Color
    }
}

impl WhisperModel {
    pub fn filename(&self) -> &'static str {
        match self {
            WhisperModel::Tiny => "ggml-tiny.en.bin",
            WhisperModel::Base => "ggml-base.en.bin",
            WhisperModel::Small => "ggml-small.en.bin",
            WhisperModel::Medium => "ggml-medium.en.bin",
        }
    }

    pub fn download_url(&self) -> String {
        let base = "https://huggingface.co/ggerganov/whisper.cpp/resolve/main";
        format!("{}/{}", base, self.filename())
    }

    pub fn as_str(&self) -> &'static str {
        match self {
            WhisperModel::Tiny => "tiny",
            WhisperModel::Base => "base",
            WhisperModel::Small => "small",
            WhisperModel::Medium => "medium",
        }
    }
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            hotkey: "CommandOrControl+Shift+Space".to_string(),
            model: WhisperModel::Base,
            voxcoder_mode: false,
            auto_paste: true,
            sound_effects: true,
            language: "en".to_string(),
            input_device: "default".to_string(),
            cloud_provider: CloudProvider::Local,
            gemini_api_key: "".to_string(),
            groq_api_key: "".to_string(),
            deepgram_api_key: "".to_string(),
            show_dock_icon: false,
            live_streaming: false,
            ai_rewrite: false,
            custom_vocabulary: "".to_string(),
            tray_icon_style: TrayIconStyle::Color,
            system_prompt: "You are a helpful screen-aware assistant. Be extremely concise. Only answer what is asked. Do not output markdown unless required.".to_string(),
            local_assistant_model: "gemini-2.0-flash-lite-preview-02-05".to_string(),
            experimental_wake_word: false,
            operating_mode: OperatingMode::Dictation,
            assistant_hotkey: "CommandOrControl+Shift+A".to_string(),
            wake_word: "hey murmur".to_string(),
            widget_notch_enabled: true,
            widget_pet_enabled: false,
            gemma_model: None,
            auto_update_check: true,
            visibility_mode: VisibilityMode::AlwaysOn,
            notch_style: NotchStyle::Macbook,
        }
    }
}

impl AppSettings {
    pub fn config_path() -> PathBuf {
        let mut path = dirs::config_dir()
            .unwrap_or_else(|| PathBuf::from("."));
        path.push("Murmur");
        path.push("settings.json");
        path
    }

    pub fn models_dir() -> PathBuf {
        let mut path = dirs::data_local_dir()
            .unwrap_or_else(|| PathBuf::from("."));
        path.push("Murmur");
        path.push("models");
        path
    }

    pub fn load_or_default() -> Self {
        let path = Self::config_path();
        if path.exists() {
            match std::fs::read_to_string(&path) {
                Ok(contents) => {
                    serde_json::from_str(&contents).unwrap_or_default()
                }
                Err(_) => Self::default(),
            }
        } else {
            Self::default()
        }
    }

    pub fn save(&self) -> Result<()> {
        let path = Self::config_path();
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent)?;
        }
        let json = serde_json::to_string_pretty(self)?;
        std::fs::write(path, json)?;
        Ok(())
    }

    pub fn model_path(&self, model: &WhisperModel) -> PathBuf {
        let mut path = Self::models_dir();
        path.push(model.filename());
        path
    }

    pub fn is_model_downloaded(&self, model: &WhisperModel) -> bool {
        self.model_path(model).exists()
    }

    pub fn gemma_model_path(&self, model: &GemmaModel) -> PathBuf {
        let mut path = Self::models_dir();
        path.push("gemma");
        path.push(model.as_str());
        path
    }

    pub fn is_gemma_model_downloaded(&self, model: &GemmaModel) -> bool {
        let path = self.gemma_model_path(model);
        // It's considered downloaded if model.safetensors exists
        path.join("model.safetensors").exists()
    }
}
