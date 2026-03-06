// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

const NOTE_FILENAME: &str = "initialNote.md";

fn get_note_path(app: &AppHandle) -> Result<PathBuf, String> {
    let data_dir = app
        .path()
        .app_local_data_dir()
        .map_err(|e| e.to_string())?;
    Ok(data_dir.join(NOTE_FILENAME))
}

fn get_named_note_path(app: &AppHandle, filename: &str) -> Result<PathBuf, String> {
    let data_dir = app
        .path()
        .app_local_data_dir()
        .map_err(|e| e.to_string())?;
    Ok(data_dir.join(filename))
}

/// Reads the note from the app local data directory.
/// Returns an empty string if the note file does not yet exist.
#[tauri::command]
fn read_note(app: AppHandle) -> Result<String, String> {
    let note_path = get_note_path(&app)?;
    if note_path.exists() {
        fs::read_to_string(&note_path).map_err(|e| e.to_string())
    } else {
        Ok(String::new())
    }
}

/// Writes the provided content to the note file in the app local data directory.
/// Creates the directory if it does not exist.
#[tauri::command]
fn write_note(app: AppHandle, content: String) -> Result<(), String> {
    let note_path = get_note_path(&app)?;
    if let Some(parent) = note_path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    fs::write(&note_path, content).map_err(|e| e.to_string())
}

/// Renames the note file. old_filename and new_filename are just the file
/// names (e.g. "My Note.md"), not full paths. The data directory is resolved
/// on the Rust side so the frontend never constructs absolute paths.
#[tauri::command]
fn rename_note(app: AppHandle, old_filename: String, new_filename: String) -> Result<(), String> {
    let old_path = get_named_note_path(&app, &old_filename)?;
    let new_path = get_named_note_path(&app, &new_filename)?;

    if !old_path.exists() {
        return Err(format!("Source file does not exist: {}", old_filename));
    }
    if new_path.exists() {
        return Err(format!("A note named '{}' already exists.", new_filename));
    }

    fs::rename(&old_path, &new_path).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![read_note, write_note, rename_note])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
