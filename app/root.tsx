import React, { useCallback, useEffect, useState } from "react";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigate,
} from "react-router";
import "../index.css";
import { auth } from "../lib/auth";
import { db } from "../lib/db";
import { userSettings } from "../lib/db/schema";
import { eq } from "drizzle-orm";
import { signOut as authSignOut } from "../lib/auth.client";
import { ToastProvider } from "../components/ui/Toast";
import ErrorBoundary from "../components/ErrorBoundary";
import { DEFAULT_SETTINGS } from "../lib/settings";

import type { Route } from "./+types/root";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({ headers: request.headers });

  let settings: UserSettings = DEFAULT_SETTINGS;
  if (session?.user) {
    try {
      const rows = await db
        .select()
        .from(userSettings)
        .where(eq(userSettings.userId, session.user.id));
      if (rows[0]) {
        settings = {
          theme: (rows[0].theme as UserSettings["theme"]) || "light",
          defaultStyle: (rows[0].defaultStyle as StylePreset) || "modern",
          defaultQuality: (rows[0].defaultQuality as QualityLevel) || "standard",
        };
      }
    } catch {
      // DB not ready yet, use defaults
    }
  }

  return {
    user: session?.user
      ? {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          image: session.user.image ?? undefined,
        }
      : null,
    settings,
  };
}

export default function Root() {
  const { user, settings: initialSettings } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<UserSettings>(initialSettings);

  const applyTheme = useCallback((theme: UserSettings["theme"]) => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "system") {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      root.classList.toggle("dark", prefersDark);
    } else {
      root.classList.remove("dark");
    }
  }, []);

  useEffect(() => {
    applyTheme(settings.theme);
  }, [applyTheme, settings.theme]);

  useEffect(() => {
    if (settings.theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      document.documentElement.classList.toggle("dark", e.matches);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [settings.theme]);

  const handleSignIn = () => {
    navigate("/auth/signin");
  };

  const handleSignOut = async () => {
    await authSignOut();
    window.location.href = "/";
  };

  const updateSettings = async (partial: Partial<UserSettings>) => {
    const next = { ...settings, ...partial };
    setSettings(next);
    applyTheme(next.theme);

    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
    } catch {
      // Settings save failed silently
    }
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
                    user,
                    signIn: handleSignIn,
                    signOut: handleSignOut,
                    settings,
                    updateSettings,
                  } satisfies AuthContext}
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
