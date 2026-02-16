import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useOutletContext } from "react-router";
import { ArrowRight, FolderOpen, Layers } from "lucide-react";

import Upload from "@/components/Upload";
import Navbar from "@/components/Navbar";
import ProjectCard from "@/components/ProjectCard";
import TagFilter from "@/components/TagFilter";
import RenameDialog from "@/components/RenameDialog";
import TagManager from "@/components/TagManager";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import { ProjectCardSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";

import {
  getProjects,
  saveProject,
  deleteProject,
  renameProject,
  duplicateProject,
  batchDeleteProjects,
  updateProjectTags,
  uploadImage,
} from "@/lib/api";
import { dataUrlToBlob } from "@/lib/utils";

export const meta = () => [
  { title: "Prodius Arch — AI Architectural Visualization" },
  { name: "description", content: "Upload floor plans, generate photorealistic 3D renders with AI, and share your architectural designs." },
  { property: "og:title", content: "Prodius Arch — AI Architectural Visualization" },
  { property: "og:description", content: "Upload floor plans, generate photorealistic 3D renders with AI, and share your architectural designs." },
  { property: "og:type", content: "website" },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: "Prodius Arch — AI Architectural Visualization" },
  { name: "twitter:description", content: "Upload floor plans, generate photorealistic 3D renders with AI." },
];

