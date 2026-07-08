// overlay.rs - Controls overlay and settings window visibility

use tauri::{AppHandle, Manager};

/// Show the recording overlay window, positioned at the bottom center of the screen
pub fn show_overlay(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("overlay") {
        // Get the primary monitor size
        if let Ok(Some(monitor)) = window.primary_monitor() {
            let screen_size = monitor.size();
            let scale = monitor.scale_factor();
            let screen_w = screen_size.width as f64 / scale;
            let screen_h = screen_size.height as f64 / scale;

            let overlay_w = 500.0;
            let overlay_h = 160.0;

            let x = (screen_w - overlay_w) / 2.0;
            let y = screen_h - overlay_h - 100.0; // 100px from bottom

            let _ = window.set_position(tauri::PhysicalPosition::new(
                (x * scale) as i32,
                (y * scale) as i32,
            ));
        }

        let _ = window.show();
    }
}

/// Hide the recording overlay window
#[allow(dead_code)]
pub fn hide_overlay(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("overlay") {
        let _ = window.hide();
    }
}

/// Show the settings panel window
pub fn show_settings_window(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("settings") {
        let _ = window.show();
        let _ = window.set_focus();
        let _ = window.center();
    }
}

/// Toggle tray popover (for now, opens settings — can be enhanced with a tray popup)
pub fn toggle_tray_popover(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("settings") {
        if window.is_visible().unwrap_or(false) {
            let _ = window.hide();
        } else {
            show_settings_window(app);
        }
    }
}
