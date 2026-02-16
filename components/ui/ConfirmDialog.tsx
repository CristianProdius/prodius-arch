import { AlertTriangle } from "lucide-react";
import { Button } from "./Button";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  variant?: "danger" | "default";
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
}

const ConfirmDialog = ({
  isOpen,
  title,
  description,
  variant = "default",
  onConfirm,
  onCancel,
  isLoading = false,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
}: ConfirmDialogProps) => {
  if (!isOpen) return null;

  return (
    <div className="confirm-dialog">
      <div className="panel">
        <div className="icon">
          <AlertTriangle
            className="alert"
            style={variant === "danger" ? { color: "#ef4444" } : undefined}
          />
        </div>
        <h3>{title}</h3>
        <p>{description}</p>
        <div className="actions">
          <Button
            onClick={onConfirm}
            fullWidth
            className={variant === "danger" ? "confirm danger" : "confirm"}
            disabled={isLoading}
          >
            {isLoading ? "Please wait…" : confirmLabel}
          </Button>
          <button onClick={onCancel} className="cancel" disabled={isLoading}>
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
