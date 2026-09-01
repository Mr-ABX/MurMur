// Murmur - Main Tauri Entry Point (Tauri 2.x)
// Initializes the app, system tray, global hotkeys, and all plugins.

mod audio;
mod commands;
mod model_manager;
mod overlay;
mod settings;
mod transcriber;
mod voxcoder;
mod screen_assistant;

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
        .plugin(tauri_plugin_dialog::init())
        .on_window_event(|window, event| match event {
            tauri::WindowEvent::CloseRequested { api, .. } => {
                if window.label() == "settings" {
                    window.hide().unwrap();
                    api.prevent_close();
                }
            }
            _ => {}
        })
        .setup(|app| {
            let settings = AppSettings::load_or_default();
            let transcriber_state = TranscriberState::new(&settings.model);

            let murmur_state = MurmurState {
                settings: Arc::new(Mutex::new(settings.clone())),
                transcriber: Arc::new(Mutex::new(transcriber_state)),
                is_recording: Arc::new(Mutex::new(false)),
            };

            app.manage(murmur_state);

            #[cfg(target_os = "macos")]
            {
                if settings.show_dock_icon {
                    app.set_activation_policy(tauri::ActivationPolicy::Regular);
                } else {
                    app.set_activation_policy(tauri::ActivationPolicy::Accessory);
                }
            }
            
            if settings.visibility_mode == crate::settings::VisibilityMode::AlwaysOn {
                overlay::show_visualizer(app.handle(), &settings);
            }

            // Build system tray menu
            let settings_item = MenuItem::with_id(app, "settings", "Settings", true, None::<&str>)?;
            let separator = PredefinedMenuItem::separator(app)?;
            let quit_item = MenuItem::with_id(app, "quit", "Quit Murmur", true, None::<&str>)?;

            let menu = Menu::with_items(app, &[&settings_item, &separator, &quit_item])?;

            // Load tray icon
            let tray_icon_bytes = match settings.tray_icon_style {
                crate::settings::TrayIconStyle::Flat => include_bytes!("../icons/tray-flat.png").as_slice(),
                crate::settings::TrayIconStyle::Color => include_bytes!("../icons/tray.png").as_slice(),
            };
            let tray_icon = tauri::image::Image::from_bytes(tray_icon_bytes)
                .unwrap_or_else(|_| app.default_window_icon().cloned().unwrap());

            // Build tray icon
            let _tray = TrayIconBuilder::with_id("main")
                .icon(tray_icon)
                .icon_as_template(settings.tray_icon_style == crate::settings::TrayIconStyle::Flat)
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
            commands::open_settings,
            commands::start_recording,
            commands::stop_recording,
            commands::get_settings,
            commands::save_settings,
            commands::get_downloaded_models,
            commands::download_model,
            commands::get_downloaded_gemma_models,
            commands::download_gemma_model_cmd,
            commands::delete_gemma_model,
            model_manager::delete_model_file,
            model_manager::open_models_directory,
            commands::clear_all_app_data,
            commands::quit_app,
            commands::get_voice_history,
            commands::delete_voice_history_item,
            commands::clear_voice_history,
            screen_assistant::capture_screen_base64,
            screen_assistant::ask_screen_assistant,
            commands::set_notch_expanded,
        ])
        .run(tauri::generate_context!())
        .expect("error while running murmur");
}

fn setup_global_shortcut(app: &AppHandle, hotkey: &str) {
    let app_clone = app.clone();

    if let Err(e) = app.global_shortcut().on_shortcut(hotkey, move |_app, _shortcut, event| {
        let state = app_clone.state::<MurmurState>();
        let settings = state.settings.lock().unwrap().clone();
        let is_hold_mode = settings.activation_mode == crate::settings::ActivationMode::Hold;

        match event.state() {
            ShortcutState::Pressed => {
                let is_rec = *state.is_recording.lock().unwrap();
                let app_c = app_clone.clone();

                if is_hold_mode {
                    // Push-to-Talk (Hold): Start recording when key is pressed down
                    if !is_rec {
                        tauri::async_runtime::spawn(async move {
                            if let Err(e) = commands::start_recording_internal(&app_c).await {
                                log::error!("Failed to start recording: {}", e);
                            }
                        });
                    }
                } else {
                    // Toggle Mode: Press once to Start, Press again to Stop & Paste
                    tauri::async_runtime::spawn(async move {
                        if is_rec {
                            if let Err(e) = commands::stop_recording_internal(&app_c).await {
                                log::error!("Failed to stop recording: {}", e);
                            }
                        } else {
                            if let Err(e) = commands::start_recording_internal(&app_c).await {
                                log::error!("Failed to start recording: {}", e);
                            }
                        }
                    });
                }
            }
            ShortcutState::Released => {
                if is_hold_mode {
                    // Push-to-Talk (Hold): Stop and paste when key is released
                    let is_rec = *state.is_recording.lock().unwrap();
                    if is_rec {
                        let app_c = app_clone.clone();
                        tauri::async_runtime::spawn(async move {
                            if let Err(e) = commands::stop_recording_internal(&app_c).await {
                                log::error!("Failed to stop recording on release: {}", e);
                            }
                        });
                    }
                }
                // In Toggle mode: do nothing on key release!
            }
        }
    }) {
        log::error!("Failed to register global shortcut '{}': {}", hotkey, e);
        let fallback = "CommandOrControl+Shift+Space";
        if hotkey != fallback {
            log::info!("Falling back to default global shortcut '{}'", fallback);
            setup_global_shortcut(app, fallback);
        }
    } else {
        log::info!("Registered global shortcut: {}", hotkey);
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_sanity_check() {
        assert_eq!(1 + 1, 2);
    }
}
