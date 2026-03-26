// test/index.test.ts
import { describe, it, expect } from "vitest";
import { SELF, env } from "cloudflare:test";

describe("router", () => {
  it("serves wizard at GET /", async () => {
    const response = await SELF.fetch("https://example.com/");
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/html");
    const html = await response.text();
    expect(html).toContain("Loke Jinks");
  });

  it("returns punchline page for existing joke", async () => {
    await env.JOKES.put("deez/nuts", JSON.stringify({
      punchline: "Got 'em!",
      category: "deez-nuts",
      createdAt: "2026-01-01T00:00:00Z",
    }));
    const response = await SELF.fetch("https://example.com/deez/nuts");
    expect(response.status).toBe(200);
    const html = await response.text();
    expect(html).toContain("Got &#039;em!");
  });

  it("returns 404 for non-existent slug", async () => {
    const response = await SELF.fetch("https://example.com/does/not/exist");
    expect(response.status).toBe(404);
    const html = await response.text();
    expect(html).toContain("404");
  });

  it("handles /api/check", async () => {
    const response = await SELF.fetch("https://example.com/api/check?slug=fresh");
    expect(response.status).toBe(200);
    const data = await response.json() as { available: boolean };
    expect(data.available).toBe(true);
  });

  it("handles POST /api/create", async () => {
    const response = await SELF.fetch("https://example.com/api/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: "new/joke", punchline: "Boom!", category: "custom" }),
    });
    expect(response.status).toBe(201);
  });

  it("handles GET /api/random-slug", async () => {
    const response = await SELF.fetch("https://example.com/api/random-slug");
    expect(response.status).toBe(200);
    const data = await response.json() as { slug: string };
    expect(data.slug).toContain("/");
  });

  it("returns 405 for POST to non-create API routes", async () => {
    const response = await SELF.fetch("https://example.com/api/check?slug=test", {
      method: "POST",
    });
    expect(response.status).toBe(405);
  });

  it("full lifecycle: create then view", async () => {
    const createRes = await SELF.fetch("https://example.com/api/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: "lifecycle/test", punchline: "It works!", category: "custom" }),
    });
    expect(createRes.status).toBe(201);

    const viewRes = await SELF.fetch("https://example.com/lifecycle/test");
    expect(viewRes.status).toBe(200);
    const html = await viewRes.text();
    expect(html).toContain("It works!");
  });
});
