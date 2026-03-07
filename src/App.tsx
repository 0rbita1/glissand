import { useEffect, useState, useRef } from "react";
import "./styles/App.css";
import "./styles/markdownEditor.css";
import StatisticsBar from "./components/statisticsBar";
import Titlebar from "./components/titlebar";
import MarkdownEditor, {
  type MarkdownEditorHandle,
} from "./components/markdown/markdownEditor";
import { readNote, writeNote, renameNote } from "./services/fileService";
import { useAutoSave } from "./hooks/useAutoSave";
import { useAutoHideUI } from "./hooks/useAutoHideUI";
import type { NoteLoadState } from "./types/note.types";
import HotBar from "./components/hotBar";
import { debounce } from "./utils/debounce";

// Windows/macOS/Linux reserved characters that cannot appear in file names.
const INVALID_FILENAME_CHARS = /[\\/:*?"<>|]/g;
const RENAME_DEBOUNCE_MS = 10;

function sanitizeFilename(raw: string): string {
  return raw.replace(INVALID_FILENAME_CHARS, "").trim();
}

function App() {
  const [text, setText] = useState("");
  const [lastModified, setLastModified] = useState<Date | null>(null);
  const [loadState, setLoadState] = useState<NoteLoadState>("idle");
  const [isDirty, setIsDirty] = useState(false);
  const [title, setTitle] = useState("");
  // Tracks the filename currently saved on disk (without extension).
  const currentFilenameRef = useRef("initialNote");
  const editorRef = useRef<MarkdownEditorHandle>(null);

  const uiVisible = useAutoHideUI();

  useEffect(() => {
    setLoadState("loading");
    readNote()
      .then((content) => {
        setText(content);
        setLoadState("ready");
      })
      .catch((err: unknown) => {
        console.error("[App] Failed to load note:", err);
        setLoadState("error");
      });
  }, []);

  useAutoSave(text, isDirty);

  // Stable debounced rename — recreated only on mount.
  const debouncedRename = useRef(
    debounce((newTitle: string) => {
      const sanitized = sanitizeFilename(newTitle);
      // Use a fallback filename when the title is empty or whitespace-only.
      const newFilename = (sanitized || "initialNote") + ".md";
      const oldFilename = currentFilenameRef.current + ".md";

      if (newFilename === oldFilename) return;

      renameNote(oldFilename, newFilename)
        .then(() => {
          currentFilenameRef.current = sanitized || "initialNote";
        })
        .catch((err: unknown) => {
          console.error("[App] Failed to rename note:", err);
        });
    }, RENAME_DEBOUNCE_MS),
  ).current;

  function handleTitleChange(value: string) {
    // Strip invalid characters immediately so the input never shows them.
    const cleaned = value.replace(INVALID_FILENAME_CHARS, "");
    setTitle(cleaned);
    debouncedRename(cleaned);
  }

  function handleChange(value: string) {
    setText(value);
    setLastModified(new Date());
    setIsDirty(true);
  }

  function handleSave() {
    writeNote(text).catch((err: unknown) => {
      console.error("[App] Failed to save note:", err);
    });
  }

  function handleFindReplace() {
    editorRef.current?.openFindReplace();
  }

  function handleTitleKeyDown(
    e: React.KeyboardEvent<HTMLTextAreaElement>,
  ): void {
    if (e.key === "Enter" || e.key === "ArrowDown") {
      e.preventDefault();
      editorRef.current?.focusAtStart();
    }
  }

  return (
    <>
      <Titlebar />
      <div className="editorContainer">
        {(loadState === "ready" || loadState === "error") && (
          <MarkdownEditor
            ref={editorRef}
            initialValue={text}
            onChange={handleChange}
            placeholder="Type here…"
            titleSlot={
              <textarea
                className="md-title-input"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Untitled"
                rows={1}
                onKeyDown={handleTitleKeyDown}
              />
            }
          />
        )}
      </div>
      <HotBar
        className={uiVisible ? "" : "ui-hidden"}
        onSave={handleSave}
        onFindReplace={handleFindReplace}
      />
      <StatisticsBar
        text={text}
        lastModified={lastModified}
        className={uiVisible ? "" : "ui-hidden"}
      />
    </>
  );
}

export default App;
