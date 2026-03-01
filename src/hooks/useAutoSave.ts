import { useEffect, useRef } from "react";
import { writeNote } from "../services/fileService";
import { debounce } from "../utils/debounce";

/**
 * Delay (ms) after the user stops typing before the note is saved.
 *
 * 500 ms is a good balance: short enough that the user never waits long
 * for a save, but long enough to batch rapid keystrokes into a single write.
 */
const AUTOSAVE_DELAY_MS = 500;

/**
 * Automatically saves `content` to disk via a debounced write.
 *
 * The save only fires when `enabled` is true, which prevents the hook
 * from overwriting the file with the empty initial state that exists
 * before the note has been loaded from disk.
 *
 * @param content - The current editor content to persist.
 * @param enabled - Set to true only after the user has made their first edit.
 */
export function useAutoSave(content: string, enabled: boolean): void {
  // Keep the debounced function stable for the component's lifetime.
  const debouncedSave = useRef(
    debounce((text: string) => {
      writeNote(text).catch((err: unknown) => {
        console.error("[useAutoSave] Failed to save note:", err);
      });
    }, AUTOSAVE_DELAY_MS),
  ).current;

  useEffect(() => {
    if (!enabled) return;
    debouncedSave(content);
  }, [content, enabled, debouncedSave]);
}
