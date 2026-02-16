import { requireAuth } from "../../lib/server/auth";
import { uploadImage } from "../../lib/server/s3";
import { getImageExtension } from "../../lib/utils";

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function action({ request }: { request: Request }) {
  await requireAuth(request);

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const projectId = formData.get("projectId") as string | null;
  const label = (formData.get("label") as string) || "source";

  if (!file || !projectId) {
    return jsonResponse({ error: "File and projectId required" }, 400);
  }

  const ext = getImageExtension(file.type, file.name);
  const key = `projects/${projectId}/${label}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  const url = await uploadImage(buffer, key, file.type);

  return jsonResponse({ url });
}
