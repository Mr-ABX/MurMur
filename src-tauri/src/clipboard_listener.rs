// clipboard_listener.rs - Native background system clipboard monitor and persistence
use std::sync::{Arc, Mutex};
use tauri::{AppHandle, Emitter};
use tauri_plugin_clipboard_manager::ClipboardExt;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClipboardItemPayload {
    pub id: String,
    pub content: String,
    pub category: String,
    pub timestamp: String,
    pub timestamp_raw: i64,
    pub source_app: String,
    pub char_count: usize,
    pub word_count: usize,
    pub is_pinned: bool,
}

#[cfg(target_os = "macos")]
pub fn get_frontmost_app_name() -> String {
    use objc2::msg_send;
    use objc2::runtime::AnyObject;
    use std::ffi::CStr;

    unsafe {
        let ws_cls = objc2::ffi::objc_getClass(b"NSWorkspace\0".as_ptr() as *const _);
        if ws_cls.is_null() {
            return "Clipboard".to_string();
        }
        let ws: *mut AnyObject = msg_send![ws_cls as *mut AnyObject, sharedWorkspace];
        if ws.is_null() {
            return "Clipboard".to_string();
        }
        let front_app: *mut AnyObject = msg_send![ws, frontmostApplication];
        if front_app.is_null() {
            return "Clipboard".to_string();
        }
        let name_ns: *mut AnyObject = msg_send![front_app, localizedName];
        if name_ns.is_null() {
            return "Clipboard".to_string();
        }
        let utf8: *const std::os::raw::c_char = msg_send![name_ns, UTF8String];
        if !utf8.is_null() {
            if let Ok(s) = CStr::from_ptr(utf8).to_str() {
                return s.to_string();
            }
        }
    }
    "Clipboard".to_string()
}

#[cfg(not(target_os = "macos"))]
pub fn get_frontmost_app_name() -> String {
    "Clipboard".to_string()
}

/// Detect item category based on text patterns
pub fn detect_category(text: &str) -> String {
    let trimmed = text.trim();
    
    // 1. Color check (Hex #RGB, #RRGGBB, #RRGGBBAA or rgb(...))
    if (trimmed.starts_with('#') && (trimmed.len() == 4 || trimmed.len() == 7 || trimmed.len() == 9) && trimmed[1..].chars().all(|c| c.is_ascii_hexdigit()))
        || (trimmed.starts_with("rgb(") && trimmed.ends_with(')'))
        || (trimmed.starts_with("rgba(") && trimmed.ends_with(')')) {
        return "color".to_string();
    }

    // 2. Link check
    if trimmed.starts_with("http://") || trimmed.starts_with("https://") {
        return "link".to_string();
    }

    // 3. Code check
    if (trimmed.contains("const ") || trimmed.contains("let ") || trimmed.contains("var ")
        || trimmed.contains("function ") || trimmed.contains("def ") || trimmed.contains("import ")
        || trimmed.contains("class ") || trimmed.contains("fn ") || trimmed.contains("pub ")
        || trimmed.contains("return ") || trimmed.contains("=>") || trimmed.contains("console.log")
        || (trimmed.contains('{') && trimmed.contains('}'))
        || (trimmed.contains('<') && trimmed.contains('>'))
        || trimmed.starts_with("git ") || trimmed.starts_with("npm ") || trimmed.starts_with("cargo "))
        && (trimmed.contains('\n') || trimmed.len() > 15) {
        return "code".to_string();
    }

    "clipboard".to_string()
}

/// Path to persistent clipboard storage JSON
fn clipboard_storage_path() -> std::path::PathBuf {
    let mut dir = dirs::data_dir().unwrap_or_else(|| std::path::PathBuf::from("."));
    dir.push("Murmur");
    let _ = std::fs::create_dir_all(&dir);
    dir.push("clipboard_history.json");
    dir
}

pub fn load_saved_clipboard() -> Vec<ClipboardItemPayload> {
    let path = clipboard_storage_path();
    if path.exists() {
        if let Ok(data) = std::fs::read_to_string(&path) {
            if let Ok(items) = serde_json::from_str::<Vec<ClipboardItemPayload>>(&data) {
                return items;
            }
        }
    }
    Vec::new()
}

pub fn save_clipboard_to_disk(items: &[ClipboardItemPayload]) {
    let path = clipboard_storage_path();
    if let Ok(json) = serde_json::to_string_pretty(items) {
        let _ = std::fs::write(path, json);
    }
}

/// Starts background thread to monitor OS clipboard changes live
pub fn start_clipboard_monitor(app_handle: AppHandle) {
    tauri::async_runtime::spawn(async move {
        let last_text = Arc::new(Mutex::new(String::new()));
        
        // Prime last_text with current clipboard so app start doesn't trigger spurious change
        if let Ok(initial_text) = app_handle.clipboard().read_text() {
            *last_text.lock().unwrap() = initial_text;
        }

        loop {
            tokio::time::sleep(tokio::time::Duration::from_millis(250)).await;

            if let Ok(current_text) = app_handle.clipboard().read_text() {
                let trimmed = current_text.trim();
                if trimmed.is_empty() {
                    continue;
                }

                let mut last = last_text.lock().unwrap();
                if *last != trimmed {
                    *last = trimmed.to_string();
                    drop(last);

                    let source_app = get_frontmost_app_name();
                    let category = detect_category(trimmed);
                    let now = chrono::Utc::now().timestamp_millis();
                    let char_count = trimmed.chars().count();
                    let word_count = trimmed.split_whitespace().count();

                    let item = ClipboardItemPayload {
                        id: format!("clip-{}", now),
                        content: trimmed.to_string(),
                        category,
                        timestamp: "Just now".to_string(),
                        timestamp_raw: now,
                        source_app,
                        char_count,
                        word_count,
                        is_pinned: false,
                    };

                    // Persist to disk
                    let mut saved = load_saved_clipboard();
                    // Remove duplicate
                    saved.retain(|c| c.content != item.content);
                    saved.insert(0, item.clone());
                    if saved.len() > 300 {
                        saved.truncate(300);
                    }
                    save_clipboard_to_disk(&saved);

                    // Broadcast live update to all windows & notch
                    let _ = app_handle.emit("murmur://clipboard-changed", &item);
                    let _ = app_handle.emit_to("notch", "murmur://clipboard-changed", &item);
                    let _ = app_handle.emit_to("settings", "murmur://clipboard-changed", &item);
                    let _ = app_handle.emit_to("overlay", "murmur://clipboard-changed", &item);
                }
            }
        }
    });
}
