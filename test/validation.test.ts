import { describe, it, expect } from "vitest";
import { validateSlug } from "../src/validation";

describe("validateSlug", () => {
  it("accepts a simple slug", () => {
    expect(validateSlug("hello")).toEqual({ valid: true });
  });

  it("accepts a slug with slashes", () => {
    expect(validateSlug("deez/nuts")).toEqual({ valid: true });
  });

  it("accepts a slug with hyphens", () => {
    expect(validateSlug("health/obesity-research")).toEqual({ valid: true });
  });

  it("accepts a multi-segment slug", () => {
    expect(validateSlug("study/materials/chapter-3")).toEqual({ valid: true });
  });

  it("rejects empty slug", () => {
    const result = validateSlug("");
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("rejects slug over 100 characters", () => {
    const result = validateSlug("a".repeat(101));
    expect(result.valid).toBe(false);
  });

  it("rejects slug starting with api/", () => {
    const result = validateSlug("api/something");
    expect(result.valid).toBe(false);
  });

  it("rejects slug that is exactly 'api'", () => {
    const result = validateSlug("api");
    expect(result.valid).toBe(false);
  });

  it("rejects slug with trailing slash", () => {
    const result = validateSlug("hello/");
    expect(result.valid).toBe(false);
  });

  it("rejects slug with leading slash", () => {
    const result = validateSlug("/hello");
    expect(result.valid).toBe(false);
  });

  it("rejects slug with double slashes", () => {
    const result = validateSlug("hello//world");
    expect(result.valid).toBe(false);
  });

  it("rejects slug with uppercase letters", () => {
    const result = validateSlug("Hello");
    expect(result.valid).toBe(false);
  });

  it("rejects slug with spaces", () => {
    const result = validateSlug("hello world");
    expect(result.valid).toBe(false);
  });

  it("rejects slug with special characters", () => {
    const result = validateSlug("hello@world");
    expect(result.valid).toBe(false);
  });

  it("accepts single character slug", () => {
    expect(validateSlug("a")).toEqual({ valid: true });
  });

  it("accepts two character slug", () => {
    expect(validateSlug("ab")).toEqual({ valid: true });
  });
});
