import { requireAuth } from "../../lib/server/auth";
import { db } from "../../lib/db";
import { userSettings } from "../../lib/db/schema";
import { eq } from "drizzle-orm";
import { DEFAULT_SETTINGS } from "../../lib/settings";

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function loader({ request }: { request: Request }) {
  const session = await requireAuth(request);

  const rows = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, session.user.id));

  if (rows[0]) {
    return jsonResponse({
      theme: rows[0].theme || DEFAULT_SETTINGS.theme,
      defaultStyle: rows[0].defaultStyle || DEFAULT_SETTINGS.defaultStyle,
      defaultQuality:
        rows[0].defaultQuality || DEFAULT_SETTINGS.defaultQuality,
    });
  }

  return jsonResponse(DEFAULT_SETTINGS);
}

export async function action({ request }: { request: Request }) {
  const session = await requireAuth(request);
  const body = (await request.json()) as Partial<UserSettings>;

  await db
    .insert(userSettings)
    .values({
      userId: session.user.id,
      theme: body.theme || DEFAULT_SETTINGS.theme,
      defaultStyle: body.defaultStyle || DEFAULT_SETTINGS.defaultStyle,
      defaultQuality: body.defaultQuality || DEFAULT_SETTINGS.defaultQuality,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: userSettings.userId,
      set: {
        theme: body.theme || DEFAULT_SETTINGS.theme,
        defaultStyle: body.defaultStyle || DEFAULT_SETTINGS.defaultStyle,
        defaultQuality: body.defaultQuality || DEFAULT_SETTINGS.defaultQuality,
        updatedAt: new Date(),
      },
    });

  return jsonResponse({ saved: true });
}
