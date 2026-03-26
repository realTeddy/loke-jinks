import { describe, it, expect } from "vitest";
import { generateRandomSlug, handleRandom } from "../../src/routes/random";

describe("generateRandomSlug", () => {
  it("returns a string with a forward slash", () => {
    const slug = generateRandomSlug();
    expect(slug).toContain("/");
  });

  it("only contains valid slug characters", () => {
    for (let i = 0; i < 50; i++) {
      const slug = generateRandomSlug();
      expect(slug).toMatch(/^[a-z0-9][a-z0-9\-\/]*[a-z0-9]$/);
    }
  });

  it("produces varied results", () => {
    const slugs = new Set<string>();
    for (let i = 0; i < 20; i++) {
      slugs.add(generateRandomSlug());
    }
    expect(slugs.size).toBeGreaterThan(5);
  });
});

describe("handleRandom", () => {
  it("returns JSON with a slug field", async () => {
    const response = handleRandom();
    expect(response.headers.get("content-type")).toContain("application/json");
    const data = await response.json() as { slug: string };
    expect(data.slug).toBeDefined();
    expect(typeof data.slug).toBe("string");
    expect(data.slug).toContain("/");
  });
});
