// overlay.rs - Controls overlay and settings window visibility

use tauri::{AppHandle, Manager};
use crate::settings::AppSettings;

/// Show the appropriate visualizer window based on settings
pub fn show_visualizer(app: &AppHandle, settings: &AppSettings) {
    // We don't want to hide if AlwaysOn, but we might be switching visualizer types.
    // For now, let's just forcefully hide the others that are NOT the active one.
    if settings.widget_pet_enabled {
        if let Some(w) = app.get_webview_window("overlay") { let _ = w.hide(); }
        if let Some(w) = app.get_webview_window("notch") { let _ = w.hide(); }
    } else if settings.widget_notch_enabled {
        if let Some(w) = app.get_webview_window("overlay") { let _ = w.hide(); }
        if let Some(w) = app.get_webview_window("widget") { let _ = w.hide(); }
    } else {
        if let Some(w) = app.get_webview_window("notch") { let _ = w.hide(); }
        if let Some(w) = app.get_webview_window("widget") { let _ = w.hide(); }
    }

    if settings.widget_pet_enabled {
        if let Some(window) = app.get_webview_window("widget") {
            let _ = window.show();
        }
    } else if settings.widget_notch_enabled {
        if let Some(window) = app.get_webview_window("notch") {
            let _ = window.set_always_on_top(true);
            let _ = window.set_visible_on_all_workspaces(true);

            // Show window first so window is initialized by Tauri
            let _ = window.show();

            #[cfg(target_os = "macos")]
            {
                use objc2::msg_send;
                use objc2::runtime::{AnyObject, AnyClass, Sel};
                use objc2::ffi::class_replaceMethod;

                #[repr(C)]
                #[derive(Clone, Copy)]
                struct NSPoint { x: f64, y: f64 }

                #[repr(C)]
                #[derive(Clone, Copy)]
                struct NSSize { width: f64, height: f64 }

                #[repr(C)]
                #[derive(Clone, Copy)]
                struct NSRect { origin: NSPoint, size: NSSize }

                unsafe impl objc2::Encode for NSPoint {
                    const ENCODING: objc2::Encoding = objc2::Encoding::Struct(
                        "CGPoint",
                        &[<f64 as objc2::Encode>::ENCODING, <f64 as objc2::Encode>::ENCODING],
                    );
                }
                unsafe impl objc2::Encode for NSSize {
                    const ENCODING: objc2::Encoding = objc2::Encoding::Struct(
                        "CGSize",
                        &[<f64 as objc2::Encode>::ENCODING, <f64 as objc2::Encode>::ENCODING],
                    );
                }
                unsafe impl objc2::Encode for NSRect {
                    const ENCODING: objc2::Encoding = objc2::Encoding::Struct(
                        "CGRect",
                        &[<NSPoint as objc2::Encode>::ENCODING, <NSSize as objc2::Encode>::ENCODING],
                    );
                }

                unsafe extern "C" fn unconstrained_constrain_frame_rect(
                    _this: *mut AnyObject,
                    _cmd: Sel,
                    frame_rect: NSRect,
                    _screen: *mut AnyObject,
                ) -> NSRect {
                    frame_rect
                }

                let window_clone = window.clone();
                let _ = app.run_on_main_thread(move || {
                    if let Ok(ns_win) = window_clone.ns_window() {
                        let ns_win = ns_win as *mut AnyObject;
                        unsafe {
                            // Level 1000 = NSScreenSaverWindowLevel (floats ON TOP of menu bar text, icons, and fullscreen apps)
                            let _: () = msg_send![ns_win, setLevel: 1000i64];
                            // CanJoinAllSpaces(1) | Stationary(16) | IgnoresCycle(64) | FullScreenAuxiliary(256) = 337
                            let _: () = msg_send![ns_win, setCollectionBehavior: 337u64];

                            // Override constrainFrameRect:toScreen: so Cocoa won't clamp Y to visibleFrame (below menu bar)
                            let class: *const AnyClass = msg_send![ns_win, class];
                            let sel_name = b"constrainFrameRect:toScreen:\0";
                            let sel_ptr = objc2::ffi::sel_registerName(sel_name.as_ptr() as *const _);
                            let types = b"{CGRect={CGPoint=dd}{CGSize=dd}}@:{CGRect={CGPoint=dd}{CGSize=dd}}@\0";
                            let imp: unsafe extern "C-unwind" fn() = std::mem::transmute(
                                unconstrained_constrain_frame_rect as unsafe extern "C" fn(*mut AnyObject, Sel, NSRect, *mut AnyObject) -> NSRect
                            );
                            class_replaceMethod(
                                class as *mut _,
                                sel_ptr.unwrap(),
                                imp,
                                types.as_ptr() as *const _,
                            );

                            // Get full screen frame (NOT visibleFrame — visibleFrame excludes menu bar)
                            let screen: *mut AnyObject = msg_send![ns_win, screen];
                            if !screen.is_null() {
                                let screen_frame: NSRect = msg_send![screen, frame];
                                let win_frame: NSRect = msg_send![ns_win, frame];

                                // Target frame: centered horizontally, flush against top edge of physical screen
                                let target_frame = NSRect {
                                    origin: NSPoint {
                                        x: screen_frame.origin.x + (screen_frame.size.width - win_frame.size.width) / 2.0,
                                        y: screen_frame.origin.y + screen_frame.size.height - win_frame.size.height,
                                    },
                                    size: win_frame.size,
                                };

                                let _: () = msg_send![ns_win, setFrame: target_frame, display: true];
                            }
                        }
                    }
                });
            }

            #[cfg(not(target_os = "macos"))]
            {
                let monitor = app.primary_monitor().ok().flatten()
                    .or_else(|| window.primary_monitor().ok().flatten());

                if let Some(monitor) = monitor {
                    let scale = monitor.scale_factor();
                    let screen_w = monitor.size().width as f64 / scale;
                    let notch_w = 250.0_f64;
                    let x = (screen_w - notch_w) / 2.0;

                    let target_x = (x * scale) as i32;
                    let _ = window.set_position(tauri::PhysicalPosition::new(target_x, 0));
                }
            }
        }

    } else {
        // Fallback to overlay
        if let Some(window) = app.get_webview_window("overlay") {
            let monitor = app.primary_monitor().ok().flatten()
                .or_else(|| window.primary_monitor().ok().flatten());

            if let Some(monitor) = monitor {
                let screen_size = monitor.size();
                let scale = monitor.scale_factor();
                let screen_w = screen_size.width as f64 / scale;
                let screen_h = screen_size.height as f64 / scale;

                let overlay_w = 500.0;
                let overlay_h = 160.0;

                let x = (screen_w - overlay_w) / 2.0;
                let y = screen_h - overlay_h - 100.0;

                let _ = window.set_position(tauri::PhysicalPosition::new(
                    (x * scale) as i32,
                    (y * scale) as i32,
                ));
            }
            let _ = window.show();
        }
    }
}

/// Hide all visualizer windows if the setting is AutoHidden
pub fn hide_visualizers(app: &AppHandle, settings: &AppSettings) {
    if settings.visibility_mode == crate::settings::VisibilityMode::AlwaysOn {
        return; // Do not hide windows if always on
    }

    if let Some(window) = app.get_webview_window("overlay") {
        let _ = window.hide();
    }
    if let Some(window) = app.get_webview_window("notch") {
        let _ = window.hide();
    }
    if let Some(window) = app.get_webview_window("widget") {
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
