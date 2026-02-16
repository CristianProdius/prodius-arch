import { GoogleGenerativeAI } from "@google/generative-ai";
import { requireAuth } from "../../lib/server/auth";
import { uploadImage } from "../../lib/server/s3";
import {
  ARCH_RENDER_PROMPT,
  STYLE_PRESETS,
  LIGHTING_OPTIONS,
  QUALITY_LEVELS,
} from "../../lib/constants";

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function action({ request }: { request: Request }) {
  await requireAuth(request);

  const { sourceImage, projectId, options } = (await request.json()) as {
    sourceImage: string;
    projectId?: string | null;
    options?: RenderOptions;
  };

  if (!sourceImage) {
    return jsonResponse({ error: "sourceImage is required" }, 400);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return jsonResponse({ error: "GEMINI_API_KEY not configured" }, 500);
  }

  // Extract base64 and mime type from data URL
  let base64Data: string;
  let mimeType: string;

  if (sourceImage.startsWith("data:")) {
    base64Data = sourceImage.split(",")[1];
    mimeType = sourceImage.split(";")[0].split(":")[1];
  } else {
    // Fetch remote image and convert to base64
    const res = await fetch(sourceImage);
    if (!res.ok) throw new Error("Failed to fetch source image");
    const buffer = await res.arrayBuffer();
    base64Data = Buffer.from(buffer).toString("base64");
    mimeType = res.headers.get("content-type") || "image/png";
  }

  if (!base64Data || !mimeType) {
    return jsonResponse({ error: "Invalid source image" }, 400);
  }

  // Build prompt with overrides
  let prompt = ARCH_RENDER_PROMPT;

  if (options) {
    const stylePreset = STYLE_PRESETS[options.style];
    const lightingOption = LIGHTING_OPTIONS[options.lighting];

    if (stylePreset) {
      prompt += `\n\nSTYLE OVERRIDE: ${stylePreset.promptModifier}`;
    }
    if (lightingOption) {
      prompt += `\nLIGHTING OVERRIDE: ${lightingOption.promptModifier}`;
    }
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp",
    generationConfig: {
      responseModalities: ["image", "text"],
    } as any,
  });

  const result = await model.generateContent([
    { text: prompt },
    {
      inlineData: {
        mimeType,
        data: base64Data,
      },
    },
  ]);

  const response = result.response;
  const parts = response.candidates?.[0]?.content?.parts;

  if (!parts) {
    return jsonResponse({ error: "No response from AI" }, 500);
  }

  // Find the image part in the response
  let renderedImage: string | null = null;
  for (const part of parts) {
    if (part.inlineData) {
      const imgMime = part.inlineData.mimeType || "image/png";
      const imgData = part.inlineData.data;
      renderedImage = `data:${imgMime};base64,${imgData}`;

      // Upload to S3 if we have a projectId
      if (projectId && imgData) {
        try {
          const ext = imgMime.includes("png") ? "png" : "jpg";
          const key = `projects/${projectId}/rendered.${ext}`;
          const buffer = Buffer.from(imgData, "base64");
          const s3Url = await uploadImage(buffer, key, imgMime);
          renderedImage = s3Url;
        } catch {
          // If S3 upload fails, return the data URL
        }
      }
      break;
    }
  }

  if (!renderedImage) {
    return jsonResponse({ error: "No image in AI response" }, 500);
  }

  return jsonResponse({ renderedImage });
}
