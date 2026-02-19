type StatisticsBarProps = {
  text: string;
  lastModified: Date | null;
};

function StatisticsBar({ text, lastModified }: StatisticsBarProps) {
  const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  const characterCount = text.length;
  const modifiedTime = lastModified
    ? lastModified.toLocaleTimeString()
    : "Never";

  return (
    <div className="statisticsBar">
      <span>Words: {wordCount}</span>
      <span>Characters: {characterCount}</span>
      <span>Last modified: {modifiedTime}</span>
    </div>
  );
}

export default StatisticsBar;
