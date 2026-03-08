import { useEffect, useRef, useState } from "react";
import {
  SearchQuery,
  setSearchQuery,
  findNext,
  findPrevious,
  replaceNext,
  replaceAll,
  closeSearchPanel,
  getSearchQuery,
} from "@codemirror/search";
import type { EditorView } from "@codemirror/view";
import { ChevronUp, ChevronDown, X } from "lucide-react";

interface FindReplacePanelProps {
  view: EditorView;
}

export function FindReplacePanel({ view }: FindReplacePanelProps) {
  const existing = getSearchQuery(view.state);

  const [searchText, setSearchText] = useState(existing.search ?? "");
  const [replaceText, setReplaceText] = useState(existing.replace ?? "");
  const [caseSensitive, setCaseSensitive] = useState(
    existing.caseSensitive ?? false,
  );
  const [regexp, setRegexp] = useState(existing.regexp ?? false);
  const [wholeWord, setWholeWord] = useState(existing.wholeWord ?? false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus the search input when the panel mounts.
  useEffect(() => {
    searchInputRef.current?.focus();
    searchInputRef.current?.select();
  }, []);

  // Push query updates into CM state whenever any field changes.
  useEffect(() => {
    view.dispatch({
      effects: setSearchQuery.of(
        new SearchQuery({
          search: searchText,
          replace: replaceText,
          caseSensitive,
          regexp,
          wholeWord,
        }),
      ),
    });
  }, [view, searchText, replaceText, caseSensitive, regexp, wholeWord]);

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      e.shiftKey ? findPrevious(view) : findNext(view);
    } else if (e.key === "Escape") {
      closeSearchPanel(view);
      view.focus();
    }
  }

  function handleReplaceKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      replaceNext(view);
    } else if (e.key === "Escape") {
      closeSearchPanel(view);
      view.focus();
    }
  }

  function handleClose() {
    closeSearchPanel(view);
    view.focus();
  }

  return (
    <div className="fr-panel">
      <div className="fr-row">
        <input
          ref={searchInputRef}
          className="fr-input"
          placeholder="Find"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          spellCheck={false}
        />
        <button
          className="fr-icon-btn"
          title="Previous match (Shift+Enter)"
          onClick={() => findPrevious(view)}
        >
          <ChevronUp size={14} />
        </button>
        <button
          className="fr-icon-btn"
          title="Next match (Enter)"
          onClick={() => findNext(view)}
        >
          <ChevronDown size={14} />
        </button>

        <div className="fr-toggles">
          <button
            className={`fr-toggle-btn${caseSensitive ? " active" : ""}`}
            title="Case sensitive"
            onClick={() => setCaseSensitive((v) => !v)}
          >
            Aa
          </button>
          <button
            className={`fr-toggle-btn${wholeWord ? " active" : ""}`}
            title="Whole word"
            onClick={() => setWholeWord((v) => !v)}
          >
            W
          </button>
          <button
            className={`fr-toggle-btn${regexp ? " active" : ""}`}
            title="Regular expression"
            onClick={() => setRegexp((v) => !v)}
          >
            .*
          </button>
        </div>

        <button
          className="fr-icon-btn fr-close-btn"
          title="Close (Esc)"
          onClick={handleClose}
        >
          <X size={14} />
        </button>
      </div>

      <div className="fr-row">
        <input
          className="fr-input"
          placeholder="Replace"
          value={replaceText}
          onChange={(e) => setReplaceText(e.target.value)}
          onKeyDown={handleReplaceKeyDown}
          spellCheck={false}
        />
        <button className="fr-text-btn" onClick={() => replaceNext(view)}>
          Replace
        </button>
        <button className="fr-text-btn" onClick={() => replaceAll(view)}>
          Replace All
        </button>
      </div>
    </div>
  );
}
