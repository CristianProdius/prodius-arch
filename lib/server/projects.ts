import { db } from "../db";
import { projects } from "../db/schema";
import { eq, and, or, sql, inArray, desc } from "drizzle-orm";

function rowToProject(row: typeof projects.$inferSelect): DesignHistoryItem {
  return {
    id: row.id,
    name: row.name,
    sourceImage: row.sourceImage,
    renderedImage: row.renderedImage,
    timestamp: row.timestamp ? row.timestamp.getTime() : Date.now(),
    ownerId: row.ownerId,
    isPublic: row.isPublic ?? false,
    sharedBy: row.sharedBy,
    sharedAt: row.sharedAt ? row.sharedAt.toISOString() : null,
    tags: (row.tags as string[]) ?? [],
    renderHistory: (row.renderHistory as RenderHistoryEntry[]) ?? [],
  };
}

export async function listProjects(userId: string) {
  const rows = await db
    .select()
    .from(projects)
    .where(or(eq(projects.ownerId, userId), eq(projects.isPublic, true)))
    .orderBy(desc(projects.timestamp));

  return rows.map(rowToProject);
}

export async function getProject(
  id: string,
  scope: "private" | "public",
  ownerId?: string | null
) {
  let rows;
  if (scope === "private" && ownerId) {
    rows = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, id), eq(projects.ownerId, ownerId)));
  } else {
    rows = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id));
  }
  return rows[0] ? rowToProject(rows[0]) : null;
}

export async function upsertProject(
  project: DesignHistoryItem,
  visibility: "private" | "public",
  userId: string,
  userName?: string | null
) {
  const isPublic = visibility === "public";
  const now = new Date();

  const values = {
    id: project.id,
    name: project.name ?? null,
    sourceImage: project.sourceImage,
    renderedImage: project.renderedImage ?? null,
    timestamp: project.timestamp ? new Date(project.timestamp) : now,
    updatedAt: now,
    ownerId: userId,
    isPublic,
    sharedBy: isPublic ? (userName ?? null) : null,
    sharedAt: isPublic ? now : null,
    tags: project.tags ?? [],
    renderHistory: project.renderHistory ?? [],
  };

  const [row] = await db
    .insert(projects)
    .values(values)
    .onConflictDoUpdate({
      target: projects.id,
      set: {
        name: values.name,
        sourceImage: values.sourceImage,
        renderedImage: values.renderedImage,
        updatedAt: values.updatedAt,
        isPublic: values.isPublic,
        sharedBy: values.sharedBy,
        sharedAt: values.sharedAt,
        tags: values.tags,
        renderHistory: values.renderHistory,
      },
    })
    .returning();

  return rowToProject(row);
}

export async function deleteProject(id: string, userId: string) {
  const result = await db
    .delete(projects)
    .where(and(eq(projects.id, id), eq(projects.ownerId, userId)));
  return true;
}

export async function renameProject(
  id: string,
  name: string,
  userId: string
) {
  const [row] = await db
    .update(projects)
    .set({ name, updatedAt: new Date() })
    .where(and(eq(projects.id, id), eq(projects.ownerId, userId)))
    .returning();

  return row ? rowToProject(row) : null;
}

export async function duplicateProject(id: string, userId: string) {
  const [existing] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, id), eq(projects.ownerId, userId)));

  if (!existing) return null;

  const newId = Date.now().toString();
  const now = new Date();

  const [row] = await db
    .insert(projects)
    .values({
      id: newId,
      name: (existing.name || `Residence ${id}`) + " (Copy)",
      sourceImage: existing.sourceImage,
      renderedImage: existing.renderedImage,
      timestamp: now,
      updatedAt: now,
      ownerId: userId,
      isPublic: false,
      sharedBy: null,
      sharedAt: null,
      tags: existing.tags ?? [],
      renderHistory: existing.renderHistory ?? [],
    })
    .returning();

  return rowToProject(row);
}

export async function batchDeleteProjects(ids: string[], userId: string) {
  await db
    .delete(projects)
    .where(and(inArray(projects.id, ids), eq(projects.ownerId, userId)));
  return true;
}

export async function updateProjectTags(
  id: string,
  tags: string[],
  userId: string
) {
  const [row] = await db
    .update(projects)
    .set({ tags, updatedAt: new Date() })
    .where(and(eq(projects.id, id), eq(projects.ownerId, userId)))
    .returning();

  return row ? rowToProject(row) : null;
}
