import { useEffect, useState } from "react";
import { listNotes, type NoteMetadata } from "../services/fileService";
import "../styles/sideBar.css";

interface SideBarProps {
  isOpen: boolean;
}

function SideBar({ isOpen }: SideBarProps) {
  const [noteList, setNoteList] = useState<NoteMetadata[]>([]);

  useEffect(() => {
    if (isOpen) {
      listNotes().then(setNoteList);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="sidebar">
      <ul className="sidebar-note-list">
        {noteList.map((note) => (
          <li key={note.filename} className="sidebar-note-item">
            {note.filename}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SideBar;
