interface RenderHistoryStripProps {
  history: RenderHistoryEntry[];
  activeId: string | null;
  onSelect: (entry: RenderHistoryEntry) => void;
}

const RenderHistoryStrip = ({
  history,
  activeId,
  onSelect,
}: RenderHistoryStripProps) => {
  if (history.length === 0) return null;

  const recent = history.slice(0, 10);

  return (
    <div className="render-history-strip">
      <span className="strip-label">Render History</span>
      <div className="strip-scroll">
        {recent.map((entry) => (
          <button
            key={entry.id}
            className={`strip-thumb ${activeId === entry.id ? "strip-thumb--active" : ""}`}
            onClick={() => onSelect(entry)}
          >
            <img src={entry.renderedImage} alt={`Render ${entry.id}`} />
            {entry.style && <span className="strip-style">{entry.style}</span>}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RenderHistoryStrip;
