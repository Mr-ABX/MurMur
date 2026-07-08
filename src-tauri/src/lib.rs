// Murmur - Main Tauri Entry Point (Tauri 2.x)
// Initializes the app, system tray, global hotkeys, and all plugins.

mod audio;
mod commands;
mod model_manager;
mod overlay;
mod settings;
mod transcriber;
mod voxcoder;

use std::sync::{Arc, Mutex};
use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Manager,
};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, ShortcutState};

use crate::settings::AppSettings;
use crate::transcriber::TranscriberState;

/// Shared application state passed to all Tauri commands
pub struct MurmurState {
    pub settings: Arc<Mutex<AppSettings>>,
    pub transcriber: Arc<Mutex<TranscriberState>>,
    pub is_recording: Arc<Mutex<bool>>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info")).init();

    tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .setup(|app| {
            let settings = AppSettings::load_or_default();
            let transcriber_state = TranscriberState::new(&settings.model);

            let murmur_state = MurmurState {
                settings: Arc::new(Mutex::new(settings.clone())),
                transcriber: Arc::new(Mutex::new(transcriber_state)),
                is_recording: Arc::new(Mutex::new(false)),
            };

            app.manage(murmur_state);

            // Build system tray menu
            let settings_item = MenuItem::with_id(app, "settings", "Settings", true, None::<&str>)?;
            let separator = PredefinedMenuItem::separator(app)?;
            let quit_item = MenuItem::with_id(app, "quit", "Quit Murmur", true, None::<&str>)?;

            let menu = Menu::with_items(app, &[&settings_item, &separator, &quit_item])?;

            // Build tray icon
            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().cloned().unwrap())
                .menu(&menu)
                .tooltip("Murmur — Press ⌘⇧Space to record")
                .on_menu_event(|app_handle, event| {
                    match event.id().as_ref() {
                        "settings" => {
                            overlay::show_settings_window(app_handle);
                        }
                        "quit" => {
                            std::process::exit(0);
                        }
                        _ => {}
                    }
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        overlay::toggle_tray_popover(tray.app_handle());
                    }
                })
                .build(app)?;

            // Register global hotkey
            let app_handle = app.handle().clone();
            let hotkey = settings.hotkey.clone();
            setup_global_shortcut(&app_handle, &hotkey);

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::start_recording,
            commands::stop_recording,
            commands::get_settings,
            commands::save_settings,
            commands::get_downloaded_models,
            commands::download_model,
            commands::quit_app,
        ])
        .run(tauri::generate_context!())
        .expect("error while running murmur");
}

fn setup_global_shortcut(app: &AppHandle, hotkey: &str) {
    let app_clone = app.clone();

    if let Err(e) = app.global_shortcut().on_shortcut(hotkey, move |_app, _shortcut, event| {
        match event.state() {
            ShortcutState::Pressed => {
                let app_c = app_clone.clone();
                tauri::async_runtime::spawn(async move {
                    if let Err(e) = commands::start_recording_internal(&app_c).await {
                        log::error!("Failed to start recording: {}", e);
                    }
                });
            }
            ShortcutState::Released => {
                let app_c = app_clone.clone();
                tauri::async_runtime::spawn(async move {
                    if let Err(e) = commands::stop_recording_internal(&app_c).await {
                        log::error!("Failed to stop recording: {}", e);
                    }
                });
            }
        }
    }) {
        log::error!("Failed to register global shortcut '{}': {}", hotkey, e);
    } else {
        log::info!("Registered global shortcut: {}", hotkey);
    }
}
