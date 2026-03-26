import { describe, it, expect } from "vitest";
import { env } from "cloudflare:test";
import { handleCheck } from "../../src/routes/check";
import type { Env } from "../../src/types";

describe("handleCheck", () => {
  it("returns available true for non-existent slug", async () => {
    const url = new URL("https://example.com/api/check?slug=brand-new");
    const response = await handleCheck(url, env as unknown as Env);
    const data = await response.json() as { available: boolean };
    expect(response.status).toBe(200);
    expect(data.available).toBe(true);
  });

  it("returns available false for existing slug", async () => {
    await env.JOKES.put("taken/slug", JSON.stringify({ punchline: "test", category: "custom", createdAt: "2026-01-01T00:00:00Z" }));
    const url = new URL("https://example.com/api/check?slug=taken/slug");
    const response = await handleCheck(url, env as unknown as Env);
    const data = await response.json() as { available: boolean };
    expect(response.status).toBe(200);
    expect(data.available).toBe(false);
  });

  it("returns 400 when slug parameter is missing", async () => {
    const url = new URL("https://example.com/api/check");
    const response = await handleCheck(url, env as unknown as Env);
    expect(response.status).toBe(400);
  });
});
