import {
  useEffect,
  useRef,
  useCallback,
  useState,
  forwardRef,
  useImperativeHandle,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { EditorView, keymap } from "@codemirror/view";
import { indentUnit } from "@codemirror/language";
import { EditorState } from "@codemirror/state";
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from "@codemirror/commands";
import { search, searchKeymap, openSearchPanel } from "@codemirror/search";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { GFM, Strikethrough, Table, TaskList } from "@lezer/markdown";
import { livePreviewPlugin } from "./plugins/livePreviewPlugin";
import { mathField } from "./plugins/mathPlugin";
import { frontmatterPlugin, frontmatterEnd } from "./plugins/frontmatterPlugin";

interface MarkdownEditorProps {
  initialValue?: string;
  onChange?: (markdown: string) => void;
  className?: string;
  placeholder?: string;
  titleSlot?: ReactNode;
}

export interface MarkdownEditorHandle {
  openFindReplace: () => void;
  focusAtStart: () => void;
}

const MarkdownEditor = forwardRef<MarkdownEditorHandle, MarkdownEditorProps>(
  function MarkdownEditor(
    {
      initialValue = "",
      onChange,
      className = "",
      placeholder = "Start writing…",
      titleSlot,
    }: MarkdownEditorProps,
    ref,
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView | null>(null);
    const [titleContainer, setTitleContainer] = useState<HTMLElement | null>(
      null,
    );

    useImperativeHandle(ref, () => ({
      openFindReplace: () => {
        if (viewRef.current) openSearchPanel(viewRef.current);
      },
      focusAtStart: () => {
        const view = viewRef.current;
        if (view) {
          view.focus();
          const fm = frontmatterEnd(view.state);
          view.dispatch({
            selection: { anchor: fm === -1 ? 0 : fm },
          });
        }
      },
    }));

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
          keymap.of([
            indentWithTab,
            ...defaultKeymap,
            ...historyKeymap,
            ...searchKeymap,
          ]),
          search(),
          markdown({
            base: markdownLanguage,
            codeLanguages: languages,
            extensions: [GFM, Strikethrough, Table, TaskList],
          }),
          livePreviewPlugin,
          mathField,
          frontmatterPlugin,
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

      const slot = document.createElement("div");
      slot.className = "md-title-slot";
      viewRef.current.scrollDOM.insertBefore(
        slot,
        viewRef.current.scrollDOM.firstChild,
      );
      setTitleContainer(slot);

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
      <>
        <div
          ref={containerRef}
          className={`md-editor-root ${className}`}
          data-placeholder={placeholder}
          aria-label="Markdown editor"
        />
        {titleContainer != null &&
          titleSlot != null &&
          createPortal(titleSlot, titleContainer)}
      </>
    );
  },
);

export default MarkdownEditor;
