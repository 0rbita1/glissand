import { useEffect, useState } from "react";
import "./styles/App.css";
import "./components/markdown/markdownEditor.css";
import StatisticsBar from "./components/statisticsBar";
import Titlebar from "./components/titlebar";
import MarkdownEditor from "./components/markdown/markdownEditor";
import { readNote } from "./services/fileService";
import { useAutoSave } from "./hooks/useAutoSave";
import type { NoteLoadState } from "./types/note.types";

function App() {
  const [text, setText] = useState("");
  const [lastModified, setLastModified] = useState<Date | null>(null);
  const [loadState, setLoadState] = useState<NoteLoadState>("idle");
  // isDirty is true only after the user has made their first edit.
  // This prevents useAutoSave from firing before (or instead of) the
  // initial load, which would overwrite the saved note with an empty string.
  const [isDirty, setIsDirty] = useState(false);

  // Load the persisted note once on mount.
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

  // Auto-save 500 ms after the user stops typing.
  useAutoSave(text, isDirty);

  function handleChange(value: string) {
    setText(value);
    setLastModified(new Date());
    setIsDirty(true);
  }

  return (
    <>
      <Titlebar />
      <div className="editorContainer">
        {/* Defer mounting until content is loaded so MarkdownEditor
            receives the correct initialValue on its first render.
            The editor only reads initialValue once (on mount). */}
        {(loadState === "ready" || loadState === "error") && (
          <MarkdownEditor
            initialValue={text}
            onChange={handleChange}
            placeholder="Type here…"
          />
        )}
      </div>
      <StatisticsBar text={text} lastModified={lastModified} />
    </>
  );
}

export default App;
