import React, { useCallback, useEffect, useState } from "react";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import "../index.css";
import {
  getCurrentUser,
  signIn as puterSignIn,
  signOut as puterSignOut,
} from "../lib/puter.action";
import { ToastProvider } from "../components/ui/Toast";
import ErrorBoundary from "../components/ErrorBoundary";
import { getSettings, saveSettings, DEFAULT_SETTINGS } from "../lib/settings";

export default function Root() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);

  const applyTheme = useCallback((theme: UserSettings["theme"]) => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", prefersDark);
    } else {
      root.classList.remove("dark");
    }
  }, []);

  const refreshAuth = async () => {
    try {
      const user = await getCurrentUser();
      setIsSignedIn(!!user);
      setUserName(user?.username || null);
      setUserId(user?.uuid || null);
      return !!user;
    } catch {
      setIsSignedIn(false);
      setUserName(null);
      setUserId(null);
      return false;
    }
  };

  useEffect(() => {
    refreshAuth();
    getSettings().then((s) => {
      setSettings(s);
      applyTheme(s.theme);
    });
  }, [applyTheme]);

  useEffect(() => {
    if (settings.theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      document.documentElement.classList.toggle("dark", e.matches);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [settings.theme]);

  const signIn = async () => {
    const alreadySignedIn = await refreshAuth();
    if (alreadySignedIn) return true;
    await puterSignIn();
    return await refreshAuth();
  };

  const signOut = async () => {
    puterSignOut();
    return await refreshAuth();
  };

  const updateSettings = async (partial: Partial<UserSettings>) => {
    const next = { ...settings, ...partial };
    setSettings(next);
    applyTheme(next.theme);
    await saveSettings(next);
  };

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <Meta />
        <Links />
      </head>
      <body suppressHydrationWarning>
        <ToastProvider>
          <ErrorBoundary>
            <div className="min-h-screen bg-background text-foreground">
              <div className="relative z-10">
                <Outlet
                  context={{
                    isSignedIn,
                    userName,
                    userId,
                    refreshAuth,
                    signIn,
                    signOut,
                    settings,
                    updateSettings,
                  }}
                />
              </div>
            </div>
          </ErrorBoundary>
        </ToastProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
