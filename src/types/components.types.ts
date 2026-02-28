export type StatisticsBarProps = {
  text: string;
  lastModified: Date | null;
};

export interface MarkdownEditorProps {
  initialValue?: string;
  onChange?: (markdown: string) => void;
  className?: string;
  placeholder?: string;
}
