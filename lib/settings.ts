export const DEFAULT_SETTINGS: UserSettings = {
  theme: "light",
  defaultStyle: "modern",
  defaultQuality: "standard",
};

export const getSettings = async (): Promise<UserSettings> => {
  try {
    const res = await fetch("/api/settings");
    if (res.ok) {
      const data = await res.json();
      return { ...DEFAULT_SETTINGS, ...data };
    }
  } catch {
    // API not available
  }
  return DEFAULT_SETTINGS;
};

export const saveSettings = async (settings: UserSettings): Promise<void> => {
  try {
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
  } catch {
    // Save failed silently
  }
};
