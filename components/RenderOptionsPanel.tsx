import { Sun, Sunset, Lightbulb, Moon } from "lucide-react";
import { STYLE_PRESETS, LIGHTING_OPTIONS, QUALITY_LEVELS } from "@/lib/constants";
import { Button } from "./ui/Button";

const LIGHTING_ICONS: Record<LightingOption, typeof Sun> = {
  daylight: Sun,
  evening: Sunset,
  studio: Lightbulb,
  dramatic: Moon,
};

interface RenderOptionsPanelProps {
  options: RenderOptions;
  onChange: (options: RenderOptions) => void;
  onGenerate: () => void;
  isProcessing: boolean;
}

const RenderOptionsPanel = ({
  options,
  onChange,
  onGenerate,
  isProcessing,
}: RenderOptionsPanelProps) => {
  return (
    <div className="render-options">
      <div className="render-options-section">
        <h4>Style Preset</h4>
        <div className="style-grid">
          {(Object.entries(STYLE_PRESETS) as [StylePreset, typeof STYLE_PRESETS[StylePreset]][]).map(
            ([key, preset]) => (
              <button
                key={key}
                className={`style-card ${options.style === key ? "style-card--active" : ""}`}
                onClick={() => onChange({ ...options, style: key })}
              >
                <span className="style-name">{preset.label}</span>
                <span className="style-desc">{preset.description}</span>
              </button>
            ),
          )}
        </div>
      </div>

      <div className="render-options-section">
        <h4>Lighting</h4>
        <div className="lighting-row">
          {(Object.entries(LIGHTING_OPTIONS) as [LightingOption, typeof LIGHTING_OPTIONS[LightingOption]][]).map(
            ([key, opt]) => {
              const Icon = LIGHTING_ICONS[key];
              return (
                <button
                  key={key}
                  className={`lighting-btn ${options.lighting === key ? "lighting-btn--active" : ""}`}
                  onClick={() => onChange({ ...options, lighting: key })}
                >
                  <Icon size={18} />
                  <span>{opt.label}</span>
                </button>
              );
            },
          )}
        </div>
      </div>

      <div className="render-options-section">
        <h4>Quality</h4>
        <div className="quality-control">
          {(Object.entries(QUALITY_LEVELS) as [QualityLevel, typeof QUALITY_LEVELS[QualityLevel]][]).map(
            ([key, level]) => (
              <button
                key={key}
                className={`quality-btn ${options.quality === key ? "quality-btn--active" : ""}`}
                onClick={() => onChange({ ...options, quality: key })}
              >
                <span className="quality-label">{level.label}</span>
                <span className="quality-desc">{level.description}</span>
              </button>
            ),
          )}
        </div>
      </div>

      <Button
        onClick={onGenerate}
        disabled={isProcessing}
        fullWidth
        className="generate-cta"
      >
        {isProcessing ? "Generating…" : "Generate Render"}
      </Button>
    </div>
  );
};

export default RenderOptionsPanel;
