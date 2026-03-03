import { useEffect, useState } from "react";
import "./styles/App.css";
import "./components/markdown/markdownEditor.css";
import StatisticsBar from "./components/statisticsBar";
import Titlebar from "./components/titlebar";
import MarkdownEditor from "./components/markdown/markdownEditor";
import { readNote } from "./services/fileService";
import { useAutoSave } from "./hooks/useAutoSave";
import { useAutoHideUI } from "./hooks/useAutoHideUI";
import type { NoteLoadState } from "./types/note.types";
import HotBar from "./components/hotBar";

function App() {
  const [text, setText] = useState("");
  const [lastModified, setLastModified] = useState<Date | null>(null);
  const [loadState, setLoadState] = useState<NoteLoadState>("idle");
  const [isDirty, setIsDirty] = useState(false);

  const uiVisible = useAutoHideUI();

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
        {(loadState === "ready" || loadState === "error") && (
          <MarkdownEditor
            initialValue={text}
            onChange={handleChange}
            placeholder="Type here…"
          />
        )}
      </div>
      <HotBar className={uiVisible ? "" : "ui-hidden"} />
      <StatisticsBar
        text={text}
        lastModified={lastModified}
        className={uiVisible ? "" : "ui-hidden"}
      />
    </>
  );
}

export default App;
