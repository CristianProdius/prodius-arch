export const generate3DView = async ({
  sourceImage,
  projectId,
  options,
}: {
  sourceImage: string;
  projectId?: string | null;
  options?: RenderOptions;
}) => {
  const res = await fetch("/api/render", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sourceImage, projectId, options }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Render failed" }));
    throw new Error(err.error || "Render failed");
  }

  const data = await res.json();
  return { renderedImage: data.renderedImage as string | null, renderedPath: undefined };
};
