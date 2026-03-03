import { useEffect, useRef, useCallback } from "react";
import { EditorView, keymap } from "@codemirror/view";
import { indentUnit } from "@codemirror/language";
import { EditorState } from "@codemirror/state";
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from "@codemirror/commands";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { GFM, Strikethrough, Table, TaskList } from "@lezer/markdown";
import { livePreviewPlugin } from "./livePreviewPlugin";
import { mathField } from "./mathPlugin";

interface MarkdownEditorProps {
  initialValue?: string;
  onChange?: (markdown: string) => void;
  className?: string;
  placeholder?: string;
}

export default function MarkdownEditor({
  initialValue = "",
  onChange,
  className = "",
  placeholder = "Start writing…",
}: MarkdownEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!containerRef.current) return;

    const state = EditorState.create({
      doc: initialValue,
      extensions: [
        history(),
        indentUnit.of("    "),
        keymap.of([indentWithTab, ...defaultKeymap, ...historyKeymap]),
        markdown({
          base: markdownLanguage,
          codeLanguages: languages,
          extensions: [GFM, Strikethrough, Table, TaskList],
        }),
        livePreviewPlugin,
        mathField,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChangeRef.current?.(update.state.doc.toString());
          }
        }),
        EditorView.theme({
          "&": { height: "100%", outline: "none" },
          ".cm-scroller": { "overflow-x": "hidden", "overflow-y": "auto" },
        }),
      ],
    });

    viewRef.current = new EditorView({
      state,
      parent: containerRef.current,
    });

    return () => {
      viewRef.current?.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setContent = useCallback((content: string) => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: content },
    });
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      (containerRef.current as any).__setContent = setContent;
    }
  }, [setContent]);

  return (
    <div
      ref={containerRef}
      className={`md-editor-root ${className}`}
      data-placeholder={placeholder}
      aria-label="Markdown editor"
    />
  );
}
