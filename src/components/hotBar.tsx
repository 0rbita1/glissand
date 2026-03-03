import {
  FilePlus,
  Save,
  Replace,
  Trash2,
  Palette,
  SunMoon,
  Command,
} from "lucide-react";

const hotBarButtons = [
  { id: "new-note", icon: FilePlus, label: "New Note" },
  { id: "save", icon: Save, label: "Save" },
  { id: "find-replace", icon: Replace, label: "Find & Replace" },
  { id: "delete-note", icon: Trash2, label: "Delete Note" },
  { id: "note-colour", icon: Palette, label: "Note Colour" },
  { id: "day-night", icon: SunMoon, label: "Day / Night Mode" },
  { id: "cmd-palette", icon: Command, label: "Command Palette" },
] as const;

function HotBar({ className = "" }: { className?: string }) {
  return (
    <div className={`hotBar ${className}`}>
      {hotBarButtons.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          className="hotBar-btn"
          title={label}
          aria-label={label}
        >
          <Icon size={18} strokeWidth={1.6} />
        </button>
      ))}
    </div>
  );
}

export default HotBar;
