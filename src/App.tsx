import { useState } from "react";
import "./App.css";
import StatisticsBar from "./statisticsBar";
import Titlebar from "./titlebar";

function App() {
  const [text, setText] = useState("");
  const [lastModified, setLastModified] = useState<Date | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value);
    setLastModified(new Date());
  }

  return (
    <>
      <Titlebar />
      <textarea
        className="textArea"
        value={text}
        onChange={handleChange}
        placeholder="Type here..."
        autoFocus
      />
      <StatisticsBar text={text} lastModified={lastModified} />
    </>
  );
}

export default App;