export default function IndexRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [designHistory, setDesignHistory] = useState<DesignHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { user, signIn } = useOutletContext<AuthContext>();
  const isSignedIn = !!user;
  const userName = user?.name ?? null;

  // Batch selection
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Dialogs
  const [renameTarget, setRenameTarget] = useState<DesignHistoryItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DesignHistoryItem | null>(null);
  const [tagTarget, setTagTarget] = useState<DesignHistoryItem | null>(null);
  const [showBatchDeleteConfirm, setShowBatchDeleteConfirm] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);

  // Tag filter
  const [selectedFilterTags, setSelectedFilterTags] = useState<string[]>([]);

  const fetchHistory = useCallback(async () => {
    if (!isSignedIn) return;
    setIsLoadingHistory(true);
    const items = await getProjects();
    setDesignHistory(items);
    setIsLoadingHistory(false);
  }, [isSignedIn]);

  useEffect(() => {
    if (!isSignedIn) {
      setDesignHistory([]);
      return;
    }
    fetchHistory();
  }, [isSignedIn, location.key, fetchHistory]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    designHistory.forEach((item) => item.tags?.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [designHistory]);

  const filteredHistory = useMemo(() => {
    if (selectedFilterTags.length === 0) return designHistory;
    return designHistory.filter((item) =>
      selectedFilterTags.some((tag) => item.tags?.includes(tag)),
    );
  }, [designHistory, selectedFilterTags]);

  const handleUploadComplete = async (base64Image: string) => {
    setUploadError(null);

    if (!isSignedIn) {
      signIn();
      return false;
    }

    const newId = Date.now().toString();
    const name = `Residence ${newId}`;

    // Upload image to S3 via API
    let sourceUrl = base64Image;
    const blobData = dataUrlToBlob(base64Image);
    if (blobData) {
      const uploaded = await uploadImage(blobData.blob, newId, "source");
      if (uploaded) sourceUrl = uploaded;
    }

    const newItem: DesignHistoryItem = {
      id: newId,
      name,
      sourceImage: sourceUrl,
      renderedImage: undefined,
      timestamp: Date.now(),
    };

    const saved = await saveProject(newItem, "private");
    if (!saved) {
      setUploadError("Failed to save project. Please try again.");
      toast("error", "Failed to save project.");
      return false;
    }

    toast("success", "Project created successfully!");

    setDesignHistory((prev) => {
      const filtered = prev.filter((item) => item.id !== newId);
      return [saved, ...filtered];
    });

    navigate(`/visualizer/${newId}?source=private`, {
      state: {
        initialImage: saved.sourceImage,
        initialRender: saved.renderedImage || null,
        name,
      },
    });

    return true;
  };

  // CRUD handlers
  const handleRename = async (name: string) => {
    if (!renameTarget) return;
    setDialogLoading(true);
    const result = await renameProject(renameTarget.id, name);
    setDialogLoading(false);
    setRenameTarget(null);
    if (result) {
      setDesignHistory((prev) =>
        prev.map((p) => (p.id === renameTarget.id ? { ...p, name } : p)),
      );
      toast("success", "Project renamed.");
    } else {
      toast("error", "Failed to rename project.");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDialogLoading(true);
    const ok = await deleteProject(deleteTarget.id);
    setDialogLoading(false);
    setDeleteTarget(null);
    if (ok) {
      setDesignHistory((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      toast("success", "Project deleted.");
    } else {
      toast("error", "Failed to delete project.");
    }
  };

  const handleDuplicate = async (project: DesignHistoryItem) => {
    const result = await duplicateProject(project.id);
    if (result) {
      setDesignHistory((prev) => [result, ...prev]);
      toast("success", "Project duplicated.");
    } else {
      toast("error", "Failed to duplicate project.");
    }
  };

  const handleTagsSave = async (tags: string[]) => {
    if (!tagTarget) return;
    setDialogLoading(true);
    const result = await updateProjectTags(tagTarget.id, tags);
    setDialogLoading(false);
    setTagTarget(null);
    if (result) {
      setDesignHistory((prev) =>
        prev.map((p) => (p.id === tagTarget.id ? { ...p, tags } : p)),
      );
      toast("success", "Tags updated.");
    } else {
      toast("error", "Failed to update tags.");
    }
  };

  const handleBatchDelete = async () => {
    setDialogLoading(true);
    const ids = Array.from(selectedIds);
    const ok = await batchDeleteProjects(ids);
    setDialogLoading(false);
    setShowBatchDeleteConfirm(false);
    if (ok) {
      setDesignHistory((prev) => prev.filter((p) => !selectedIds.has(p.id)));
      toast("success", `Deleted ${ids.length} project(s).`);
      setSelectedIds(new Set());
      setIsBatchMode(false);
    } else {
      toast("error", "Failed to delete selected projects.");
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const navigateToProject = (item: DesignHistoryItem) => {
    const scope = item.isPublic ? "public" : "private";
    const ownerParam = item.ownerId
      ? `&ownerId=${encodeURIComponent(item.ownerId)}`
      : "";
    navigate(`/visualizer/${item.id}?source=${scope}${ownerParam}`, {
      state: {
        initialImage: item.sourceImage,
        initialRender: item.renderedImage || null,
        ownerId: item.ownerId || null,
        name: item.name || null,
        sharedBy: item.sharedBy || null,
      },
    });
  };

  const hasHistory = filteredHistory.length > 0;

  return (
    <div className="home">
      <Navbar />

      <section className="hero">
        <div className="announce">
          <div className="dot">
            <div className="pulse"></div>
          </div>
          <span>Introducing Prodius Arch 2.0</span>
        </div>

        <h1>Design stunning spaces at the speed of thought with Prodius Arch_</h1>

        <p className="subtitle">
          Prodius Arch is an AI-first design environment that helps you visualize,
          render, and ship architectural projects faster than ever.
        </p>

        <div className="actions">
          <a href="#upload" className="cta">
            Start Building <ArrowRight className="icon" />
          </a>
          <Button variant="outline" size="lg" className="demo">
            Watch Demo
          </Button>
        </div>

        <div id="upload" className="upload-shell">
          <div
            className="grid-overlay"
            style={{
              backgroundImage:
                "linear-gradient(#06b6d4 1px, transparent 1px), linear-gradient(90deg, #06b6d4 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          ></div>

          <div className="upload-card">
            <div className="upload-head">
              <div className="upload-icon">
                <Layers className="icon" />
              </div>
              <h3>Upload your floor plan</h3>
              <p>Supports JPG, PNG formats up to 50MB</p>
            </div>

            <Upload onComplete={handleUploadComplete} />
            {uploadError && (
              <p style={{ color: "#ef4444", marginTop: "0.5rem", fontSize: "0.875rem", textAlign: "center" }}>
                {uploadError}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="projects">
        <div className="section-inner">
          <div className="section-head">
            <div className="copy">
              <h2>Projects</h2>
              <p>
                Your latest work and shared community projects, all in one
                place.
              </p>
            </div>
            {designHistory.length > 0 && isSignedIn && (
              <div className="section-actions">
                <Button
                  size="sm"
                  variant={isBatchMode ? "primary" : "outline"}
                  onClick={() => {
                    setIsBatchMode((p) => !p);
                    setSelectedIds(new Set());
                  }}
                >
                  {isBatchMode ? "Cancel" : "Select"}
                </Button>
              </div>
            )}
          </div>

          <TagFilter
            allTags={allTags}
            selectedTags={selectedFilterTags}
            onToggle={(tag) =>
              setSelectedFilterTags((prev) =>
                prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
              )
            }
            onClear={() => setSelectedFilterTags([])}
          />

          {isBatchMode && selectedIds.size > 0 && (
            <div className="batch-bar">
              <span>{selectedIds.size} selected</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedIds(new Set())}
              >
                Deselect All
              </Button>
              <Button
                size="sm"
                className="batch-delete-btn"
                onClick={() => setShowBatchDeleteConfirm(true)}
              >
                Delete Selected
              </Button>
            </div>
          )}

          {isLoadingHistory ? (
            <div className="projects-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProjectCardSkeleton key={i} />
              ))}
            </div>
          ) : hasHistory ? (
            <div className="projects-grid">
              {filteredHistory.map((item) => {
                const ownerLabel = item.isPublic
                  ? item.sharedBy || "Unknown"
                  : userName || "You";
                return (
                  <ProjectCard
                    key={item.id}
                    project={item}
                    ownerLabel={ownerLabel}
                    isBatchMode={isBatchMode}
                    isSelected={selectedIds.has(item.id)}
                    onSelect={() => toggleSelect(item.id)}
                    onClick={() => navigateToProject(item)}
                    onRename={() => setRenameTarget(item)}
                    onDuplicate={() => handleDuplicate(item)}
                    onDelete={() => setDeleteTarget(item)}
                    onManageTags={() => setTagTarget(item)}
                  />
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={FolderOpen}
              title="No projects yet"
              description="Upload a floor plan to create your first architectural visualization."
              action={{ label: "Upload Floor Plan", onClick: () => document.getElementById("upload")?.scrollIntoView({ behavior: "smooth" }) }}
            />
          )}
        </div>
      </section>

      {/* Dialogs */}
      <RenameDialog
        isOpen={!!renameTarget}
        currentName={renameTarget?.name || `Residence ${renameTarget?.id || ""}`}
        onConfirm={handleRename}
        onCancel={() => setRenameTarget(null)}
        isLoading={dialogLoading}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Project"
        description={`Are you sure you want to delete "${deleteTarget?.name || "this project"}"? This action cannot be undone.`}
        variant="danger"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={dialogLoading}
      />

      <ConfirmDialog
        isOpen={showBatchDeleteConfirm}
        title="Delete Selected Projects"
        description={`Are you sure you want to delete ${selectedIds.size} project(s)? This action cannot be undone.`}
        variant="danger"
        confirmLabel="Delete All"
        onConfirm={handleBatchDelete}
        onCancel={() => setShowBatchDeleteConfirm(false)}
        isLoading={dialogLoading}
      />

      <TagManager
        isOpen={!!tagTarget}
        tags={tagTarget?.tags || []}
        onSave={handleTagsSave}
        onCancel={() => setTagTarget(null)}
        isLoading={dialogLoading}
      />
    </div>
  );
}
