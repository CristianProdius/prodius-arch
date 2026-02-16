import { useState } from "react";
import { ArrowUpRight, Clock, MoreVertical, Check } from "lucide-react";
import ProjectCardMenu from "./ProjectCardMenu";

interface ProjectCardProps {
  project: DesignHistoryItem;
  ownerLabel: string;
  isBatchMode: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onClick: () => void;
  onRename: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onManageTags: () => void;
}

const ProjectCard = ({
  project,
  ownerLabel,
  isBatchMode,
  isSelected,
  onSelect,
  onClick,
  onRename,
  onDuplicate,
  onDelete,
  onManageTags,
}: ProjectCardProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const name = project.name || `Residence ${project.id}`;

  return (
    <div
      className={`project-card group ${isSelected ? "project-card--selected" : ""}`}
      onClick={() => {
        if (isBatchMode) {
          onSelect();
        } else {
          onClick();
        }
      }}
    >
      <div className="preview">
        <img
          src={project.renderedImage || project.sourceImage}
          alt={name}
        />
        {project.isPublic && (
          <div className="badge">
            <span>Community</span>
          </div>
        )}
        {isBatchMode && (
          <div className={`batch-check ${isSelected ? "batch-check--active" : ""}`}>
            {isSelected && <Check size={14} />}
          </div>
        )}
        {!isBatchMode && !project.isPublic && (
          <button
            className="card-menu-trigger"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((p) => !p);
            }}
          >
            <MoreVertical size={16} />
          </button>
        )}
        <ProjectCardMenu
          isOpen={menuOpen}
          onClose={() => setMenuOpen(false)}
          onRename={onRename}
          onDuplicate={onDuplicate}
          onManageTags={onManageTags}
          onDelete={onDelete}
        />
      </div>

      <div className="card-body">
        <div>
          <h3>{name}</h3>
          <div className="meta">
            <Clock size={12} />
            <span>{new Date(project.timestamp).toLocaleDateString()}</span>
            <span>By {ownerLabel}</span>
          </div>
          {project.tags && project.tags.length > 0 && (
            <div className="card-tags">
              {project.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="card-tag">{tag}</span>
              ))}
            </div>
          )}
        </div>
        <div className="arrow">
          <ArrowUpRight size={18} />
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
