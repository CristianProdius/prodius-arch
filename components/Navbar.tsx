import { useNavigate, useOutletContext } from "react-router";
import { Box, Sun, Moon } from "lucide-react";

import { Button } from "./ui/Button";

const Navbar = () => {
  const navigate = useNavigate();
  const { isSignedIn, userName, signIn, signOut, settings, updateSettings } =
    useOutletContext<AuthContext>();

  const handleAuthClick = async () => {
    if (isSignedIn) {
      try {
        await signOut();
      } catch (error) {
        console.error("Puter sign-out failed:", error);
      }
      navigate("/");
      return;
    }

    try {
      await signIn();
    } catch (error) {
      console.error("Puter sign-in failed:", error);
    }
  };

  const toggleDarkMode = () => {
    const next = settings.theme === "dark" ? "light" : "dark";
    updateSettings({ theme: next });
  };

  return (
    <nav className="navbar">
      <div className="inner">
        <div className="left">
          <div className="brand" onClick={() => navigate("/")}>
            <Box className="logo" strokeWidth={2.5} />
            <span className="name">Prodius Arch</span>
          </div>
          <div className="links">
            <a onClick={() => navigate("/")} role="button">Home</a>
            {isSignedIn && (
              <>
                <a onClick={() => navigate("/profile")} role="button">Profile</a>
                <a onClick={() => navigate("/settings")} role="button">Settings</a>
              </>
            )}
          </div>
        </div>

        <div className="actions">
          <button
            className="theme-toggle"
            onClick={toggleDarkMode}
            title="Toggle dark mode"
          >
            {settings.theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {isSignedIn ? (
            <>
              <div
                className="user-avatar"
                onClick={() => navigate("/profile")}
                title={userName || "Profile"}
              >
                {userName ? userName[0].toUpperCase() : "U"}
              </div>

              <Button size="sm" onClick={handleAuthClick} className="btn">
                Log Out
              </Button>
            </>
          ) : (
            <>
              <button onClick={handleAuthClick} className="login">
                Log In
              </button>
              <a href="#upload" className="cta">
                Get Started
              </a>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
