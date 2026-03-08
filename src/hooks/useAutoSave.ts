import { useEffect, useRef } from "react";
import { writeNote } from "../services/fileService";
import { debounce } from "../utils/debounce";

const AUTOSAVE_DELAY_MS = 500;

export function useAutoSave(
  filename: string,
  title: string,
  content: string,
  enabled: boolean,
): void {
  // Always reflects the latest values inside the stable debounced callback.
  const latestRef = useRef({ filename, title, content });
  latestRef.current = { filename, title, content };

  const debouncedSave = useRef(
    debounce(() => {
      const { filename, title, content } = latestRef.current;
      if (!filename) return;
      writeNote(filename, title, content).catch((error) =>
        console.error("Auto-save failed:", error),
      );
    }, AUTOSAVE_DELAY_MS),
  ).current;

  useEffect(() => {
    if (!enabled) return;
    debouncedSave();
  }, [filename, title, content, enabled, debouncedSave]);
}
