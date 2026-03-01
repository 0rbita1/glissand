import { invoke } from "@tauri-apps/api/core";

/**
 * Reads the single note from the app local data directory.
 * Returns an empty string on the first run (no file yet).
 */
export async function readNote(): Promise<string> {
  return await invoke<string>("read_note");
}

/**
 * Persists the note content to the app local data directory.
 * The note is stored as `initialNote.md`.
 */
export async function writeNote(content: string): Promise<void> {
  await invoke<void>("write_note", { content });
}
