import { useEffect, useRef } from "react";
import { Pencil, Copy, Tag, Trash2 } from "lucide-react";

interface ProjectCardMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onRename: () => void;
  onDuplicate: () => void;
  onManageTags: () => void;
  onDelete: () => void;
}

const ProjectCardMenu = ({
  isOpen,
  onClose,
  onRename,
  onDuplicate,
  onManageTags,
  onDelete,
}: ProjectCardMenuProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const items = [
    { icon: Pencil, label: "Rename", onClick: onRename },
    { icon: Copy, label: "Duplicate", onClick: onDuplicate },
    { icon: Tag, label: "Manage Tags", onClick: onManageTags },
    { icon: Trash2, label: "Delete", onClick: onDelete, danger: true },
  ];

  return (
    <div className="project-card-menu" ref={ref}>
      {items.map((item) => (
        <button
          key={item.label}
          className={`menu-item ${item.danger ? "menu-item--danger" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            item.onClick();
            onClose();
          }}
        >
          <item.icon size={14} />
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
};

export default ProjectCardMenu;
