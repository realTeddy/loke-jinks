// src/index.ts
import type { Env } from "./types";
import { renderPunchline } from "./pages/punchline";
import { renderNotFound } from "./pages/notfound";
import { renderWizard } from "./pages/wizard";
import { handleCheck } from "./routes/check";
import { handleCreate } from "./routes/create";
import { handleRandom } from "./routes/random";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Serve creation wizard at root
    if (path === "/") {
      return new Response(renderWizard(), {
        headers: { "Content-Type": "text/html" },
      });
    }

    // API routes
    if (path === "/api/check") {
      if (request.method !== "GET") {
        return Response.json({ error: "Method not allowed" }, { status: 405 });
      }
      return handleCheck(url, env);
    }

    if (path === "/api/create") {
      if (request.method !== "POST") {
        return Response.json({ error: "Method not allowed" }, { status: 405 });
      }
      return handleCreate(request, env);
    }

    if (path === "/api/random-slug") {
      if (request.method !== "GET") {
        return Response.json({ error: "Method not allowed" }, { status: 405 });
      }
      return handleRandom();
    }

    // Wildcard: look up slug in KV
    const slug = path.slice(1); // Remove leading /
    const data = await env.JOKES.get(slug);
    if (data) {
      const joke = JSON.parse(data);
      return new Response(renderPunchline(joke.punchline), {
        headers: { "Content-Type": "text/html" },
      });
    }

    // 404
    return new Response(renderNotFound(), {
      status: 404,
      headers: { "Content-Type": "text/html" },
    });
  },
} satisfies ExportedHandler<Env>;
