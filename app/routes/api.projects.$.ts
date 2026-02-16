import { requireAuth } from "../../lib/server/auth";
import {
  listProjects,
  getProject,
  upsertProject,
  deleteProject,
  renameProject,
  duplicateProject,
  batchDeleteProjects,
  updateProjectTags,
} from "../../lib/server/projects";

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function getEndpoint(url: string) {
  const u = new URL(url);
  const match = u.pathname.match(/\/api\/projects\/(.+)/);
  return match?.[1] ?? "";
}

export async function loader({ request }: { request: Request }) {
  const session = await requireAuth(request);
  const endpoint = getEndpoint(request.url);
  const url = new URL(request.url);

  switch (endpoint) {
    case "list": {
      const items = await listProjects(session.user.id);
      return jsonResponse({ projects: items });
    }
    case "get": {
      const id = url.searchParams.get("id");
      const scope = (url.searchParams.get("scope") || "public") as
        | "private"
        | "public";
      const ownerId = url.searchParams.get("ownerId");
      if (!id) return jsonResponse({ error: "Project id required" }, 400);
      const project = await getProject(id, scope, ownerId);
      if (!project) return jsonResponse({ error: "Project not found" }, 404);
      return jsonResponse({ project });
    }
    default:
      return jsonResponse({ error: "Not found" }, 404);
  }
}

export async function action({ request }: { request: Request }) {
  const session = await requireAuth(request);
  const endpoint = getEndpoint(request.url);
  const body = await request.json();

  switch (endpoint) {
    case "save": {
      const { project, visibility = "private" } = body;
      if (!project?.id || !project?.sourceImage) {
        return jsonResponse(
          { error: "Project id and image required" },
          400
        );
      }
      const saved = await upsertProject(
        project,
        visibility,
        session.user.id,
        session.user.name
      );
      return jsonResponse({ saved: true, id: project.id, project: saved });
    }
    case "delete": {
      const { id } = body;
      if (!id) return jsonResponse({ error: "Project id required" }, 400);
      await deleteProject(id, session.user.id);
      return jsonResponse({ deleted: true, id });
    }
    case "rename": {
      const { id, name } = body;
      if (!id || !name)
        return jsonResponse({ error: "Project id and name required" }, 400);
      const project = await renameProject(id, name, session.user.id);
      if (!project)
        return jsonResponse({ error: "Project not found" }, 404);
      return jsonResponse({ renamed: true, id, project });
    }
    case "duplicate": {
      const { id } = body;
      if (!id) return jsonResponse({ error: "Project id required" }, 400);
      const project = await duplicateProject(id, session.user.id);
      if (!project)
        return jsonResponse({ error: "Project not found" }, 404);
      return jsonResponse({ duplicated: true, id: project.id, project });
    }
    case "batch-delete": {
      const { ids } = body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return jsonResponse({ error: "Project ids required" }, 400);
      }
      await batchDeleteProjects(ids, session.user.id);
      return jsonResponse({ deleted: true, count: ids.length });
    }
    case "update-tags": {
      const { id, tags } = body;
      if (!id || !Array.isArray(tags)) {
        return jsonResponse({ error: "Project id and tags required" }, 400);
      }
      const project = await updateProjectTags(id, tags, session.user.id);
      if (!project)
        return jsonResponse({ error: "Project not found" }, 404);
      return jsonResponse({ updated: true, id, project });
    }
    default:
      return jsonResponse({ error: "Not found" }, 404);
  }
}
