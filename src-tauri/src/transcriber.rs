// transcriber.rs - Whisper.cpp inference via whisper-rs

use anyhow::{anyhow, Result};
use std::path::PathBuf;
use whisper_rs::{FullParams, SamplingStrategy, WhisperContext, WhisperContextParameters};

use crate::settings::{AppSettings, WhisperModel};

pub struct TranscriberState {
    pub context: Option<WhisperContext>,
    pub model: WhisperModel,
}

impl TranscriberState {
    pub fn new(model: &WhisperModel) -> Self {
        Self {
            context: None,
            model: model.clone(),
        }
    }

    /// Load the whisper model from disk
    pub fn load_model(&mut self, model_path: &PathBuf) -> Result<()> {
        log::info!("Loading Whisper model from {:?}", model_path);

        if !model_path.exists() {
            return Err(anyhow!("Model file not found: {:?}", model_path));
        }

        let params = WhisperContextParameters::default();
        let ctx = WhisperContext::new_with_params(
            model_path.to_str().ok_or_else(|| anyhow!("Invalid model path"))?,
            params,
        ).map_err(|e| anyhow!("Failed to load Whisper model: {}", e))?;

        self.context = Some(ctx);
        log::info!("Whisper model loaded successfully");
        Ok(())
    }

    /// Transcribe audio samples (f32, 16kHz mono) to text
    pub fn transcribe(&self, audio: &[f32], language: &str, _voxcoder_mode: bool) -> Result<String> {
        let ctx = self.context.as_ref()
            .ok_or_else(|| anyhow!("Whisper model not loaded"))?;

        // Build inference parameters
        let mut params = FullParams::new(SamplingStrategy::Greedy { best_of: 1 });

        params.set_language(Some(language));
        params.set_translate(false);
        params.set_print_special(false);
        params.set_print_progress(false);
        params.set_print_realtime(false);
        params.set_print_timestamps(false);
        params.set_token_timestamps(false);
        params.set_n_threads(num_cpus::get().min(8) as i32);
        params.set_no_context(true);

        let mut state = ctx.create_state()
            .map_err(|e| anyhow!("Failed to create Whisper state: {}", e))?;

        state.full(params, audio)
            .map_err(|e| anyhow!("Whisper inference failed: {}", e))?;

        // Collect segments
        let num_segments = state.full_n_segments()
            .map_err(|e| anyhow!("Failed to get segments: {}", e))?;

        let mut transcript = String::new();
        for i in 0..num_segments {
            let segment = state.full_get_segment_text(i)
                .map_err(|e| anyhow!("Failed to get segment text: {}", e))?;
            transcript.push_str(&segment);
        }

        Ok(transcript.trim().to_string())
    }

    pub fn is_loaded(&self) -> bool {
        self.context.is_some()
    }
}

/// Ensure Whisper model is loaded, loading it if necessary
pub fn ensure_model_loaded(
    transcriber: &mut TranscriberState,
    settings: &AppSettings,
) -> Result<()> {
    if !transcriber.is_loaded() || transcriber.model != settings.model {
        let model_path = settings.model_path(&settings.model);
        transcriber.load_model(&model_path)?;
        transcriber.model = settings.model.clone();
    }
    Ok(())
}
