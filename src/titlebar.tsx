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
    await appWindow.setAlwaysOnTop(!alwaysOnTop);
    setAlwaysOnTop(!alwaysOnTop);
  };

  return (
    <div className="titlebar">
      <div data-tauri-drag-region style={{ flex: 1 }} />
      <div className="controls">
        <button
          id="titlebar-always-on-top"
          title="Toggle Always On Top"
          style={{
            color: alwaysOnTop ? "#FFD600" : undefined,
            fontWeight: alwaysOnTop ? "bold" : undefined,
          }}
          onClick={handleToggleAlwaysOnTop}
        >
          {/* Pin icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M16.67 5.84 18.16 7.33l-1.41 1.41 2.12 2.12-1.41 1.41-2.12-2.12-1.41 1.41 1.41 1.41-6.36 6.36-1.41-1.41 6.36-6.36-1.41-1.41 1.41-1.41 2.12 2.12 1.41-1.41-2.12-2.12z"
            />
          </svg>
        </button>
        <button
          id="titlebar-minimize"
          title="Minimize"
          onClick={handleMinimize}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path fill="currentColor" d="M19 13H5v-2h14z" />
          </svg>
        </button>
        <button
          id="titlebar-maximize"
          title="Maximize"
          onClick={handleMaximize}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path fill="currentColor" d="M4 4h16v16H4zm2 4v10h12V8z" />
          </svg>
        </button>
        <button id="titlebar-close" title="Close" onClick={handleClose}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M13.46 12L19 17.54V19h-1.46L12 13.46L6.46 19H5v-1.46L10.54 12L5 6.46V5h1.46L12 10.54L17.54 5H19v1.46z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default Titlebar;
