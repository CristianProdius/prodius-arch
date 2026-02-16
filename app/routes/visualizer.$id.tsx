import React, { useEffect, useState } from "react";
import {
  Navigate,
  useLocation,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router";

import {
  getProjectById,
  saveProject,
  shareProject,
  unshareProject,
  renameProject,
  deleteProject,
  duplicateProject,
} from "@/lib/api";

import Visualizer from "@/components/Visualizer";

export const meta = ({ params }: { params: { id: string } }) => [
  { title: `Project ${params.id} | Prodius Arch` },
  { name: "description", content: "View and edit your AI architectural visualization." },
  { property: "og:title", content: `Project ${params.id} | Prodius Arch` },
  { property: "og:description", content: "AI-powered architectural visualization" },
  { name: "twitter:card", content: "summary_large_image" },
];

export default function VisualizerRoute() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [resolvedItem, setResolvedItem] = useState<DesignHistoryItem | null>(
    null,
  );
  const [isResolving, setIsResolving] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedInitialRender, setSelectedInitialRender] = useState<
    string | null
  >(null);
  const { user, signIn } = useOutletContext<AuthContext>();
  const currentUserId = user?.id ?? null;
  const isSignedIn = !!user;

  const search = new URLSearchParams(location.search);
  const sourceParam = search.get("source");
  const queryScope: "private" | "public" =
    sourceParam === "public"
      ? "public"
      : sourceParam === "private" || sourceParam === "user"
        ? "private"
        : "public";
  const queryOwnerId = search.get("ownerId");
  const isPublicProject = queryScope === "public";

  const fetchProjectById = async (
    projectId: string,
    scope: "private" | "public",
    ownerId?: string | null,
  ) => {
    if (scope === "private" && !isSignedIn) {
      signIn();
      return null;
    }

    return await getProjectById({ id: projectId, scope, ownerId });
  };

  const handleRenderComplete = async (payload: {
    renderedImage: string;
    renderedPath?: string;
  }) => {
    if (!id) return;
    const sourceImage = resolvedItem?.sourceImage || uploadedImage || "";
    const updatedItem: DesignHistoryItem = {
      id,
      name: resolvedItem?.name || `Residence ${id}`,
      sourceImage,
      renderedImage: payload.renderedImage,
      timestamp: Date.now(),
      ownerId: resolvedItem?.ownerId || null,
      isPublic: resolvedItem?.isPublic || false,
      renderHistory: resolvedItem?.renderHistory,
    };
    setResolvedItem(updatedItem);
    const saved = await saveProject(
      updatedItem,
      updatedItem.isPublic ? "public" : "private",
    );
    if (saved) {
      setResolvedItem(saved);
      if (saved.sourceImage) setUploadedImage(saved.sourceImage);
      if (saved.renderedImage) setSelectedInitialRender(saved.renderedImage);
    }
  };

  const handleShareCurrent = async (
    image: string,
    opts?: { visibility?: "private" | "public" },
  ) => {
    if (!id) return;
    const visibility = opts?.visibility || "public";
    const updatedItem: DesignHistoryItem = {
      id,
      name: resolvedItem?.name || `Residence ${id}`,
      sourceImage: uploadedImage || "",
      renderedImage: image,
      timestamp: Date.now(),
      ownerId:
        visibility === "public"
          ? resolvedItem?.ownerId || currentUserId || null
          : resolvedItem?.ownerId || null,
      isPublic: visibility === "public",
    };
    setResolvedItem(updatedItem);
    if (visibility === "public") {
      const saved = await shareProject(updatedItem);
      if (saved) {
        setResolvedItem(saved);
        if (saved.sourceImage) setUploadedImage(saved.sourceImage);
        if (saved.renderedImage) setSelectedInitialRender(saved.renderedImage);
      }
    } else {
      const saved = await unshareProject(updatedItem);
      if (saved) {
        setResolvedItem(saved);
        if (saved.sourceImage) setUploadedImage(saved.sourceImage);
        if (saved.renderedImage) setSelectedInitialRender(saved.renderedImage);
      }
    }
  };

  const handleRename = async (name: string) => {
    if (!id) return;
    await renameProject(id, name);
    setResolvedItem((prev) => (prev ? { ...prev, name } : prev));
  };

  const handleDelete = async () => {
    if (!id) return;
    const ok = await deleteProject(id);
    if (ok) navigate("/");
  };

  const handleDuplicate = async () => {
    if (!id) return;
    const result = await duplicateProject(id);
    if (result) {
      navigate(`/visualizer/${result.id}?source=private`, {
        state: {
          initialImage: result.sourceImage,
          initialRender: result.renderedImage || null,
          name: result.name || null,
        },
      });
    }
  };

  const handleRenderHistoryUpdate = async (history: RenderHistoryEntry[]) => {
    if (!id || !resolvedItem) return;
    const updatedItem = { ...resolvedItem, renderHistory: history };
    setResolvedItem(updatedItem);
    await saveProject(updatedItem, updatedItem.isPublic ? "public" : "private");
  };

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const state = (location.state || {}) as VisualizerLocationState;

    if (state.initialImage) {
      const item: DesignHistoryItem = {
        id,
        name: state.name || null,
        sourceImage: state.initialImage,
        renderedImage: state.initialRender || undefined,
        timestamp: Date.now(),
        ownerId: state.ownerId || queryOwnerId || null,
        isPublic: isPublicProject,
        sharedBy: state.sharedBy || null,
      };
      setResolvedItem(item);
      setUploadedImage(state.initialImage);
      setSelectedInitialRender(state.initialRender || null);
      if (state.initialRender) return;
    }

    const resolve = async () => {
      setIsResolving(true);
      const fetched = await fetchProjectById(id, queryScope, queryOwnerId);
      if (cancelled) return;
      if (fetched) {
        setResolvedItem(fetched);
        setUploadedImage(fetched.sourceImage || null);
        setSelectedInitialRender(fetched.renderedImage || null);
      }
      setIsResolving(false);
    };

    resolve();

    return () => {
      cancelled = true;
    };
  }, [id, location.state, queryScope, queryOwnerId, isPublicProject]);

  if (!id) return <Navigate to="/" replace />;

  const effectiveInitialImage = resolvedItem?.sourceImage || uploadedImage;
  const effectiveInitialRender =
    selectedInitialRender ?? resolvedItem?.renderedImage ?? null;

  if (!effectiveInitialImage && isResolving) {
    return (
      <div className="visualizer-route loading">
        Loading project…
      </div>
    );
  }

  const resolvedName =
    resolvedItem?.name || (id ? `Residence ${id}` : "Untitled Project");
  const resolvedIsPublic = resolvedItem?.isPublic ?? isPublicProject;
  const canUnshare =
    resolvedIsPublic &&
    !!currentUserId &&
    resolvedItem?.ownerId === currentUserId;

  return (
    <Visualizer
      onBack={() => navigate("/")}
      initialImage={effectiveInitialImage}
      onRenderComplete={handleRenderComplete}
      onShare={(image) => handleShareCurrent(image, { visibility: "public" })}
      onUnshare={(image) =>
        handleShareCurrent(image, { visibility: "private" })
      }
      onRename={handleRename}
      onDelete={handleDelete}
      onDuplicate={handleDuplicate}
      projectName={resolvedName}
      projectId={id}
      initialRender={effectiveInitialRender}
      isPublic={resolvedIsPublic}
      sharedBy={resolvedItem?.sharedBy || null}
      canUnshare={canUnshare}
      renderHistory={resolvedItem?.renderHistory || []}
      onRenderHistoryUpdate={handleRenderHistoryUpdate}
    />
  );
}
