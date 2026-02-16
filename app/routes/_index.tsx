import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useOutletContext } from "react-router";
import { ArrowRight, ArrowUpRight, Clock, Layers } from "lucide-react";

import Upload from "@/components/Upload";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/Button";

import { getProjects, saveProject } from "@/lib/puter.action";

export default function IndexRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const [designHistory, setDesignHistory] = useState<DesignHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { isSignedIn, userName, signIn, refreshAuth } =
    useOutletContext<AuthContext>();

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

  const handleUploadComplete = async (base64Image: string) => {
    setUploadError(null);

    const ensuredSignedIn = isSignedIn ? true : await refreshAuth();
    if (!ensuredSignedIn) {
      const signedIn = await signIn();
      if (!signedIn) return false;
    }

    const newId = Date.now().toString();
    const name = `Residence ${newId}`;

    const newItem = {
      id: newId,
      name,
      sourceImage: base64Image,
      renderedImage: undefined,
      timestamp: Date.now(),
    };

    const saved = await saveProject(newItem, "private");
    if (!saved) {
      console.error("Failed to host source image; project not saved.");
      setUploadError("Failed to save project. Please try again.");
      return false;
    }

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

  const hasHistory = designHistory.length > 0;

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
          </div>

          {isLoadingHistory ? (
            <div className="loading">Loading your projects…</div>
          ) : (
            <div className="projects-grid">
              {hasHistory ? (
                designHistory.map((item, index) => {
                  const ownerLabel = item.isPublic
                    ? item.sharedBy || "Unknown"
                    : userName || "You";
                  const name = item.name || `Residence ${item.id}`;
                  return (
                    <div
                      key={item.id || `${item.timestamp}-${index}`}
                      onClick={() => {
                        const scope = item.isPublic ? "public" : "private";
                        const ownerParam = item.ownerId
                          ? `&ownerId=${encodeURIComponent(item.ownerId)}`
                          : "";
                        navigate(
                          `/visualizer/${item.id}?source=${scope}${ownerParam}`,
                          {
                            state: {
                              initialImage: item.sourceImage,
                              initialRender: item.renderedImage || null,
                              ownerId: item.ownerId || null,
                              name: item.name || null,
                              sharedBy: item.sharedBy || null,
                            },
                          },
                        );
                      }}
                      className="project-card group"
                    >
                      <div className="preview">
                        <img
                          src={item.renderedImage || item.sourceImage}
                          alt={`Project ${designHistory.length - index}`}
                        />
                        {item.isPublic && (
                          <div className="badge">
                            <span>Community</span>
                          </div>
                        )}
                      </div>

                      <div className="card-body">
                        <div>
                          <h3>{name}</h3>
                          <div className="meta">
                            <Clock size={12} />
                            <span>
                              {new Date(item.timestamp).toLocaleDateString()}
                            </span>
                            <span>By {ownerLabel}</span>
                          </div>
                        </div>
                        <div className="arrow">
                          <ArrowUpRight size={18} />
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="empty">
                  No projects yet. Upload a floor plan to create your first one.
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
