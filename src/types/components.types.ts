export type StatisticsBarProps = {
  text: string;
  lastModified: string;
};

export interface MarkdownEditorProps {
  initialValue?: string;
  onChange?: (markdown: string) => void;
  className?: string;
  placeholder?: string;
}
