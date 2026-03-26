import { describe, it, expect } from "vitest";
import { env } from "cloudflare:test";
import { handleCreate } from "../../src/routes/create";
import type { Env } from "../../src/types";

function makeRequest(body: unknown): Request {
  return new Request("https://example.com/api/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("handleCreate", () => {
  it("creates a joke and returns 201 with url", async () => {
    const request = makeRequest({ slug: "test/joke", punchline: "Ha!", category: "custom" });
    const response = await handleCreate(request, env as unknown as Env);
    expect(response.status).toBe(201);
    const data = await response.json() as { url: string };
    expect(data.url).toBe("/test/joke");

    const stored = await env.JOKES.get("test/joke");
    expect(stored).not.toBeNull();
    const joke = JSON.parse(stored!);
    expect(joke.punchline).toBe("Ha!");
    expect(joke.category).toBe("custom");
    expect(joke.createdAt).toBeDefined();
  });

  it("returns 409 when slug is already taken", async () => {
    await env.JOKES.put("taken/one", JSON.stringify({ punchline: "x", category: "custom", createdAt: "2026-01-01T00:00:00Z" }));
    const request = makeRequest({ slug: "taken/one", punchline: "new", category: "custom" });
    const response = await handleCreate(request, env as unknown as Env);
    expect(response.status).toBe(409);
    const data = await response.json() as { error: string };
    expect(data.error).toContain("taken");
  });

  it("returns 400 when slug is invalid", async () => {
    const request = makeRequest({ slug: "INVALID SLUG!", punchline: "test", category: "custom" });
    const response = await handleCreate(request, env as unknown as Env);
    expect(response.status).toBe(400);
  });

  it("returns 400 when fields are missing", async () => {
    const request = makeRequest({ slug: "ok" });
    const response = await handleCreate(request, env as unknown as Env);
    expect(response.status).toBe(400);
  });

  it("returns 400 for invalid JSON", async () => {
    const request = new Request("https://example.com/api/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not json",
    });
    const response = await handleCreate(request, env as unknown as Env);
    expect(response.status).toBe(400);
  });

  it("returns 400 when slug starts with api/", async () => {
    const request = makeRequest({ slug: "api/hack", punchline: "test", category: "custom" });
    const response = await handleCreate(request, env as unknown as Env);
    expect(response.status).toBe(400);
  });

  it("returns 400 for invalid category", async () => {
    const request = makeRequest({ slug: "cat/test", punchline: "test", category: "fake-category" });
    const response = await handleCreate(request, env as unknown as Env);
    expect(response.status).toBe(400);
  });

  it("returns 400 when punchline is too long", async () => {
    const request = makeRequest({ slug: "long/test", punchline: "a".repeat(501), category: "custom" });
    const response = await handleCreate(request, env as unknown as Env);
    expect(response.status).toBe(400);
  });
});
