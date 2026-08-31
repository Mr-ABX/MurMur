// audio.rs - Cross-platform audio capture using cpal

use anyhow::{anyhow, Result};
use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use cpal::{Device, SampleFormat, Stream, StreamConfig};
use std::sync::{Arc, Mutex};

pub struct AudioCapture {
    stream: Option<Stream>,
    pub buffer: Arc<Mutex<Vec<f32>>>,
    pub sample_rate: u32,
}

impl AudioCapture {
    pub fn new() -> Result<Self> {
        Ok(Self {
            stream: None,
            buffer: Arc::new(Mutex::new(Vec::new())),
            sample_rate: 16000,
        })
    }

    pub fn start(&mut self) -> Result<()> {
        let host = cpal::default_host();
        let device = host
            .default_input_device()
            .ok_or_else(|| anyhow!("No input device found"))?;

        let config = self.find_supported_config(&device)?;
        let sample_rate = config.sample_rate().0;
        self.sample_rate = sample_rate;

        let buffer = Arc::clone(&self.buffer);
        let channels = config.channels() as usize;
        let target_rate = 16000u32;

        let stream = match config.sample_format() {
            SampleFormat::F32 => {
                self.build_stream::<f32>(&device, &config.into(), buffer, channels, sample_rate, target_rate)?
            }
            SampleFormat::I16 => {
                self.build_stream::<i16>(&device, &config.into(), buffer, channels, sample_rate, target_rate)?
            }
            SampleFormat::U16 => {
                self.build_stream::<u16>(&device, &config.into(), buffer, channels, sample_rate, target_rate)?
            }
            _ => return Err(anyhow!("Unsupported sample format")),
        };

        stream.play()?;
        self.stream = Some(stream);
        log::info!("Audio capture started at {}Hz", sample_rate);
        Ok(())
    }

    pub fn stop(&mut self) -> Result<Vec<f32>> {
        // Drop the stream to stop recording
        self.stream = None;

        let buffer = self.buffer.lock().unwrap();
        
        // Resample from self.sample_rate to 16000Hz using linear interpolation
        let input = &*buffer;
        let in_rate = self.sample_rate;
        let out_rate = 16000u32;
        
        let resampled = if in_rate == out_rate || input.is_empty() {
            input.to_vec()
        } else {
            let ratio = in_rate as f32 / out_rate as f32;
            let out_len = (input.len() as f32 / ratio).ceil() as usize;
            let mut out = Vec::with_capacity(out_len);
            for i in 0..out_len {
                let in_idx = i as f32 * ratio;
                let idx1 = in_idx.floor() as usize;
                let idx2 = (idx1 + 1).min(input.len() - 1);
                let frac = in_idx - idx1 as f32;
                let val = input[idx1] * (1.0 - frac) + input[idx2] * frac;
                out.push(val);
            }
            out
        };

        let max_amp = resampled.iter().map(|s| s.abs()).fold(0.0f32, |a, b| a.max(b));
        log::info!("Captured {} samples natively at {}Hz. Resampled to {} samples at 16000Hz ({:.1}s). Max amplitude: {}", 
            buffer.len(), self.sample_rate, resampled.len(), resampled.len() as f32 / 16000.0, max_amp);
            
        Ok(resampled)
    }

    pub fn get_samples(&self) -> Result<Vec<f32>> {
        let buffer = self.buffer.lock().unwrap();
        let input = &*buffer;
        let in_rate = self.sample_rate;
        let out_rate = 16000u32;
        
        let resampled = if in_rate == out_rate || input.is_empty() {
            input.to_vec()
        } else {
            let ratio = in_rate as f32 / out_rate as f32;
            let out_len = (input.len() as f32 / ratio).ceil() as usize;
            let mut out = Vec::with_capacity(out_len);
            for i in 0..out_len {
                let in_idx = i as f32 * ratio;
                let idx1 = in_idx.floor() as usize;
                let idx2 = (idx1 + 1).min(input.len() - 1);
                let frac = in_idx - idx1 as f32;
                let val = input[idx1] * (1.0 - frac) + input[idx2] * frac;
                out.push(val);
            }
            out
        };
        Ok(resampled)
    }

    pub fn get_recent_rms(&self, count: usize) -> f32 {
        let buffer = self.buffer.lock().unwrap();
        if buffer.is_empty() {
            return 0.0;
        }
        let take_len = count.min(buffer.len());
        let slice = &buffer[buffer.len() - take_len..];
        let sum_sq: f32 = slice.iter().map(|s| s * s).sum();
        let rms = (sum_sq / take_len as f32).sqrt();
        let db = if rms > 0.000001 { 20.0 * rms.log10() } else { -60.0 };
        // Sensitive dynamic range: floor at -46dB, ceiling at -10dB
        let level = ((db + 46.0) / 36.0).clamp(0.0, 1.0);
        level.powf(0.6)
    }

    pub fn clear_buffer(&self) {
        self.buffer.lock().unwrap().clear();
    }

    fn find_supported_config(&self, device: &Device) -> Result<cpal::SupportedStreamConfig> {
        // Prefer 16kHz mono (ideal for Whisper)
        let mut supported = device.supported_input_configs()?;

        // Try to find a config close to 16kHz
        let preferred = supported.find(|config| {
            config.min_sample_rate().0 <= 16000 &&
            config.max_sample_rate().0 >= 16000
        });

        if let Some(config) = preferred {
            return Ok(config.with_sample_rate(cpal::SampleRate(16000)));
        }

        // Fallback: use default
        Ok(device.default_input_config()?)
    }

    fn build_stream<T>(
        &self,
        device: &Device,
        config: &StreamConfig,
        buffer: Arc<Mutex<Vec<f32>>>,
        channels: usize,
        _source_rate: u32,
        _target_rate: u32,
    ) -> Result<Stream>
    where
        T: cpal::Sample + cpal::SizedSample,
        f32: cpal::FromSample<T>,
    {
        let stream = device.build_input_stream(
            config,
            move |data: &[T], _| {
                let mut buf = buffer.lock().unwrap();
                for chunk in data.chunks(channels) {
                    // Mix to mono and properly normalize to [-1.0, 1.0]
                    let mono = chunk.iter().map(|s| {
                        s.to_sample::<f32>()
                    }).sum::<f32>() / channels as f32;
                    buf.push(mono);
                }
            },
            |err| {
                log::error!("Audio stream error: {}", err);
            },
            None,
        )?;

        Ok(stream)
    }
}

impl Default for AudioCapture {
    fn default() -> Self {
        Self::new().expect("Failed to create audio capture")
    }
}
