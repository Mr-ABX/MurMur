<div align="center">
  <img src="assets/logo-animated.svg" alt="MurMur Animated Logo" width="190" height="190">
  <h1>MurMur: Ambient AI Voice & Assistant Operating System 🎙️⚡</h1>
  <p><strong>Lightning-fast local Whisper dictation, Dynamic Notch overlay, and screen-aware AI assistant for macOS & Windows.</strong></p>

  [![Version: v0.2.0](https://img.shields.io/badge/Version-v0.2.0-8b5cf6.svg?style=flat-square)](https://github.com/Mr-ABX/MurMur/releases/tag/v0.2.0)
  [![License: MIT](https://img.shields.io/badge/License-MIT-7c6df2.svg?style=flat-square)](https://opensource.org/licenses/MIT)
  [![Platform: macOS | Windows](https://img.shields.io/badge/Platform-macOS%20%7C%20Windows-5dd99e.svg?style=flat-square)]()
  [![Tauri v2](https://img.shields.io/badge/Built%20with-Tauri%20v2-f06ba0.svg?style=flat-square)](https://tauri.app/)
  [![Whisper.cpp](https://img.shields.io/badge/Powered%20by-Whisper.cpp-c4b5fd.svg?style=flat-square)](https://github.com/ggerganov/whisper.cpp)
  [![Latest Release](https://img.shields.io/github/v/release/Mr-ABX/MurMur?style=flat-square&color=indigo)](https://github.com/Mr-ABX/MurMur/releases/latest)
</div>

---

## 🌟 Overview

**MurMur** is the ultimate ambient voice intelligence and AI prompting assistant designed for developers, writers, and power users. Instead of typing out massive prompts for ChatGPT, Claude, or Cursor, simply hold your hotkey, speak naturally, and let MurMur transcribe, format, and auto-paste text directly into your active window.

With **v0.2.0**, MurMur evolves into a full desktop AI operating system featuring an interactive **Dynamic Notch**, a multi-page workspace, trackpad gesture navigation, a **Screen-Aware AI Assistant**, and a **Natural Language Voice Intent Router**.

---

## ✨ What's New & Core Features

- **⚡ Dynamic Notch & Island Overlay:** Floating minimal AI audio wave that smoothly expands into a 3-page workspace (`Controls`, `AI Assistant`, `Voice Notes`).
- **👆 Horizontal Trackpad Swipe Navigation:** Swipe left or right on your trackpad or mouse wheel to switch between pages effortlessly.
- **🤖 Screen-Aware AI Assistant:** Instant multi-monitor screen capture analyzed via **Google Gemini 2.0 Flash** or local **Gemma** models.
- **🎙️ Natural Language Voice Intent Router:** Speak *"Hey MurMur, take a note: ..."* or *"Add task: ..."* and MurMur automatically routes and stores the action.
- **🚀 100% Local & Private Whisper Dictation:** Zero-cloud-latency speech transcription powered by `whisper.cpp` running directly on your CPU/GPU.
- **⌨️ Universal Auto-Paste:** Press `Cmd + Shift + Space` (Mac) or `Ctrl + Shift + Space` (Win), speak, release, and text is instantly typed into any app (IDE, Browser, Slack, Terminal).
- **💻 VoxCoder Mode:** Formats spoken code into structured identifiers (`camelCase`, `snake_case`, punctuation, syntax).
- **🪟 Cross-Platform CI/CD:** Automated builds for macOS (`.dmg`) and Windows (`.exe` / `.msi`).

---

## 📥 Download & Installation

Download the latest pre-compiled installer for your operating system:

👉 **[Download MurMur from GitHub Releases](https://github.com/Mr-ABX/MurMur/releases/latest)**

- **macOS:** Download **`Murmur_0.2.0_x64.dmg`**, open the `.dmg`, and drag MurMur into `/Applications`.
- **Windows:** Download **`Murmur_0.2.0_x64-setup.exe`** or **`.msi`** installer.
3. Install and run! (You may need to allow accessibility/microphone permissions on first launch).

---

## 🛠️ Usage

1. **Launch MurMur.** You'll see the 🎙️ icon appear in your system tray / macOS menu bar.
2. Click the icon and select **Settings** to customize your experience and ensure the base AI model is downloaded.
3. Anywhere on your computer, press and hold `Cmd + Shift + Space` (Mac) or `Ctrl + Shift + Space` (Win/Linux).
4. **The recording overlay will appear.** Speak your prompt naturally.
5. **Release the hotkeys.** MurMur will transcribe and automatically paste the text directly into your active window!

---

## 🏗️ For Developers: Build from Source

If you want to contribute or build MurMur yourself, you're in the right place!

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Mr-ABX/MurMur.git
   cd MurMur
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Run the development server:**
   ```bash
   npm run tauri dev
   ```
4. **Build the production app (DMG, EXE, etc):**
   ```bash
   npm run tauri build
   ```

*MurMur's Stack:*
- **Frontend:** React, TypeScript, TailwindCSS, Vite
- **Backend/Desktop:** Rust, Tauri v2
- **AI Engine:** `whisper.cpp` (via `whisper-rs`)
- **Audio Capture:** `cpal` with real-time linear downsampling
- **System Automation:** `tauri-plugin-clipboard-manager` & native Enigo

## 🤝 Contributing

Contributions, issues, and feature requests are highly welcome! Feel free to check the [issues page](https://github.com/Mr-ABX/MurMur/issues). If you have a great idea, fork the repo and submit a PR.

## 📄 License

This project is [MIT](https://opensource.org/licenses/MIT) licensed.
