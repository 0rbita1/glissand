import { useEffect } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Terminal,
  ListOrdered,
  List,
  Quote,
  Link,
  Image,
  Minus,
  ListChecks,
  Table,
  Sigma,
  X,
} from "lucide-react";
import "../styles/commandPalette.css";

const SYNTAX_ITEMS: { icon: LucideIcon; title: string; syntax: string }[] = [
  { icon: Bold, title: "Bold", syntax: "**bold**" },
  { icon: Italic, title: "Italic", syntax: "*italic*" },
  { icon: Strikethrough, title: "Strikethrough", syntax: "~~text~~" },
  { icon: Code, title: "Inline Code", syntax: "`code`" },
  { icon: Terminal, title: "Code Block", syntax: "```lang\ncode\n```" },
  { icon: ListOrdered, title: "Ordered List", syntax: "1. item" },
  { icon: List, title: "Unordered List", syntax: "- item" },
  { icon: Quote, title: "Blockquote", syntax: "> quote" },
  { icon: Link, title: "Link", syntax: "[text](url)" },
  { icon: Image, title: "Image", syntax: "![alt](url)" },
  { icon: Minus, title: "Divider", syntax: "---" },
  { icon: ListChecks, title: "Task List", syntax: "- [ ] task" },
  { icon: Table, title: "Table", syntax: "| A | B |" },
  { icon: Sigma, title: "LaTeX Inline", syntax: "$equation$" },
  { icon: Sigma, title: "LaTeX Block", syntax: "$$equation$$" },
];

function CommandPalette({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="cmdp-overlay" onMouseDown={onClose}>
      <div className="cmdp-panel" onMouseDown={(e) => e.stopPropagation()}>
        <div className="cmdp-header">
          <span className="cmdp-title">Markdown Syntax</span>
          <button className="cmdp-close" onClick={onClose} aria-label="Close">
            <X size={15} strokeWidth={1.8} />
          </button>
        </div>
        <ul className="cmdp-list">
          {SYNTAX_ITEMS.map(({ icon: Icon, title, syntax }) => (
            <li key={title} className="cmdp-item">
              <span className="cmdp-item-icon">
                <Icon size={15} strokeWidth={1.6} />
              </span>
              <span className="cmdp-item-title">{title}</span>
              <code className="cmdp-item-syntax">{syntax}</code>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default CommandPalette;
