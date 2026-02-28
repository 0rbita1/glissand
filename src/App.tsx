import { useState } from "react";
import "./styles/App.css";
import "./components/markdown/markdownEditor.css";
import StatisticsBar from "./components/statisticsBar";
import Titlebar from "./components/titlebar";
import MarkdownEditor from "./components/markdown/markdownEditor";

function App() {
  const [text, setText] = useState("");
  const [lastModified, setLastModified] = useState<Date | null>(null);

  function handleChange(value: string) {
    setText(value);
    setLastModified(new Date());
  }

  return (
    <>
      <Titlebar />
      <div className="editorContainer">
        <MarkdownEditor
          initialValue={text}
          onChange={handleChange}
          placeholder="Type here..."
        />
      </div>
      <StatisticsBar text={text} lastModified={lastModified} />
    </>
  );
}

export default App;
