import React, { useEffect, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";

const appWindow = getCurrentWindow();

function Titlebar() {
  const [alwaysOnTop, setAlwaysOnTop] = useState(false);

  useEffect(() => {
    appWindow.isAlwaysOnTop().then(setAlwaysOnTop);
  }, []);

  const handleMinimize = () => appWindow.minimize();
  const handleMaximize = () => appWindow.toggleMaximize();
  const handleClose = () => appWindow.close();
  const handleToggleAlwaysOnTop = async () => {
    const next = !alwaysOnTop;
    await appWindow.setAlwaysOnTop(next);
    setAlwaysOnTop(next);
  };

  return (
    <div className="titlebar" data-tauri-drag-region>
      <div className="titlebar-title" data-tauri-drag-region></div>
      <div className="titlebar-controls">
        {/* Always on Top - extra button */}
        <button
          className={`titlebar-btn pin-btn${alwaysOnTop ? " active" : ""}`}
          title={alwaysOnTop ? "Unpin from top" : "Pin to top"}
          onClick={handleToggleAlwaysOnTop}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="10"
            height="10"
            viewBox="0 0 16 16"
          >
            <path
              fill="currentColor"
              d="M9.828.722a.5.5 0 0 1 .354.146l4.95 4.95a.5.5 0 0 1 0 .707c-.48.48-1.072.588-1.503.588-.177 0-.335-.018-.46-.039l-3.134 3.134a5.927 5.927 0 0 1 .16 1.013c.046.702-.032 1.687-.72 2.375a.5.5 0 0 1-.707 0l-2.829-2.828-3.182 3.182c-.195.195-1.219.902-1.414.707-.195-.195.512-1.22.707-1.414l3.182-3.182-2.828-2.829a.5.5 0 0 1 0-.707c.688-.688 1.673-.767 2.375-.72a5.922 5.922 0 0 1 1.013.16l3.134-3.133a2.772 2.772 0 0 1-.04-.461c0-.43.108-1.022.589-1.503a.5.5 0 0 1 .353-.146z"
            />
          </svg>
        </button>

        {/* Minimize */}
        <button
          className="titlebar-btn"
          title="Minimize"
          onClick={handleMinimize}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="10"
            height="10"
            viewBox="0 0 12 12"
          >
            <rect fill="currentColor" x="0" y="5.5" width="12" height="1" />
          </svg>
        </button>

        {/* Maximize */}
        <button
          className="titlebar-btn"
          title="Maximize"
          onClick={handleMaximize}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="10"
            height="10"
            viewBox="0 0 12 12"
          >
            <rect
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              x="0.5"
              y="0.5"
              width="11"
              height="11"
            />
          </svg>
        </button>

        {/* Close */}
        <button
          className="titlebar-btn close-btn"
          title="Close"
          onClick={handleClose}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="10"
            height="10"
            viewBox="0 0 12 12"
          >
            <path
              fill="currentColor"
              d="M6 5.293L10.646.646l.708.708L6.707 6l4.647 4.646-.708.708L6 6.707l-4.646 4.647-.708-.708L5.293 6 .646 1.354l.708-.708z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default Titlebar;
