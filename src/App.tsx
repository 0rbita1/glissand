import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

function App() {
  const [text, setText] = useState("");

  return (
    <textarea
      className="textArea"
      value={text}
      onChange={(e) => setText(e.target.value)}
      placeholder="Type here..."
      autoFocus
    />
  );
}

export default App;
