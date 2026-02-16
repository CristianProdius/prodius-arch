import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Button } from "./ui/Button";

const SUGGESTED_TAGS = [
  "Residential",
  "Commercial",
  "Modern",
  "Traditional",
  "Renovation",
  "New Build",
];

interface TagManagerProps {
  isOpen: boolean;
  tags: string[];
  onSave: (tags: string[]) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const TagManager = ({
  isOpen,
  tags: initialTags,
  onSave,
  onCancel,
  isLoading = false,
}: TagManagerProps) => {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [input, setInput] = useState("");

  if (!isOpen) return null;

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setInput("");
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  return (
    <div className="confirm-dialog">
      <div className="panel tag-manager-panel">
        <h3>Manage Tags</h3>
        <p>Add tags to organize your projects.</p>

        <div className="tag-input-row">
          <input
            type="text"
            className="rename-input"
            placeholder="Add a tag…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addTag(input);
            }}
          />
          <Button
            size="sm"
            onClick={() => addTag(input)}
            disabled={!input.trim()}
          >
            <Plus size={14} />
          </Button>
        </div>

        {tags.length > 0 && (
          <div className="tag-pills">
            {tags.map((tag) => (
              <span key={tag} className="tag-pill">
                {tag}
                <button onClick={() => removeTag(tag)}>
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="tag-suggestions">
          <span className="tag-suggestions-label">Suggestions:</span>
          <div className="tag-pills">
            {SUGGESTED_TAGS.filter((t) => !tags.includes(t)).map((tag) => (
              <button
                key={tag}
                className="tag-pill tag-pill--suggestion"
                onClick={() => addTag(tag)}
              >
                <Plus size={10} /> {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="actions">
          <Button
            onClick={() => onSave(tags)}
            fullWidth
            className="confirm"
            disabled={isLoading}
          >
            {isLoading ? "Saving…" : "Save Tags"}
          </Button>
          <button onClick={onCancel} className="cancel" disabled={isLoading}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default TagManager;
