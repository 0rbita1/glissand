import { useEffect, useState, useRef } from "react";
import "./styles/App.css";
import "./styles/markdownEditor.css";
import StatisticsBar from "./components/statisticsBar";
import Titlebar from "./components/titlebar";
import MarkdownEditor, {
  type MarkdownEditorHandle,
} from "./components/markdown/markdownEditor";
import {
  readNote,
  writeNote,
  renameNote,
  createNote,
  deleteNote,
  listNotes,
} from "./services/fileService";
import { useAutoSave } from "./hooks/useAutoSave";
import { useAutoHideUI } from "./hooks/useAutoHideUI";
import type { NoteLoadState } from "./types/note.types";
import HotBar from "./components/hotBar";
import SideBar from "./components/sideBar";
import { debounce } from "./utils/debounce";

const INVALID_FILENAME_CHARS = /[\\/:*?"<>|]/g;
const RENAME_DEBOUNCE_MS = 10;

function sanitizeFilename(raw: string): string {
  return raw.replace(INVALID_FILENAME_CHARS, "").trim();
}

interface OpenNote {
  filename: string;
  title: string;
  body: string;
}

function App() {
  const [sideBarOpen, setSideBarOpen] = useState(false);
  const [sideBarRefreshKey, setSideBarRefreshKey] = useState(0);
  const [openNote, setOpenNote] = useState<OpenNote | null>(null);
  const [lastModified, setLastModified] = useState<Date | null>(null);
  const [loadState, setLoadState] = useState<NoteLoadState>("idle");
  const [isDirty, setIsDirty] = useState(false);
  const editorRef = useRef<MarkdownEditorHandle>(null);
  const openNoteRef = useRef<OpenNote | null>(null);
  openNoteRef.current = openNote;

  const uiVisible = useAutoHideUI(sideBarOpen);

  function loadNote(filename: string) {
    setLoadState("loading");
    setIsDirty(false);
    readNote(filename)
      .then((data) => {
        setOpenNote({ filename, title: data.title, body: data.body });
        setLoadState("ready");
      })
      .catch((err: unknown) => {
        console.error("[App] Failed to load note:", err);
        setLoadState("error");
      });
  }

  useEffect(() => {
    loadNote("initialNote.md");
  }, []);

  useAutoSave(
    openNote?.filename ?? "",
    openNote?.title ?? "",
    openNote?.body ?? "",
    isDirty,
  );

  // Stable debounced rename — recreated only on mount.
  const debouncedRename = useRef(
    debounce((newTitle: string) => {
      const current = openNoteRef.current;
      if (!current) return;

      const sanitized = sanitizeFilename(newTitle);
      const newFilename = (sanitized || "initialNote") + ".md";

      if (newFilename === current.filename) return;

      renameNote(current.filename, newFilename)
        .then(() => {
          setOpenNote((prev) =>
            prev ? { ...prev, filename: newFilename } : prev,
          );
        })
        .catch((err: unknown) => {
          console.error("[App] Failed to rename note:", err);
        });
    }, RENAME_DEBOUNCE_MS),
  ).current;

  function handleTitleChange(value: string) {
    const cleaned = value.replace(INVALID_FILENAME_CHARS, "");
    setOpenNote((prev) => (prev ? { ...prev, title: cleaned } : prev));
    debouncedRename(cleaned);
    setIsDirty(true);
  }

  function handleChange(value: string) {
    setOpenNote((prev) => (prev ? { ...prev, body: value } : prev));
    setLastModified(new Date());
    setIsDirty(true);
  }

  function handleDeleteNote() {
    const current = openNoteRef.current;
    if (!current) return;

    listNotes()
      .then((notes) => {
        const idx = notes.findIndex((n) => n.filename === current.filename);
        const next =
          idx !== -1 && notes.length > 1
            ? (notes[idx + 1] ?? notes[idx - 1])
            : null;
        return deleteNote(current.filename).then(() => next);
      })
      .then((next) => {
        setIsDirty(false);
        setSideBarRefreshKey((k) => k + 1);
        if (next) {
          loadNote(next.filename);
        } else {
          setOpenNote(null);
          setLoadState("ready");
        }
      })
      .catch((err: unknown) => {
        console.error("[App] Failed to delete note:", err);
      });
  }

  function handleNewNote() {
    createNote()
      .then((filename) => {
        setSideBarRefreshKey((k) => k + 1);
        loadNote(filename);
      })
      .catch((err: unknown) => {
        console.error("[App] Failed to create note:", err);
      });
  }

  function handleSave() {
    if (!openNote) return;
    writeNote(openNote.filename, openNote.title, openNote.body).catch(
      (err: unknown) => {
        console.error("[App] Failed to save note:", err);
      },
    );
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
      <Titlebar onToggleSidebar={() => setSideBarOpen((o) => !o)} />
      <SideBar
        isOpen={sideBarOpen}
        onOpenNote={loadNote}
        activeFilename={openNote?.filename}
        refreshKey={sideBarRefreshKey}
      />
      <div className={`editorContainer${sideBarOpen ? " editorContainer--shifted" : ""}`}>
        {(loadState === "ready" || loadState === "error") && (
          <MarkdownEditor
            ref={editorRef}
            initialValue={openNote?.body ?? ""}
            onChange={handleChange}
            placeholder="Type here…"
            titleSlot={
              <textarea
                className="md-title-input"
                value={openNote?.title ?? ""}
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
        onNewNote={handleNewNote}
        onDeleteNote={handleDeleteNote}
      />
      <StatisticsBar
        text={openNote?.body ?? ""}
        lastModified={lastModified}
        className={uiVisible ? "" : "ui-hidden"}
      />
    </>
  );
}

export default App;
