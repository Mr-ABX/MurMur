<div align="center">
  <img src="app-icon.png" alt="MurMur App Icon" width="130" height="130">
  <h1>MurMur: Ambient AI Voice & Assistant Operating System 🎙️⚡</h1>
  <p><strong>Lightning-fast local Whisper dictation, Dynamic Notch overlay, and screen-aware AI assistant for macOS & Windows.</strong></p>

  [![Version: v0.3.0](https://img.shields.io/badge/Version-v0.3.0-8b5cf6.svg?style=flat-square&logo=github)](https://github.com/Mr-ABX/MurMur/releases/tag/v0.3.0)
  [![Release: Download](https://img.shields.io/badge/Release-Download%20Installer-5dd99e.svg?style=flat-square&logo=apple)](https://github.com/Mr-ABX/MurMur/releases/latest)
  [![License: MIT](https://img.shields.io/badge/License-MIT-7c6df2.svg?style=flat-square)](https://opensource.org/licenses/MIT)
  [![Platform: macOS | Windows](https://img.shields.io/badge/Platform-macOS%20%7C%20Windows-38bdf8.svg?style=flat-square)]()
  [![Tauri v2](https://img.shields.io/badge/Built%20with-Tauri%20v2-f06ba0.svg?style=flat-square)](https://tauri.app/)
  [![Whisper.cpp](https://img.shields.io/badge/Powered%20by-Whisper.cpp-c4b5fd.svg?style=flat-square)](https://github.com/ggerganov/whisper.cpp)
</div>

<br>

<div align="center">
  <img src="assets/demo.gif" alt="MurMur Dynamic Notch Demo Preview" width="100%" style="border-radius: 14px; box-shadow: 0 12px 36px rgba(0,0,0,0.6);">
</div>

---

> [!NOTE]
> ### 🚀 MurMur v0.3.0 Release
> **MurMur v0.3.0 is live with major upgrades:**
> 
> - 🏝️ **Dynamic Island & MacBook Notch**: Smooth fluid spring physics, Apple Intelligence glowing sinusoidal AI wave, and auto-hidden activation.
> - ⚡ **Native CoreAudio 60 FPS Audio Engine**: Sub-millisecond RMS level streaming from Rust to UI with 0ms visual latency.
> - 🎙️ **100% Local Whisper Voice Dictation**: Instant auto-paste into active apps (`Option+Space` / custom shortcut).
> - 🧑‍💻 **VoxCoder Mode**: Smart voice formatting for developers (`camelCase`, `snake_case`, brackets, symbols).
> - 🤖 **Screen AI Assistant & Notes**: Screen context capture + voice notes and task routing.
> - 🛠️ **Upcoming in Future Roadmap**:
>   - Built-in embedded GGUF engine for 100% offline assistant reasoning.
>   - Customizable global hotkey manager.
>   - Auto-updater service for macOS & Windows.
> 
> 💬 *Found a bug or have a suggestion? We'd love to hear from you! Please [open an Issue](https://github.com/Mr-ABX/MurMur/issues) or join the discussion.*

---

## 💡 The 100% Free, Private & Ultra-Lightweight Wispr Flow Alternative

Tired of expensive **\$15–\$20/month subscriptions**, cloud audio logging, and heavy background apps that hog your CPU and RAM?

**MurMur** is built from the ground up as a **100% free, forever open-source, and hardware-accelerated alternative** to proprietary tools like Wispr Flow, Superwhisper, and MacWhisper Pro.

| Feature | 🎙️ **MurMur** | ☁️ **Wispr Flow** | 🏷️ **Superwhisper** | 🍎 **MacWhisper Pro** |
| :--- | :---: | :---: | :---: | :---: |
| **Pricing** | **100% Free & Open Source** | \$15 / month | \$8.99 / mo or \$199 | €29 – €49 (Pro) |
| **Audio Privacy** | **100% Local (Never leaves device)** | Sent to Cloud | Hybrid / Local | Local |
| **Disk Footprint** | **~150 MB (Base model)** | 500 MB+ | 1.2 GB+ | 1.5 GB+ |
| **RAM Usage** | **~35 MB Idle (~120MB Peak)** | ~250 MB+ | ~400 MB+ | ~500 MB+ |
| **Universal Auto-Paste** | **Instant (Zero popups)** | Yes | Yes | Manual / Dictation |
| **Dynamic Notch & Island** | **Interactive 3-Page Workspace** | None | None | None |
| **Screen-Aware AI Assistant** | **Multi-Monitor Vision AI** | None | None | None |
| **Platform Support** | **macOS & Windows** | macOS only | macOS only | macOS only |

### 🚀 Why Creators & Developers Choose MurMur:

- 💸 **100% Free Forever**: No subscriptions, no hidden token limits, no paywalls, and no credit card required.
- 🪶 **Ultra-Lightweight (~150 MB Disk & ~35 MB Idle RAM)**: Unlike heavy Electron or Python apps, MurMur is compiled natively with **Rust & Tauri v2**, consuming negligible system memory so your computer stays blazing fast.
- ⚡ **Seamless "Type Anywhere" Dictation**: Hold your hotkey (`Cmd+Shift+Space` or `Ctrl+Shift+Space`), speak naturally at 150+ words per minute, and release. MurMur instantly types your words directly into Cursor, VS Code, Slack, Notion, Claude, or ChatGPT without intrusive windows getting in your way.
- 🧠 **Smart AI Voice Prompting & Notes**: Formats raw speech into clean code identifiers, structured LLM prompts, or automatically saves voice notes to your local workspace tab whenever you say *"Hey MurMur, take a note: ..."*.
- 🖥️ **Screen-Aware Vision Assistant**: Press one button to take a multi-monitor screen snapshot and ask Gemini 2.0 Flash or local Gemma to explain errors, summarize text, or draft responses.

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
