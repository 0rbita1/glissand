import { useRef } from "react";
import "../styles/App.css";

interface TitleProps {
  value: string;
  onChange: (value: string) => void;
  onEnter?: () => void;
}

export default function Title({ value, onChange, onEnter }: TitleProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <input
      ref={inputRef}
      className="title-input"
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onEnter?.();
        }
      }}
      placeholder="Untitled"
      spellCheck={false}
    />
  );
}