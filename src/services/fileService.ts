import { invoke } from "@tauri-apps/api/core";

export interface NoteData {
  title: string;
  body: string;
  created: string;
  modified: string;
}

export interface NoteMetadata {
  filename: string;
  title: string;
  modified: string;
}

export async function createNote(): Promise<string> {
  return await invoke<string>("create_note");
}

export async function listNotes(): Promise<NoteMetadata[]> {
  return await invoke<NoteMetadata[]>("list_notes");
}

export async function readNote(filename: string): Promise<NoteData> {
  return await invoke<NoteData>("read_note", { filename });
}

export async function writeNote(
  filename: string,
  title: string,
  content: string,
): Promise<void> {
  await invoke<void>("write_note", { filename, title, content });
}

export async function deleteNote(filename: string): Promise<void> {
  await invoke<void>("delete_note", { filename });
}

export async function renameNote(
  oldFilename: string,
  newFilename: string,
): Promise<void> {
  await invoke<void>("rename_note", {
    oldFilename,
    newFilename,
  });
}
