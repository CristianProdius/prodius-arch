import { useCallback, useEffect, useState } from "react";
import { useOutletContext, useNavigate } from "react-router";
import { User, Layers, Globe, Settings, Upload, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/Button";
import { getProjects } from "@/lib/api";

export const meta = () => [
  { title: "Profile | Prodius Arch" },
  { name: "description", content: "View your Prodius Arch profile and project statistics." },
];

export default function ProfileRoute() {
  const { user, signIn } = useOutletContext<AuthContext>();
  const isSignedIn = !!user;
  const userName = user?.name ?? null;
  const userId = user?.id ?? null;
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, publicCount: 0 });

  const loadStats = useCallback(async () => {
    if (!isSignedIn) return;
    const projects = await getProjects();
    const publicCount = projects.filter((p) => p.isPublic).length;
    setStats({ total: projects.length, publicCount });
  }, [isSignedIn]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <div className="home">
      <Navbar />
      <section className="profile-page">
        <div className="profile-inner">
          {isSignedIn ? (
            <>
              <div className="profile-header">
                <div className="profile-avatar">
                  {userName ? userName[0].toUpperCase() : <User size={28} />}
                </div>
                <div className="profile-info">
                  <h1>{userName || "User"}</h1>
                  {userId && <p className="profile-id">ID: {userId.slice(0, 8)}…</p>}
                </div>
              </div>

              <div className="profile-stats">
                <div className="stat-card">
                  <Layers size={20} />
                  <span className="stat-value">{stats.total}</span>
                  <span className="stat-label">Total Projects</span>
                </div>
                <div className="stat-card">
                  <Globe size={20} />
                  <span className="stat-value">{stats.publicCount}</span>
                  <span className="stat-label">Public Projects</span>
                </div>
              </div>

              <div className="profile-actions">
                <Button onClick={() => navigate("/settings")} variant="outline" size="sm">
                  <Settings size={14} className="mr-2" /> Settings
                </Button>
                <Button onClick={() => navigate("/#upload")} variant="outline" size="sm">
                  <Upload size={14} className="mr-2" /> Upload New
                </Button>
                <Button onClick={() => navigate("/")} variant="outline" size="sm">
                  <Users size={14} className="mr-2" /> Browse Community
                </Button>
              </div>
            </>
          ) : (
            <div className="profile-signed-out">
              <User size={48} className="profile-signed-out-icon" />
              <h1>Sign in to view your profile</h1>
              <p>Create an account to save projects and share with the community.</p>
              <Button onClick={() => signIn()}>Sign In</Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
