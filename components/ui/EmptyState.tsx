import type { LucideIcon } from "lucide-react";
import { Button } from "./Button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

const EmptyState = ({ icon: Icon, title, description, action }: EmptyStateProps) => (
  <div className="empty-state">
    <div className="empty-icon">
      <Icon size={32} />
    </div>
    <h3>{title}</h3>
    <p>{description}</p>
    {action && (
      <Button size="sm" onClick={action.onClick} className="empty-cta">
        {action.label}
      </Button>
    )}
  </div>
);

export default EmptyState;
