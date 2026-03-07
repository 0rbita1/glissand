import { useEffect, useRef } from "react";
import { writeNote } from "../services/fileService";
import { debounce } from "../utils/debounce";

const AUTOSAVE_DELAY_MS = 500;

export function useAutoSave(
  title: string,
  content: string,
  enabled: boolean,
): void {
  const debouncedSave = useRef(
    debounce((t: string, text: string) => {
      writeNote(t, text).catch((err: unknown) => {
        console.error("[useAutoSave] Failed to save note:", err);
      });
    }, AUTOSAVE_DELAY_MS),
  ).current;

  useEffect(() => {
    if (!enabled) return;
    debouncedSave(title, content);
  }, [title, content, enabled, debouncedSave]);
}
