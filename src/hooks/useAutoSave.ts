import { useEffect, useRef, type MutableRefObject } from "react";
import { writeNote } from "../services/fileService";
import { debounce } from "../utils/debounce";

const AUTOSAVE_DELAY_MS = 500;

export function useAutoSave(
  filenameRef: MutableRefObject<string>,
  title: string,
  content: string,
  enabled: boolean,
): void {
  const debouncedSave = useRef(
    debounce((t: string, text: string) => {
      writeNote(filenameRef.current + ".md", t, text).catch((error) =>
        console.error("Auto-save failed:", error),
      );
    }, AUTOSAVE_DELAY_MS),
  ).current;

  useEffect(() => {
    if (!enabled) return;
    debouncedSave(title, content);
  }, [title, content, enabled, debouncedSave]);
}
