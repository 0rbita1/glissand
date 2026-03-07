import { invoke } from "@tauri-apps/api/core";

export interface NoteData {
  title: string;
  body: string;
  created: string;
  modified: string;
}

export async function readNote(): Promise<NoteData> {
  return await invoke<NoteData>("read_note");
}

export async function writeNote(title: string, content: string): Promise<void> {
  await invoke<void>("write_note", { title, content });
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
