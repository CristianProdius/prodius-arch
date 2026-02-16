import { puter } from "@heyputer/puter.js";
import {
  ARCH_RENDER_PROMPT,
  STYLE_PRESETS,
  LIGHTING_OPTIONS,
  QUALITY_LEVELS,
} from "@/lib/constants";

const fetchAsDataUrl = async (url: string): Promise<string> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch source image.");
  const blob = await response.blob();

  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read source image."));
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
};

export const generate3DView = async ({
  sourceImage,
  projectId,
  options,
}: {
  sourceImage: string;
  projectId?: string | null;
  options?: RenderOptions;
}) => {
  const dataUrl = sourceImage.startsWith("data:")
    ? sourceImage
    : await fetchAsDataUrl(sourceImage);

  const base64Data = dataUrl.split(",")[1];
  const mimeType = dataUrl.split(";")[0].split(":")[1];

  if (!base64Data || !mimeType) {
    throw new Error("Invalid source image payload.");
  }

  let prompt = ARCH_RENDER_PROMPT;
  let resolution = { w: 1024, h: 1024 };

  if (options) {
    const stylePreset = STYLE_PRESETS[options.style];
    const lightingOption = LIGHTING_OPTIONS[options.lighting];
    const qualityLevel = QUALITY_LEVELS[options.quality];

    if (stylePreset) {
      prompt += `\n\nSTYLE OVERRIDE: ${stylePreset.promptModifier}`;
    }
    if (lightingOption) {
      prompt += `\nLIGHTING OVERRIDE: ${lightingOption.promptModifier}`;
    }
    if (qualityLevel) {
      resolution = qualityLevel.resolution;
    }
  }

  const response = await puter.ai.txt2img(prompt, {
    provider: "gemini",
    model: "gemini-2.5-flash-image-preview",
    input_image: base64Data,
    input_image_mime_type: mimeType,
    ratio: resolution,
  });

  const rawImageUrl =
    response instanceof HTMLImageElement
      ? response.src
      : typeof response === "string"
        ? response
        : (response as Record<string, unknown>)?.src ??
          (response as Record<string, unknown>)?.url ??
          null;

  if (!rawImageUrl) return { renderedImage: null, renderedPath: undefined };

  const renderedImage = rawImageUrl.startsWith("data:")
    ? rawImageUrl
    : await fetchAsDataUrl(rawImageUrl);

  return { renderedImage, renderedPath: undefined };
};
