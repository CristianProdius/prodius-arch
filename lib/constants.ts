export const ARCH_RENDER_PROMPT = `
TASK: Convert the input 2D floor plan into a **photorealistic, top‑down 3D architectural render**.

STRICT REQUIREMENTS (do not violate):
1) **REMOVE ALL TEXT**: Do not render any letters, numbers, labels, dimensions, or annotations. Floors must be continuous where text used to be.
2) **GEOMETRY MUST MATCH**: Walls, rooms, doors, and windows must follow the exact lines and positions in the plan. Do not shift or resize.
3) **TOP‑DOWN ONLY**: Orthographic top‑down view. No perspective tilt.
4) **CLEAN, REALISTIC OUTPUT**: Crisp edges, balanced lighting, and realistic materials. No sketch/hand‑drawn look.
5) **NO EXTRA CONTENT**: Do not add rooms, furniture, or objects that are not clearly indicated by the plan.

STRUCTURE & DETAILS:
- **Walls**: Extrude precisely from the plan lines. Consistent wall height and thickness.
- **Doors**: Convert door swing arcs into open doors, aligned to the plan.
- **Windows**: Convert thin perimeter lines into realistic glass windows.

FURNITURE & ROOM MAPPING (only where icons/fixtures are clearly shown):
- Bed icon → realistic bed with duvet and pillows.
- Sofa icon → modern sectional or sofa.
- Dining table icon → table with chairs.
- Kitchen icon → counters with sink and stove.
- Bathroom icon → toilet, sink, and tub/shower.
- Office/study icon → desk, chair, and minimal shelving.
- Porch/patio/balcony icon → outdoor seating or simple furniture (keep minimal).
- Utility/laundry icon → washer/dryer and minimal cabinetry.

STYLE & LIGHTING:
- Lighting: bright, neutral daylight. High clarity and balanced contrast.
- Materials: realistic wood/tile floors, clean walls, subtle shadows.
- Finish: professional architectural visualization; no text, no watermarks, no logos.
`.trim();

export const STYLE_PRESETS: Record<
  StylePreset,
  { label: string; description: string; promptModifier: string }
> = {
  modern: {
    label: "Modern",
    description: "Clean lines, open spaces, contemporary furniture",
    promptModifier:
      "Use a modern design style with clean lines, minimalist furniture, neutral tones, and contemporary finishes.",
  },
  classic: {
    label: "Classic",
    description: "Traditional elegance, rich textures, ornate details",
    promptModifier:
      "Use a classic traditional style with rich wood tones, ornate furniture, elegant textiles, and warm colors.",
  },
  minimalist: {
    label: "Minimalist",
    description: "Essential elements only, monochrome palette",
    promptModifier:
      "Use a minimalist style with only essential furniture, monochrome palette, and maximum open space.",
  },
  industrial: {
    label: "Industrial",
    description: "Exposed materials, raw textures, metal accents",
    promptModifier:
      "Use an industrial style with exposed brick, concrete floors, metal fixtures, and raw material finishes.",
  },
  scandinavian: {
    label: "Scandinavian",
    description: "Light woods, cozy textiles, hygge atmosphere",
    promptModifier:
      "Use a Scandinavian style with light wood floors, white walls, cozy textiles, plants, and warm lighting.",
  },
};

export const LIGHTING_OPTIONS: Record<
  LightingOption,
  { label: string; promptModifier: string }
> = {
  daylight: {
    label: "Daylight",
    promptModifier: "Bright natural daylight flooding through windows.",
  },
  evening: {
    label: "Evening",
    promptModifier:
      "Warm evening golden-hour lighting with soft ambient glow.",
  },
  studio: {
    label: "Studio",
    promptModifier:
      "Professional studio lighting with balanced shadows and highlights.",
  },
  dramatic: {
    label: "Dramatic",
    promptModifier:
      "Dramatic high-contrast lighting with deep shadows and bright highlights.",
  },
};

export const QUALITY_LEVELS: Record<
  QualityLevel,
  { label: string; description: string; resolution: { w: number; h: number } }
> = {
  draft: {
    label: "Draft",
    description: "Fast preview",
    resolution: { w: 512, h: 512 },
  },
  standard: {
    label: "Standard",
    description: "Balanced quality",
    resolution: { w: 1024, h: 1024 },
  },
  high: {
    label: "High",
    description: "Best quality",
    resolution: { w: 1536, h: 1536 },
  },
};
