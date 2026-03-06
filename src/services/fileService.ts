import { invoke } from "@tauri-apps/api/core";

export async function readNote(): Promise<string> {
  return await invoke<string>("read_note");
}

export async function writeNote(content: string): Promise<void> {
  await invoke<void>("write_note", { content });
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
