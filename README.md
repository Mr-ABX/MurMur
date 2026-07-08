<div align="center">
  <img src="app-icon.jpg" alt="MurMur Logo" width="200" height="200" style="border-radius: 20px;">
  <h1>MurMur: Your AI Voice Prompting Solution 🎙️</h1>
  <p><strong>Free, lightning-fast, and entirely local voice-to-text for AI workflows.</strong></p>

  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![Platform: macOS](https://img.shields.io/badge/Platform-macOS-lightgrey.svg)]()
  [![Tauri](https://img.shields.io/badge/Built%20with-Tauri-orange.svg)](https://tauri.app/)
  [![Whisper.cpp](https://img.shields.io/badge/Powered%20by-Whisper.cpp-purple.svg)](https://github.com/ggerganov/whisper.cpp)
</div>

---

## 🌟 Overview

**MurMur** is the ultimate AI voice-prompting tool designed for developers, writers, and power users. Instead of painstakingly typing out massive prompts for ChatGPT, Claude, or Cursor, simply hold a hotkey, speak naturally, and let MurMur instantly transcribe your voice and drop the text directly into your active window.

The best part? It runs **100% locally** using the incredibly optimized `whisper.cpp` engine. No cloud subscriptions, no internet connection required for transcription, and absolute privacy for your voice data.

## ✨ Features

- **🚀 Lightning Fast:** Instant transcription utilizing hardware-accelerated local inference.
- **🔒 100% Private & Local:** Your audio never leaves your machine. Powered by OpenAI's Whisper (running entirely on your CPU/GPU).
- **⌨️ Universal Auto-Paste:** Press `Cmd + Shift + Space`, speak, and release. Your transcription is automatically typed into whatever app you're using (IDE, Browser, Slack, etc.).
- **🎤 Advanced Audio Normalization:** Handles any microphone sample rate dynamically (resampling seamlessly to 16kHz) to ensure zero AI "hallucinations."
- **🎨 Beautiful Native UI:** Designed with modern glassmorphism, staying quietly in your menu bar until you need it.
- **🤖 VoxCoder Mode:** Automatically formats your spoken code concepts into structured, AI-ready prompts for LLMs.

## 📥 Installation

*Note: MurMur is currently in private beta for macOS.*

1. Clone the repository:
   ```bash
   git clone https://github.com/Mr-ABX/MurMur.git
   cd MurMur
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run tauri dev
   ```

## 🛠️ Usage

1. Launch MurMur. You'll see the 🎙️ icon appear in your macOS menu bar.
2. Click the menu bar icon and select **Settings** to customize your experience and ensure the base AI model is downloaded.
3. Anywhere on your Mac, press and hold `Cmd + Shift + Space`.
4. The recording overlay will appear. Speak your prompt.
5. Release the hotkeys. MurMur will transcribe and automatically type the text into your active window.

## 🏗️ Tech Stack

- **Frontend:** React, TypeScript, TailwindCSS, Vite
- **Backend/Desktop:** Rust, Tauri v2
- **AI Engine:** `whisper.cpp` (via `whisper-rs`)
- **Audio Capture:** `cpal` with real-time linear downsampling
- **System Automation:** `tauri-plugin-clipboard-manager` & native AppleScript

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/Mr-ABX/MurMur/issues).

## 📄 License

This project is [MIT](https://opensource.org/licenses/MIT) licensed.
