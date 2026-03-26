import type { Env } from "../types";
import { CATEGORIES } from "../types";
import { validateSlug } from "../validation";

interface CreateBody {
  slug: string;
  punchline: string;
  category: string;
}

export async function handleCreate(request: Request, env: Env): Promise<Response> {
  let body: CreateBody;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { slug, punchline, category } = body;

  if (!slug || !punchline || !category) {
    return Response.json({ error: "slug, punchline, and category are required" }, { status: 400 });
  }

  const validCategoryIds = CATEGORIES.map(c => c.id) as readonly string[];
  if (!validCategoryIds.includes(category)) {
    return Response.json({ error: "Invalid category" }, { status: 400 });
  }

  if (punchline.length > 500) {
    return Response.json({ error: "Punchline must be 500 characters or less" }, { status: 400 });
  }

  const validation = validateSlug(slug);
  if (!validation.valid) {
    return Response.json({ error: validation.error }, { status: 400 });
  }

  // Note: This check-then-write is not atomic. Two concurrent requests for the
  // same slug can both pass the check and both write. KV does not support
  // conditional writes. Acceptable for joke links; not suitable for critical data.
  const existing = await env.JOKES.get(slug);
  if (existing !== null) {
    return Response.json({ error: "Slug is already taken" }, { status: 409 });
  }

  await env.JOKES.put(slug, JSON.stringify({
    punchline,
    category,
    createdAt: new Date().toISOString(),
  }));

  return Response.json({ url: "/" + slug }, { status: 201 });
}
