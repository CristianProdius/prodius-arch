import { useState } from "react";
import { Button } from "./ui/Button";

interface RenameDialogProps {
  isOpen: boolean;
  currentName: string;
  onConfirm: (name: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const RenameDialog = ({
  isOpen,
  currentName,
  onConfirm,
  onCancel,
  isLoading = false,
}: RenameDialogProps) => {
  const [name, setName] = useState(currentName);

  if (!isOpen) return null;

  return (
    <div className="confirm-dialog">
      <div className="panel">
        <h3>Rename Project</h3>
        <p>Enter a new name for this project.</p>
        <input
          type="text"
          className="rename-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && name.trim()) onConfirm(name.trim());
          }}
          autoFocus
        />
        <div className="actions">
          <Button
            onClick={() => name.trim() && onConfirm(name.trim())}
            fullWidth
            className="confirm"
            disabled={isLoading || !name.trim()}
          >
            {isLoading ? "Renaming…" : "Rename"}
          </Button>
          <button onClick={onCancel} className="cancel" disabled={isLoading}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default RenameDialog;
