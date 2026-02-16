async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || `Request failed (${res.status})`);
  }
  return res.json();
}

export async function getProjects(): Promise<DesignHistoryItem[]> {
  try {
    const data = await fetchJson<{ projects?: DesignHistoryItem[] }>(
      "/api/projects/list"
    );
    return Array.isArray(data?.projects) ? data.projects : [];
  } catch {
    return [];
  }
}

export async function getProjectById({
  id,
  scope = "public",
  ownerId,
}: {
  id: string;
  scope?: "private" | "public";
  ownerId?: string | null;
}): Promise<DesignHistoryItem | null> {
  const params = new URLSearchParams({ id, scope });
  if (ownerId) params.set("ownerId", ownerId);

  try {
    const data = await fetchJson<{ project?: DesignHistoryItem | null }>(
      `/api/projects/get?${params}`
    );
    return data?.project ?? null;
  } catch {
    return null;
  }
}

export async function saveProject(
  item: DesignHistoryItem,
  visibility: "private" | "public" = "private"
): Promise<DesignHistoryItem | null> {
  try {
    const data = await fetchJson<{ project?: DesignHistoryItem | null }>(
      "/api/projects/save",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project: item, visibility }),
      }
    );
    return data?.project ?? null;
  } catch {
    return null;
  }
}

export async function shareProject(
  item: DesignHistoryItem
): Promise<DesignHistoryItem | null> {
  return saveProject(item, "public");
}

export async function unshareProject(
  item: DesignHistoryItem
): Promise<DesignHistoryItem | null> {
  return saveProject(item, "private");
}

export async function deleteProject(id: string): Promise<boolean> {
  try {
    await fetchJson("/api/projects/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    return true;
  } catch {
    return false;
  }
}

export async function renameProject(
  id: string,
  name: string
): Promise<DesignHistoryItem | null> {
  try {
    const data = await fetchJson<{ project?: DesignHistoryItem | null }>(
      "/api/projects/rename",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name }),
      }
    );
    return data?.project ?? null;
  } catch {
    return null;
  }
}

export async function duplicateProject(
  id: string
): Promise<DesignHistoryItem | null> {
  try {
    const data = await fetchJson<{ project?: DesignHistoryItem | null }>(
      "/api/projects/duplicate",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      }
    );
    return data?.project ?? null;
  } catch {
    return null;
  }
}

export async function batchDeleteProjects(ids: string[]): Promise<boolean> {
  try {
    await fetchJson("/api/projects/batch-delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    return true;
  } catch {
    return false;
  }
}

export async function updateProjectTags(
  id: string,
  tags: string[]
): Promise<DesignHistoryItem | null> {
  try {
    const data = await fetchJson<{ project?: DesignHistoryItem | null }>(
      "/api/projects/update-tags",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, tags }),
      }
    );
    return data?.project ?? null;
  } catch {
    return null;
  }
}

export async function uploadImage(
  file: File | Blob,
  projectId: string,
  label: "source" | "rendered"
): Promise<string | null> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("projectId", projectId);
  formData.append("label", label);

  try {
    const data = await fetchJson<{ url: string }>("/api/upload", {
      method: "POST",
      body: formData,
    });
    return data.url;
  } catch {
    return null;
  }
}
