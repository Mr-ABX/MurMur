use std::path::PathBuf;
use whisper_rs::{WhisperContext, WhisperContextParameters};

#[test]
fn test_whisper_context_loads() {
    let mut model_path = dirs::data_local_dir().unwrap_or_else(|| PathBuf::from("."));
    model_path.push("Murmur");
    model_path.push("models");
    model_path.push("ggml-base.en.bin");

    if !model_path.exists() {
        println!("Model not downloaded, skipping test.");
        return;
    }

    let params = WhisperContextParameters::default();
    let context_result = WhisperContext::new_with_params(&model_path.to_string_lossy(), params);
    
    assert!(context_result.is_ok(), "Failed to load whisper context! Model file might be corrupted or whisper-rs bindings are failing.");
    println!("Successfully loaded Whisper Context!");
}
