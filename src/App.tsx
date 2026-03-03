import { useEffect, useState, useRef } from "react";
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
import Title from "./components/title";

function App() {
  const [text, setText] = useState("");
  const [lastModified, setLastModified] = useState<Date | null>(null);
  const [loadState, setLoadState] = useState<NoteLoadState>("idle");
  const [isDirty, setIsDirty] = useState(false);
  const [title, setTitle] = useState("");
  const editorRef = useRef(null);

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

  function handleChange(value: string) {
    setText(value);
    setLastModified(new Date());
    setIsDirty(true);
  }

  function handleTitleChange(value: string) {
    setTitle(value);
  }

  return (
    <>
      <Titlebar />
      <div className="titleArea">
        <Title
          value={title}
          onChange={handleTitleChange}
          onEnter={() => editorRef.current?.focus()}
        />
      </div>
      <div className="editorContainer">
        {(loadState === "ready" || loadState === "error") && (
          <MarkdownEditor
            initialValue={text}
            onChange={handleChange}
            placeholder="Type here…"
            titleSlot={
              <Title
                value={title}
                onChange={setTitle}
                onEnter={() => editorRef.current?.focus()}
              />
            }
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
