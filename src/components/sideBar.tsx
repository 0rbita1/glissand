import { useEffect, useState } from "react";
import { listNotes, type NoteMetadata } from "../services/fileService";
import "../styles/sideBar.css";

interface SideBarProps {
  isOpen: boolean;
  onOpenNote: (filename: string) => void;
  activeFilename?: string;
  refreshKey?: number;
}

function SideBar({
  isOpen,
  onOpenNote,
  activeFilename,
  refreshKey,
}: SideBarProps) {
  const [noteList, setNoteList] = useState<NoteMetadata[]>([]);

  useEffect(() => {
    if (isOpen) {
      listNotes().then(setNoteList);
    }
  }, [isOpen, refreshKey]);

  return (
    <div className={`sidebar${isOpen ? " sidebar--open" : ""}`}>
      <ul className="sidebar-note-list">
        {noteList.map((note) => (
          <li
            key={note.filename}
            className={`sidebar-note-item${
              note.filename === activeFilename ? " active" : ""
            }`}
            onClick={() => onOpenNote(note.filename)}
          >
            {note.filename.replace(/\.md$/, "")}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SideBar;
