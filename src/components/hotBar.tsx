import {
  FilePlus,
  Save,
  Replace,
  Trash2,
  Palette,
  SunMoon,
  Command,
} from "lucide-react";
import "../styles/hotBar.css";
import { useState } from "react";

const hotBarButtons = [
  { id: "new-note", icon: FilePlus, label: "New Note (Ctrl + N)" },
  { id: "save", icon: Save, label: "Save (Ctrl + S)" },
  { id: "find-replace", icon: Replace, label: "Find & Replace (Ctrl + F)" },
  { id: "delete-note", icon: Trash2, label: "Delete Note" },
  { id: "note-colour", icon: Palette, label: "Note Colour" },
  { id: "day-night", icon: SunMoon, label: "Day / Night Mode (Ctrl + M)" },
  { id: "cmd-palette", icon: Command, label: "Command Palette (Ctrl + P)" },
] as const;

function HotBar({
  className = "",
  onSave,
  onFindReplace,
  onNewNote,
  onDeleteNote,
  onDayNight,
  onCmdPalette,
  isDayMode = false,
}: {
  className?: string;
  onSave?: () => void;
  onFindReplace?: () => void;
  onNewNote?: () => void;
  onDeleteNote?: () => void;
  onDayNight?: () => void;
  onCmdPalette?: () => void;
  isDayMode?: boolean;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handlers: Partial<Record<string, () => void>> = {
    save: onSave,
    "find-replace": onFindReplace,
    "new-note": onNewNote,
    "delete-note": onDeleteNote,
    "day-night": onDayNight,
    "cmd-palette": onCmdPalette,
  };

  return (
    <div className={`hotBar ${className}`}>
      {hotBarButtons.map(({ id, icon: Icon, label }) => (
        <div
          key={id}
          className="hotBar-btn-wrapper"
          onMouseEnter={() => setHoveredId(id)}
          onMouseLeave={() => setHoveredId(null)}
        >
          <button
            className={`hotBar-btn${id === "day-night" && isDayMode ? " hotBar-btn--active" : ""}`}
            aria-label={label}
            onClick={handlers[id]}
          >
            <Icon size={18} strokeWidth={1.6} />
          </button>
          {hoveredId === id && <span className="hotBar-tooltip">{label}</span>}
        </div>
      ))}
    </div>
  );
}

export default HotBar;
