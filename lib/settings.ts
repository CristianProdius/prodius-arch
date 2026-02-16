import { puter } from "@heyputer/puter.js";

const SETTINGS_KEY = "roomify_user_settings";

export const DEFAULT_SETTINGS: UserSettings = {
  theme: "light",
  defaultStyle: "modern",
  defaultQuality: "standard",
};

export const getSettings = async (): Promise<UserSettings> => {
  try {
    const stored = await puter.kv.get(SETTINGS_KEY);
    if (stored && typeof stored === "object") {
      return { ...DEFAULT_SETTINGS, ...(stored as Partial<UserSettings>) };
    }
  } catch {
    // Puter KV not available, try localStorage
  }

  try {
    const local = localStorage.getItem(SETTINGS_KEY);
    if (local) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(local) };
    }
  } catch {
    // localStorage not available
  }

  return DEFAULT_SETTINGS;
};

export const saveSettings = async (settings: UserSettings): Promise<void> => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // localStorage not available
  }

  try {
    await puter.kv.set(SETTINGS_KEY, settings);
  } catch {
    // Puter KV not available
  }
};
