interface TagFilterProps {
  allTags: string[];
  selectedTags: string[];
  onToggle: (tag: string) => void;
  onClear: () => void;
}

const TagFilter = ({ allTags, selectedTags, onToggle, onClear }: TagFilterProps) => {
  if (allTags.length === 0) return null;

  return (
    <div className="tag-filter">
      <button
        className={`tag-filter-chip ${selectedTags.length === 0 ? "tag-filter-chip--active" : ""}`}
        onClick={onClear}
      >
        All
      </button>
      {allTags.map((tag) => (
        <button
          key={tag}
          className={`tag-filter-chip ${selectedTags.includes(tag) ? "tag-filter-chip--active" : ""}`}
          onClick={() => onToggle(tag)}
        >
          {tag}
        </button>
      ))}
    </div>
  );
};

export default TagFilter;
