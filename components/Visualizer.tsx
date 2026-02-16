import { useEffect, useRef, useState } from "react";
import {
  Box,
  Download,
  RefreshCw,
  Share2,
  X,
  ChevronDown,
  ChevronUp,
  Pencil,
  Trash2,
  Copy,
} from "lucide-react";
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from "react-compare-slider";
import { useOutletContext } from "react-router";

import { Button } from "./ui/Button";
import { useToast } from "./ui/Toast";
import ConfirmDialog from "./ui/ConfirmDialog";
import RenameDialog from "./RenameDialog";
import RenderOptionsPanel from "./RenderOptionsPanel";
import RenderHistoryStrip from "./RenderHistoryStrip";
import AuthRequiredModal from "./AuthRequiredModal";

import { generate3DView } from "@/lib/ai.action";

const Visualizer = ({
  onBack,
  initialImage,
  onRenderComplete,
  onShare,
  onUnshare,
  onRename,
  onDelete,
  onDuplicate,
  projectName,
  projectId,
  initialRender,
  isPublic = false,
  sharedBy = null,
  canUnshare = false,
  renderHistory: initialHistory = [],
  onRenderHistoryUpdate,
}: VisualizerProps) => {
  const { isSignedIn, signIn, settings } = useOutletContext<AuthContext>();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [authRequired, setAuthRequired] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(
    initialRender || null,
  );
  const [generationError, setGenerationError] = useState(false);
  const [shareStatus, setShareStatus] = useState<ShareStatus>("idle");
  const [shareAction, setShareAction] = useState<ShareAction | null>(null);

  // Render options
  const [showOptions, setShowOptions] = useState(false);
  const [renderOptions, setRenderOptions] = useState<RenderOptions>({
    style: settings.defaultStyle || "modern",
    lighting: "daylight",
    quality: settings.defaultQuality || "standard",
  });

  // Render history
  const [renderHistory, setRenderHistory] = useState<RenderHistoryEntry[]>(initialHistory);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);

  // Visualizer-level dialogs
  const [showRename, setShowRename] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [displayName, setDisplayName] = useState(projectName || "Untitled Project");

  const hasInitialGenerated = useRef(false);
  const currentImageRef = useRef<string | null>(initialRender || null);

  const handleExport = () => {
    if (!currentImage) return;
    const link = document.createElement("a");
    link.href = currentImage;
    link.download = `prodius-arch-render-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("success", "Image exported.");
  };

  const handleShareToggle = async () => {
    if (!currentImage || isProcessing) return;
    if (!isSignedIn) {
      setAuthRequired(true);
      return;
    }

    const nextAction: ShareAction = isPublic ? "unshare" : "share";
    if (nextAction === "share" && !onShare) return;
    if (nextAction === "unshare" && (!onUnshare || !canUnshare)) return;

    setShareAction(nextAction);
    setShareStatus("saving");

    try {
      if (nextAction === "share") {
        await onShare(currentImage);
        toast("success", "Project shared to community.");
      } else {
        await onUnshare(currentImage);
        toast("success", "Project unshared.");
      }

      setShareStatus("done");
      window.setTimeout(() => {
        setShareStatus("idle");
        setShareAction(null);
      }, 1500);
    } catch (error) {
      console.error(`${nextAction} failed:`, error);
      toast("error", `Failed to ${nextAction} project.`);
      setShareStatus("idle");
      setShareAction(null);
    }
  };

  const runGeneration = async (opts?: RenderOptions) => {
    if (!initialImage) return;

    setAuthRequired(false);

    try {
      if (!isSignedIn) {
        setAuthRequired(true);
        return;
      }

      setIsProcessing(true);
      setGenerationError(false);

      const usedOptions = opts || renderOptions;

      const result = await generate3DView({
        sourceImage: initialImage,
        projectId,
        options: usedOptions,
      });

      if (result.renderedImage) {
        setCurrentImage(result.renderedImage);
        currentImageRef.current = result.renderedImage;
        toast("success", "Render complete!");

        // Add to render history
        const entry: RenderHistoryEntry = {
          id: `render-${Date.now()}`,
          renderedImage: result.renderedImage,
          timestamp: Date.now(),
          style: usedOptions.style,
        };
        const updatedHistory = [entry, ...renderHistory].slice(0, 10);
        setRenderHistory(updatedHistory);
        setActiveHistoryId(entry.id);
        onRenderHistoryUpdate?.(updatedHistory);

        if (onRenderComplete) {
          onRenderComplete({
            renderedImage: result.renderedImage,
            renderedPath: result.renderedPath,
          });
        }
      } else {
        setGenerationError(true);
        toast("error", "Generation failed. Please try again.");
      }
    } catch (error: any) {
      console.error("Generation failed:", error);
      toast("error", "Generation failed. Please try again.");
      if (error?.status === 401 || error?.status === 403) {
        setAuthRequired(true);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRenameConfirm = async (name: string) => {
    setShowRename(false);
    setDisplayName(name);
    if (onRename) {
      await onRename(name);
      toast("success", "Project renamed.");
    }
  };

  const handleDeleteConfirm = async () => {
    setShowDeleteConfirm(false);
    if (onDelete) {
      await onDelete();
      toast("success", "Project deleted.");
    }
  };

  const handleDuplicate = async () => {
    if (onDuplicate) {
      await onDuplicate();
      toast("success", "Project duplicated.");
    }
  };

  const isReadOnlyShared = isPublic && !canUnshare;
  const isOwner = !isPublic || canUnshare;

  const getShareLabel = () => {
    if (isReadOnlyShared) return "Shared";
    switch (shareStatus) {
      case "saving":
        return shareAction === "unshare" ? "Unsharing…" : "Sharing…";
      case "done":
        return shareAction === "unshare" ? "Unshared" : "Shared";
      case "idle":
      default:
        return isPublic ? "Unshare" : "Share";
    }
  };

  useEffect(() => {
    if (!initialImage || hasInitialGenerated.current) return;
    if (initialRender) {
      setCurrentImage(initialRender);
      hasInitialGenerated.current = true;
      return;
    }
    hasInitialGenerated.current = true;
    runGeneration();
  }, [initialImage, initialRender]);

  useEffect(() => {
    if (!initialRender || isProcessing) return;
    if (initialRender === currentImageRef.current) return;
    setCurrentImage(initialRender);
    currentImageRef.current = initialRender;
  }, [initialRender, isProcessing]);

  return (
    <div className="visualizer">
      <AuthRequiredModal
        isOpen={authRequired}
        onConfirm={async () => {
          try {
            const signedIn = await signIn();
            if (!signedIn) return;
            setAuthRequired(false);
            if (!currentImage && initialImage) {
              hasInitialGenerated.current = true;
              runGeneration();
            }
          } catch (error) {
            console.error("Puter sign-in failed:", error);
          }
        }}
        onCancel={() => {
          setAuthRequired(false);
          setIsProcessing(false);
        }}
        description="Sign in with your Puter account to generate and share visualizations."
      />

      <RenameDialog
        isOpen={showRename}
        currentName={displayName}
        onConfirm={handleRenameConfirm}
        onCancel={() => setShowRename(false)}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Project"
        description="Are you sure you want to delete this project? This cannot be undone."
        variant="danger"
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      <nav className="topbar">
        <div className="brand" onClick={onBack}>
          <Box className="logo" />
          <span className="name">Prodius Arch</span>
        </div>
        <div className="topbar-actions">
          {isOwner && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRename(true)}
                title="Rename"
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDuplicate}
                title="Duplicate"
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                title="Delete"
                className="topbar-delete"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
          <Button variant="ghost" size="sm" onClick={onBack} className="exit">
            <X className="icon" /> Exit Editor
          </Button>
        </div>
      </nav>

      <div className="content">
        <div className="panel">
          <div className="panel-header">
            <div className="panel-meta">
              <p>Project</p>
              <h2>{displayName}</h2>
              <p className="note">
                {isPublic
                  ? `Shared by ${sharedBy || "Unknown"}`
                  : "Created by You"}
              </p>
            </div>
            <div className="panel-actions">
              <Button
                size="sm"
                onClick={handleExport}
                className="export"
                disabled={!currentImage}
              >
                <Download className="w-4 h-4 mr-2" /> Export
              </Button>
              <Button
                size="sm"
                onClick={handleShareToggle}
                className="share"
                disabled={
                  !currentImage ||
                  isProcessing ||
                  shareStatus === "saving" ||
                  (isPublic ? !onUnshare || !canUnshare : !onShare)
                }
              >
                <Share2 className="w-4 h-4 mr-2" />
                {getShareLabel()}
              </Button>
            </div>
          </div>

          {/* Collapsible Render Options */}
          <div className="render-options-toggle">
            <button
              className="toggle-btn"
              onClick={() => setShowOptions((p) => !p)}
            >
              {showOptions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              <span>Render Options</span>
            </button>
          </div>
          {showOptions && (
            <RenderOptionsPanel
              options={renderOptions}
              onChange={setRenderOptions}
              onGenerate={() => runGeneration(renderOptions)}
              isProcessing={isProcessing}
            />
          )}

          <div className={`render-area ${isProcessing ? "is-processing" : ""}`}>
            {currentImage ? (
              <img src={currentImage} alt="AI Render" className="render-img" />
            ) : (
              <div className="render-placeholder">
                {initialImage && (
                  <img
                    src={initialImage}
                    alt="Original"
                    className="render-fallback"
                  />
                )}
              </div>
            )}

            {isProcessing && (
              <div className="render-overlay">
                <div className="rendering-card">
                  <RefreshCw className="spinner" />
                  <span className="title">Rendering…</span>
                  <span className="subtitle">
                    Generating your 3D visualization
                  </span>
                </div>
              </div>
            )}

            {generationError && !isProcessing && (
              <div className="render-overlay">
                <div className="rendering-card">
                  <span className="title">Generation failed</span>
                  <span className="subtitle">
                    The AI could not produce an image. Please try again.
                  </span>
                  <Button
                    size="sm"
                    onClick={() => {
                      setGenerationError(false);
                      runGeneration();
                    }}
                    style={{ marginTop: "0.75rem" }}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" /> Retry
                  </Button>
                </div>
              </div>
            )}
          </div>

          <RenderHistoryStrip
            history={renderHistory}
            activeId={activeHistoryId}
            onSelect={(entry) => {
              setCurrentImage(entry.renderedImage);
              currentImageRef.current = entry.renderedImage;
              setActiveHistoryId(entry.id);
            }}
          />
        </div>

        <div className="panel compare">
          <div className="panel-header">
            <div className="panel-meta">
              <p>Comparison</p>
              <h3>Before vs After</h3>
            </div>
            <div className="hint">Drag to compare</div>
          </div>

          <div className="compare-stage">
            {initialImage && currentImage ? (
              <ReactCompareSlider
                defaultValue={50}
                style={{ width: "100%", height: "auto" }}
                itemOne={
                  <ReactCompareSliderImage
                    src={initialImage}
                    alt="Before"
                    className="compare-img"
                  />
                }
                itemTwo={
                  <ReactCompareSliderImage
                    src={currentImage}
                    alt="After"
                    className="compare-img"
                  />
                }
              />
            ) : (
              <div className="compare-fallback">
                {initialImage && (
                  <img
                    src={initialImage}
                    alt="Before"
                    className="compare-img"
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Visualizer;
