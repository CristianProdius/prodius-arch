import { useOutletContext, useNavigate } from "react-router";
import { Sun, Moon, Monitor } from "lucide-react";
import Navbar from "@/components/Navbar";
import { STYLE_PRESETS, QUALITY_LEVELS } from "@/lib/constants";

export const meta = () => [
  { title: "Settings | Prodius Arch" },
  { name: "description", content: "Manage your Prodius Arch preferences and settings." },
];

export default function SettingsRoute() {
  const { settings, updateSettings } = useOutletContext<AuthContext>();
  const navigate = useNavigate();

  const themes: { value: UserSettings["theme"]; label: string; icon: typeof Sun }[] = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  return (
    <div className="home">
      <Navbar />
      <section className="settings-page">
        <div className="settings-inner">
          <h1>Settings</h1>
          <p className="settings-subtitle">Manage your preferences.</p>

          <div className="settings-section">
            <h2>Appearance</h2>
            <div className="theme-cards">
              {themes.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  className={`theme-card ${settings.theme === value ? "theme-card--active" : ""}`}
                  onClick={() => updateSettings({ theme: value })}
                >
                  <Icon size={24} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="settings-section">
            <h2>Default Render Style</h2>
            <div className="style-grid">
              {(Object.entries(STYLE_PRESETS) as [StylePreset, typeof STYLE_PRESETS[StylePreset]][]).map(
                ([key, preset]) => (
                  <button
                    key={key}
                    className={`style-card ${settings.defaultStyle === key ? "style-card--active" : ""}`}
                    onClick={() => updateSettings({ defaultStyle: key })}
                  >
                    <span className="style-name">{preset.label}</span>
                    <span className="style-desc">{preset.description}</span>
                  </button>
                ),
              )}
            </div>
          </div>

          <div className="settings-section">
            <h2>Default Quality</h2>
            <div className="quality-control">
              {(Object.entries(QUALITY_LEVELS) as [QualityLevel, typeof QUALITY_LEVELS[QualityLevel]][]).map(
                ([key, level]) => (
                  <button
                    key={key}
                    className={`quality-btn ${settings.defaultQuality === key ? "quality-btn--active" : ""}`}
                    onClick={() => updateSettings({ defaultQuality: key })}
                  >
                    <span className="quality-label">{level.label}</span>
                    <span className="quality-desc">{level.description}</span>
                  </button>
                ),
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
