import type { Env } from "../types";

export async function handleCheck(url: URL, env: Env): Promise<Response> {
  const slug = url.searchParams.get("slug");
  if (!slug) {
    return Response.json({ error: "slug parameter is required" }, { status: 400 });
  }
  const existing = await env.JOKES.get(slug);
  return Response.json({ available: existing === null });
}
