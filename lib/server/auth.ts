import { auth } from "../auth";

export async function requireAuth(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return session;
}

export async function optionalAuth(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  return session ?? null;
}
