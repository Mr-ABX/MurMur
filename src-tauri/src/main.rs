// DopeNotch main.rs - bootstraps the Tauri app
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    dopenotch_lib::run();
}
