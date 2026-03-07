// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};
use serde::{Deserialize, Serialize};
use chrono::Utc;

const NOTE_FILENAME: &str = "initialNote.md";

// ---------------------------------------------------------------------------
// Frontmatter
// ---------------------------------------------------------------------------

#[derive(Debug, Serialize, Deserialize)]
struct Frontmatter {
    title: String,
    created: String,
    modified: String,
}

/// Returns the current UTC time formatted as `2006-01-02T15:04:05`.
fn now_iso() -> String {
    Utc::now().format("%Y-%m-%dT%H:%M:%S").to_string()
}

/// Splits a `---`-delimited YAML frontmatter block from the rest of `raw`.
///
/// Returns `Some((frontmatter, body))` when a valid block is found anchored
/// at the very start of the string, `None` otherwise (e.g. legacy files).
fn parse_frontmatter(raw: &str) -> Option<(Frontmatter, String)> {
    let after_open = raw.strip_prefix("---\n")?;

    let (yaml_str, body) = if let Some(pos) = after_open.find("\n---\n") {
        (&after_open[..pos], &after_open[pos + 5..])
    } else if after_open.ends_with("\n---") {
        (&after_open[..after_open.len() - 4], "")
    } else {
        return None;
    };

    let fm: Frontmatter = serde_yaml::from_str(yaml_str).ok()?;
    Some((fm, body.to_string()))
}

/// Serialises `fm` into a `---`-delimited YAML block ready to prepend to a file.
fn serialize_frontmatter(fm: &Frontmatter) -> String {
    let yaml = serde_yaml::to_string(fm).unwrap_or_default();
    format!("---\n{}---\n", yaml)
}

// ---------------------------------------------------------------------------
// NoteData — the payload read_note returns to the frontend
// ---------------------------------------------------------------------------

#[derive(Debug, Serialize)]
struct NoteData {
    title: String,
    body: String,
    created: String,
    modified: String,
}

// ---------------------------------------------------------------------------
// Path helpers
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Tauri commands
// ---------------------------------------------------------------------------

/// Reads the note, parses any frontmatter, and returns title + body separately.
/// If the file doesn't exist or has no frontmatter, empty defaults are returned.
#[tauri::command]
fn read_note(app: AppHandle) -> Result<NoteData, String> {
    let note_path = get_note_path(&app)?;

    if !note_path.exists() {
        return Ok(NoteData {
            title: String::new(),
            body: String::new(),
            created: String::new(),
            modified: String::new(),
        });
    }

    let raw = fs::read_to_string(&note_path).map_err(|e| e.to_string())?;

    if let Some((fm, body)) = parse_frontmatter(&raw) {
        Ok(NoteData {
            title: fm.title,
            body,
            created: fm.created,
            modified: fm.modified,
        })
    } else {
        // Legacy file with no frontmatter — treat raw content as body.
        Ok(NoteData {
            title: String::new(),
            body: raw,
            created: String::new(),
            modified: String::new(),
        })
    }
}

/// Writes the note with updated frontmatter.
/// Preserves the original `created` timestamp; always refreshes `modified`.
#[tauri::command]
fn write_note(app: AppHandle, title: String, content: String) -> Result<(), String> {
    let note_path = get_note_path(&app)?;

    if let Some(parent) = note_path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }

    // Preserve the original created timestamp if the file already has frontmatter.
    let created = if note_path.exists() {
        let raw = fs::read_to_string(&note_path).map_err(|e| e.to_string())?;
        parse_frontmatter(&raw)
            .map(|(fm, _)| fm.created)
            .unwrap_or_else(now_iso)
    } else {
        now_iso()
    };

    let fm = Frontmatter {
        title,
        created,
        modified: now_iso(),
    };

    let full = format!("{}{}", serialize_frontmatter(&fm), content);
    fs::write(&note_path, full).map_err(|e| e.to_string())
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
