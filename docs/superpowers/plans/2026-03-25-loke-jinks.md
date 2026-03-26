# Loke Jinks Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a joke URL sharing site where slugs map to punchlines, served via Cloudflare Workers + KV.

**Architecture:** Single Cloudflare Worker handles all routing — serves a creation wizard at `/`, API routes under `/api/*`, and a wildcard catch-all that looks up slugs in KV to render punchline pages. No framework, no frontend build step. Server-rendered HTML with vanilla JS for the wizard stepper.

**Tech Stack:** TypeScript, Cloudflare Workers, Cloudflare KV, Vitest with `@cloudflare/vitest-pool-workers`

---

## File Map

```
loke-jinks/
├── src/
│   ├── index.ts              # Worker entry — request router
│   ├── types.ts              # Joke interface, Env, category definitions
│   ├── validation.ts         # Slug validation
│   ├── routes/
│   │   ├── check.ts          # GET /api/check?slug=
│   │   ├── create.ts         # POST /api/create
│   │   └── random.ts         # GET /api/random-slug
│   ├── pages/
│   │   ├── punchline.ts      # Punchline landing page renderer
│   │   ├── notfound.ts       # 404 page renderer
│   │   └── wizard.ts         # Creation wizard (HTML + inline CSS/JS)
│   └── templates/
│       └── jokes.ts          # Pre-written joke templates by category
├── test/
│   ├── validation.test.ts
│   ├── pages/
│   │   ├── punchline.test.ts
│   │   └── notfound.test.ts
│   ├── routes/
│   │   ├── check.test.ts
│   │   ├── create.test.ts
│   │   └── random.test.ts
│   └── index.test.ts         # Router integration tests
├── wrangler.toml
├── vitest.config.ts
├── tsconfig.json
└── package.json
```

---

### Task 1: Project Scaffolding

**Files:**
- Create: `.gitignore`
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `wrangler.toml`
- Create: `vitest.config.ts`

- [ ] **Step 1: Create .gitignore**

```
node_modules/
dist/
.wrangler/
.superpowers/
```

- [ ] **Step 2: Create package.json**

```json
{
  "name": "loke-jinks",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "wrangler dev",
    "test": "vitest run",
    "test:watch": "vitest",
    "deploy": "wrangler deploy"
  },
  "devDependencies": {
    "@cloudflare/vitest-pool-workers": "^0.7.0",
    "@cloudflare/workers-types": "^4.20241230.0",
    "typescript": "^5.7.0",
    "vitest": "~2.1.0",
    "wrangler": "^3.99.0"
  }
}
```

- [ ] **Step 3: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noEmit": true,
    "lib": ["ESNext"],
    "types": [
      "@cloudflare/workers-types/2023-07-01",
      "@cloudflare/vitest-pool-workers"
    ]
  },
  "include": ["src/**/*.ts", "test/**/*.ts"]
}
```

- [ ] **Step 4: Create wrangler.toml**

```toml
name = "loke-jinks"
main = "src/index.ts"
compatibility_date = "2024-09-23"

[[kv_namespaces]]
binding = "JOKES"
id = "placeholder-will-be-created-on-deploy"
preview_id = "placeholder-will-be-created-on-deploy"
```

- [ ] **Step 5: Create vitest.config.ts**

```ts
import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersConfig({
  test: {
    poolOptions: {
      workers: {
        wrangler: { configPath: "./wrangler.toml" },
      },
    },
  },
});
```

- [ ] **Step 6: Install dependencies**

Run: `npm install`
Expected: `node_modules` created, no errors

- [ ] **Step 7: Verify TypeScript compiles**

Create a minimal `src/index.ts` so tsc doesn't error:

```ts
export default {
  async fetch(): Promise<Response> {
    return new Response("ok");
  },
};
```

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 8: Commit**

```bash
git add .gitignore package.json package-lock.json tsconfig.json wrangler.toml vitest.config.ts src/index.ts
git commit -m "chore: scaffold project with wrangler, vitest, and typescript"
```

---

### Task 2: Types, Categories, and Slug Validation

**Files:**
- Create: `src/types.ts`
- Create: `src/validation.ts`
- Create: `test/validation.test.ts`

- [ ] **Step 1: Create types.ts**

```ts
export interface Joke {
  punchline: string;
  category: string;
  createdAt: string;
}

export interface Env {
  JOKES: KVNamespace;
}

export const CATEGORIES = [
  { id: "misdirection", label: "Misdirection", description: "URL looks like a legit resource, punchline recontextualizes it" },
  { id: "yo-mama", label: "Yo Mama", description: "Shared in a plausible context, absurd by contrast" },
  { id: "deez-nuts", label: "Deez Nuts / Ligma", description: "URL is the setup, page is the punchline" },
  { id: "thats-what-she-said", label: "That's What She Said", description: "Innocuous URL, sexual reframe" },
  { id: "anti-joke", label: "Anti-joke", description: "Subverts expectation, no real punchline" },
  { id: "callback", label: "Callback", description: "Sender sets up context in chat, URL is the closer" },
  { id: "custom", label: "Custom", description: "Write your own joke" },
] as const;
```

- [ ] **Step 2: Write failing tests for slug validation**

```ts
// test/validation.test.ts
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
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx vitest run test/validation.test.ts`
Expected: FAIL — `validateSlug` does not exist yet

- [ ] **Step 4: Implement slug validation**

```ts
// src/validation.ts
export function validateSlug(slug: string): { valid: boolean; error?: string } {
  if (!slug) {
    return { valid: false, error: "Slug is required" };
  }
  if (slug.length > 100) {
    return { valid: false, error: "Slug must be 100 characters or less" };
  }
  if (slug === "api" || slug.startsWith("api/")) {
    return { valid: false, error: "Slugs starting with 'api' are reserved" };
  }
  if (slug.startsWith("/") || slug.endsWith("/")) {
    return { valid: false, error: "Slug must not start or end with a slash" };
  }
  if (slug.includes("//")) {
    return { valid: false, error: "Slug must not contain double slashes" };
  }
  if (!/^[a-z0-9]([a-z0-9\-\/]*[a-z0-9])?$/.test(slug)) {
    return { valid: false, error: "Slug may only contain lowercase letters, numbers, hyphens, and forward slashes" };
  }
  return { valid: true };
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run test/validation.test.ts`
Expected: All 15 tests PASS

- [ ] **Step 6: Commit**

```bash
git add src/types.ts src/validation.ts test/validation.test.ts
git commit -m "feat: add types, categories, and slug validation with tests"
```

---

### Task 3: Punchline Page

**Files:**
- Create: `src/pages/punchline.ts`
- Create: `test/pages/punchline.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// test/pages/punchline.test.ts
import { describe, it, expect } from "vitest";
import { renderPunchline, getFontSize } from "../../src/pages/punchline";

describe("renderPunchline", () => {
  it("contains the punchline text", () => {
    const html = renderPunchline("Got 'em!");
    expect(html).toContain("Got &#039;em!");
  });

  it("returns valid HTML document", () => {
    const html = renderPunchline("test");
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("</html>");
  });

  it("uses dark background styling", () => {
    const html = renderPunchline("test");
    expect(html).toContain("#0a0a0a");
  });

  it("does not leak punchline in meta tags", () => {
    const html = renderPunchline("secret punchline");
    const metaMatch = html.match(/<meta[^>]*og:description[^>]*>/);
    if (metaMatch) {
      expect(metaMatch[0]).not.toContain("secret punchline");
    }
    const titleMatch = html.match(/<title>[^<]*<\/title>/);
    expect(titleMatch![0]).not.toContain("secret punchline");
  });

  it("escapes HTML in punchline", () => {
    const html = renderPunchline('<script>alert("xss")</script>');
    expect(html).not.toContain('<script>alert("xss")</script>');
    expect(html).toContain("&lt;script&gt;");
  });
});

describe("getFontSize", () => {
  it("returns largest size for short text", () => {
    expect(getFontSize(5)).toBe("5rem");
  });

  it("returns large size for medium text", () => {
    expect(getFontSize(30)).toBe("3.5rem");
  });

  it("returns medium size for longer text", () => {
    expect(getFontSize(75)).toBe("2.5rem");
  });

  it("returns smallest size for very long text", () => {
    expect(getFontSize(150)).toBe("1.8rem");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run test/pages/punchline.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement punchline page**

```ts
// src/pages/punchline.ts
export function getFontSize(length: number): string {
  if (length <= 20) return "5rem";
  if (length <= 50) return "3.5rem";
  if (length <= 100) return "2.5rem";
  return "1.8rem";
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function renderPunchline(punchline: string): string {
  const fontSize = getFontSize(punchline.length);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Loke Jinks</title>
  <meta property="og:title" content="Loke Jinks">
  <meta property="og:description" content="Check this out">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{background:#0a0a0a;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:system-ui,-apple-system,sans-serif;padding:2rem}
    .punchline{font-size:${fontSize};font-weight:900;text-align:center;line-height:1.2;max-width:900px}
  </style>
</head>
<body>
  <div class="punchline">${escapeHtml(punchline)}</div>
</body>
</html>`;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run test/pages/punchline.test.ts`
Expected: All 7 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/punchline.ts test/pages/punchline.test.ts
git commit -m "feat: add punchline landing page with dynamic font sizing"
```

---

### Task 4: 404 Page

**Files:**
- Create: `src/pages/notfound.ts`
- Create: `test/pages/notfound.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// test/pages/notfound.test.ts
import { describe, it, expect } from "vitest";
import { renderNotFound } from "../../src/pages/notfound";

describe("renderNotFound", () => {
  it("returns valid HTML document", () => {
    const html = renderNotFound();
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("</html>");
  });

  it("contains 404 message", () => {
    const html = renderNotFound();
    expect(html).toContain("404");
  });

  it("uses dark background", () => {
    const html = renderNotFound();
    expect(html).toContain("#0a0a0a");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run test/pages/notfound.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement 404 page**

```ts
// src/pages/notfound.ts
export function renderNotFound(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Not Found</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{background:#0a0a0a;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:system-ui,-apple-system,sans-serif}
    .message{text-align:center}
    h1{font-size:4rem;font-weight:900}
    p{font-size:1.2rem;opacity:0.5;margin-top:1rem}
  </style>
</head>
<body>
  <div class="message">
    <h1>404</h1>
    <p>This joke doesn't exist yet.</p>
  </div>
</body>
</html>`;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run test/pages/notfound.test.ts`
Expected: All 3 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/notfound.ts test/pages/notfound.test.ts
git commit -m "feat: add 404 page"
```

---

### Task 5: Random Slug Generator

**Files:**
- Create: `src/routes/random.ts`
- Create: `test/routes/random.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// test/routes/random.test.ts
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run test/routes/random.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement random slug generator**

```ts
// src/routes/random.ts
const prefixes = [
  "docs", "resources", "blog", "research", "study",
  "report", "guide", "help", "wiki", "news",
  "article", "review", "analysis", "reference", "tutorial",
];

const suffixes = [
  "getting-started", "overview", "summary", "introduction", "basics",
  "advanced-topics", "quarterly-review", "annual-report", "latest-update",
  "best-practices", "quick-start", "deep-dive", "key-findings", "methodology",
  "results", "conclusion", "appendix", "changelog", "roadmap", "faq",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateRandomSlug(): string {
  return pick(prefixes) + "/" + pick(suffixes);
}

export function handleRandom(): Response {
  return Response.json({ slug: generateRandomSlug() });
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run test/routes/random.test.ts`
Expected: All 4 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/routes/random.ts test/routes/random.test.ts
git commit -m "feat: add random slug generator"
```

---

### Task 6: Joke Templates

**Files:**
- Create: `src/templates/jokes.ts`

- [ ] **Step 1: Create joke templates**

```ts
// src/templates/jokes.ts
export interface JokeTemplate {
  label: string;
  text: string;
}

export const templates: Record<string, JokeTemplate[]> = {
  "misdirection": [
    { label: "Important meeting", text: "This meeting could have been an email." },
    { label: "Research paper", text: "We found nothing. Absolutely nothing." },
    { label: "Breaking news", text: "You just got played." },
  ],
  "yo-mama": [
    { label: "Classic weight", text: "Yo mama so fat, she uses Google Earth as a mirror." },
    { label: "Classic old", text: "Yo mama so old, her birth certificate says expired." },
    { label: "Classic slow", text: "Yo mama so slow, she took 9 months to make a joke." },
  ],
  "deez-nuts": [
    { label: "Classic", text: "Got 'em!" },
    { label: "Formal", text: "Deez nuts. You have been got." },
    { label: "Ligma", text: "Ligma balls." },
  ],
  "thats-what-she-said": [
    { label: "Classic", text: "That's what she said." },
    { label: "Extended", text: "That's what she said. And she was right." },
  ],
  "anti-joke": [
    { label: "Nothing", text: "There is no joke. You clicked a link for nothing." },
    { label: "Honest", text: "This is just a website. Nothing funny here." },
    { label: "Existential", text: "The real joke is the time you spent clicking this link." },
  ],
  "callback": [
    { label: "Remember?", text: "I told you so." },
    { label: "Payoff", text: "And THAT is why you don't trust links from me." },
  ],
};
```

- [ ] **Step 2: Commit**

```bash
git add src/templates/jokes.ts
git commit -m "feat: add joke templates by category"
```

---

### Task 7: Slug Check API

**Files:**
- Create: `src/routes/check.ts`
- Create: `test/routes/check.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// test/routes/check.test.ts
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run test/routes/check.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement slug check**

```ts
// src/routes/check.ts
import type { Env } from "../types";

export async function handleCheck(url: URL, env: Env): Promise<Response> {
  const slug = url.searchParams.get("slug");
  if (!slug) {
    return Response.json({ error: "slug parameter is required" }, { status: 400 });
  }
  const existing = await env.JOKES.get(slug);
  return Response.json({ available: existing === null });
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run test/routes/check.test.ts`
Expected: All 3 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/routes/check.ts test/routes/check.test.ts
git commit -m "feat: add slug availability check API"
```

---

### Task 8: Create Joke API

**Files:**
- Create: `src/routes/create.ts`
- Create: `test/routes/create.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// test/routes/create.test.ts
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
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run test/routes/create.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement create joke**

```ts
// src/routes/create.ts
import type { Env } from "../types";
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

  const validation = validateSlug(slug);
  if (!validation.valid) {
    return Response.json({ error: validation.error }, { status: 400 });
  }

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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run test/routes/create.test.ts`
Expected: All 6 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/routes/create.ts test/routes/create.test.ts
git commit -m "feat: add create joke API with validation and collision check"
```

---

### Task 9: Router and Integration

**Files:**
- Modify: `src/index.ts` (replace placeholder)
- Create: `test/index.test.ts`

- [ ] **Step 1: Write failing integration tests**

```ts
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run test/index.test.ts`
Expected: FAIL — router doesn't handle routes yet

- [ ] **Step 3: Implement the router**

Replace `src/index.ts` with:

```ts
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
```

Note: This requires `src/pages/wizard.ts` to exist. Create a minimal placeholder so the router compiles:

```ts
// src/pages/wizard.ts (placeholder — full implementation in Task 10)
export function renderWizard(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Loke Jinks — Create a Joke Link</title>
</head>
<body>
  <h1>Loke Jinks</h1>
  <p>Wizard placeholder</p>
</body>
</html>`;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run test/index.test.ts`
Expected: All 8 tests PASS

- [ ] **Step 5: Run full test suite**

Run: `npx vitest run`
Expected: All tests across all files PASS

- [ ] **Step 6: Commit**

```bash
git add src/index.ts src/pages/wizard.ts test/index.test.ts
git commit -m "feat: add router with full request lifecycle"
```

---

### Task 10: Creation Wizard Page

**Files:**
- Modify: `src/pages/wizard.ts` (replace placeholder)

- [ ] **Step 1: Implement the full wizard page**

Replace `src/pages/wizard.ts` with the complete implementation. This is a single function that returns a full HTML page with inlined CSS and vanilla JS for the 3-step stepper.

```ts
// src/pages/wizard.ts
import { CATEGORIES } from "../types";
import { templates } from "../templates/jokes";

export function renderWizard(): string {
  const categoriesJson = JSON.stringify(CATEGORIES);
  const templatesJson = JSON.stringify(templates);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Loke Jinks — Create a Joke Link</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{background:#0a0a0a;color:#e0e0e0;font-family:system-ui,-apple-system,sans-serif;min-height:100vh;display:flex;flex-direction:column;align-items:center;padding:2rem}
    .container{max-width:640px;width:100%}
    h1{font-size:2rem;font-weight:900;text-align:center;margin-bottom:0.5rem;color:#fff}
    .tagline{text-align:center;opacity:0.5;margin-bottom:2rem}
    .progress{display:flex;gap:0.5rem;margin-bottom:2rem}
    .progress-step{flex:1;height:4px;background:#222;border-radius:2px;transition:background 0.3s}
    .progress-step.active{background:#fff}
    .step{display:none}
    .step.active{display:block}
    .step-title{font-size:1.2rem;font-weight:700;margin-bottom:1rem;color:#fff}
    .categories{display:grid;grid-template-columns:1fr 1fr;gap:0.75rem}
    .category-card{background:#151515;border:1px solid #222;border-radius:8px;padding:1rem;cursor:pointer;transition:border-color 0.2s}
    .category-card:hover{border-color:#444}
    .category-card h3{font-size:0.95rem;margin-bottom:0.25rem;color:#fff}
    .category-card p{font-size:0.8rem;opacity:0.5}
    .templates{display:flex;flex-direction:column;gap:0.5rem;margin-bottom:1rem}
    .template-card{background:#151515;border:1px solid #222;border-radius:8px;padding:0.75rem 1rem;cursor:pointer;font-size:0.9rem;transition:border-color 0.2s}
    .template-card:hover,.template-card.selected{border-color:#fff}
    textarea{width:100%;background:#151515;border:1px solid #222;border-radius:8px;padding:0.75rem 1rem;color:#e0e0e0;font-family:inherit;font-size:0.95rem;resize:vertical;min-height:80px}
    textarea:focus{outline:none;border-color:#444}
    .slug-row{display:flex;gap:0.5rem;margin-bottom:0.5rem}
    input[type="text"]{flex:1;background:#151515;border:1px solid #222;border-radius:8px;padding:0.75rem 1rem;color:#e0e0e0;font-family:inherit;font-size:0.95rem}
    input[type="text"]:focus{outline:none;border-color:#444}
    .preview{font-family:monospace;font-size:0.85rem;opacity:0.5;margin-bottom:0.5rem;min-height:1.2em}
    .availability{font-size:0.85rem;margin-bottom:1rem;min-height:1.2em}
    .availability.available{color:#4ade80}
    .availability.taken{color:#f87171}
    button{background:#222;color:#e0e0e0;border:1px solid #333;border-radius:8px;padding:0.6rem 1.2rem;cursor:pointer;font-family:inherit;font-size:0.9rem;transition:background 0.2s}
    button:hover{background:#333}
    button.primary{background:#fff;color:#0a0a0a;border-color:#fff;font-weight:700}
    button.primary:hover{background:#e0e0e0}
    button.primary:disabled{opacity:0.3;cursor:not-allowed}
    .btn-row{display:flex;justify-content:space-between;margin-top:1.5rem}
    .result{text-align:center}
    .result-url{font-family:monospace;font-size:1.4rem;font-weight:700;margin:1.5rem 0;word-break:break-all;color:#fff}
    .result-actions{display:flex;gap:0.75rem;justify-content:center;margin-bottom:2rem}
    .create-another{opacity:0.5;cursor:pointer;font-size:0.9rem}
    .create-another:hover{opacity:1}
    @media(max-width:480px){.categories{grid-template-columns:1fr}}
  </style>
</head>
<body>
  <div class="container">
    <h1>Loke Jinks</h1>
    <p class="tagline">Create a joke link</p>

    <div class="progress">
      <div class="progress-step active" data-step="1"></div>
      <div class="progress-step" data-step="2"></div>
      <div class="progress-step" data-step="3"></div>
    </div>

    <div class="step active" data-step="1">
      <p class="step-title">Pick your style</p>
      <div class="categories" id="categories"></div>
    </div>

    <div class="step" data-step="2">
      <p class="step-title">Write the punchline</p>
      <div class="templates" id="templates"></div>
      <textarea id="punchline" placeholder="Write your own punchline..."></textarea>
      <div class="btn-row">
        <button id="backTo1">Back</button>
        <button class="primary" id="nextTo3" disabled>Next</button>
      </div>
    </div>

    <div class="step" data-step="3">
      <p class="step-title">Craft your URL</p>
      <div class="slug-row">
        <input type="text" id="slug" placeholder="deez/nuts">
        <button id="randomBtn">Random</button>
      </div>
      <p class="preview" id="preview"></p>
      <p class="availability" id="availability"></p>
      <div class="btn-row">
        <button id="backTo2">Back</button>
        <button class="primary" id="createBtn" disabled>Create Link</button>
      </div>
    </div>

    <div class="step" data-step="result">
      <div class="result">
        <p class="step-title">Your link is ready</p>
        <p class="result-url" id="resultUrl"></p>
        <div class="result-actions">
          <button id="copyBtn">Copy Link</button>
          <button id="openBtn">Open in New Tab</button>
        </div>
        <p class="create-another" id="resetBtn">Create another</p>
      </div>
    </div>
  </div>

  <script>
    var CATS = ${categoriesJson};
    var TMPLS = ${templatesJson};
    var currentStep = 1;
    var selectedCategory = null;
    var createdUrl = null;
    var checkTimeout = null;
    var slugAvailable = false;

    var categoriesEl = document.getElementById("categories");
    var templatesEl = document.getElementById("templates");
    var punchlineEl = document.getElementById("punchline");
    var slugEl = document.getElementById("slug");
    var previewEl = document.getElementById("preview");
    var availabilityEl = document.getElementById("availability");
    var nextTo3Btn = document.getElementById("nextTo3");
    var createBtnEl = document.getElementById("createBtn");
    var resultUrlEl = document.getElementById("resultUrl");

    CATS.forEach(function(cat) {
      var card = document.createElement("div");
      card.className = "category-card";
      card.innerHTML = "<h3>" + cat.label + "</h3><p>" + cat.description + "</p>";
      card.onclick = function() {
        selectedCategory = cat.id;
        renderTemplates();
        goToStep(2);
      };
      categoriesEl.appendChild(card);
    });

    function renderTemplates() {
      templatesEl.innerHTML = "";
      var catTemplates = TMPLS[selectedCategory] || [];
      catTemplates.forEach(function(t) {
        var card = document.createElement("div");
        card.className = "template-card";
        card.textContent = t.text;
        card.onclick = function() {
          punchlineEl.value = t.text;
          document.querySelectorAll(".template-card").forEach(function(c) { c.classList.remove("selected"); });
          card.classList.add("selected");
          updateNextBtn();
        };
        templatesEl.appendChild(card);
      });
    }

    function goToStep(step) {
      document.querySelectorAll(".step").forEach(function(s) { s.classList.remove("active"); });
      var target = document.querySelector(".step[data-step='" + step + "']");
      if (target) target.classList.add("active");
      document.querySelectorAll(".progress-step").forEach(function(s) {
        var stepNum = parseInt(s.getAttribute("data-step"));
        s.classList.toggle("active", stepNum <= (typeof step === "number" ? step : 4));
      });
      currentStep = step;
    }

    punchlineEl.addEventListener("input", updateNextBtn);
    function updateNextBtn() {
      nextTo3Btn.disabled = !punchlineEl.value.trim();
    }

    document.getElementById("backTo1").onclick = function() { goToStep(1); };
    nextTo3Btn.onclick = function() { goToStep(3); };
    document.getElementById("backTo2").onclick = function() { goToStep(2); };

    slugEl.addEventListener("input", function() {
      var slug = slugEl.value.trim();
      previewEl.textContent = slug ? location.origin + "/" + slug : "";
      slugAvailable = false;
      updateCreateBtn();
      clearTimeout(checkTimeout);
      if (!slug) {
        availabilityEl.textContent = "";
        availabilityEl.className = "availability";
        return;
      }
      checkTimeout = setTimeout(checkSlug, 300);
    });

    function checkSlug() {
      var slug = slugEl.value.trim();
      if (!slug) return;
      fetch("/api/check?slug=" + encodeURIComponent(slug))
        .then(function(res) { return res.json(); })
        .then(function(data) {
          if (data.available) {
            availabilityEl.textContent = "Available!";
            availabilityEl.className = "availability available";
            slugAvailable = true;
          } else {
            availabilityEl.textContent = "Already taken";
            availabilityEl.className = "availability taken";
            slugAvailable = false;
          }
          updateCreateBtn();
        })
        .catch(function() {});
    }

    function updateCreateBtn() {
      createBtnEl.disabled = !slugAvailable;
    }

    document.getElementById("randomBtn").onclick = function() {
      fetch("/api/random-slug")
        .then(function(res) { return res.json(); })
        .then(function(data) {
          slugEl.value = data.slug;
          slugEl.dispatchEvent(new Event("input"));
        })
        .catch(function() {});
    };

    createBtnEl.onclick = function() {
      var slug = slugEl.value.trim();
      var punchline = punchlineEl.value.trim();
      createBtnEl.disabled = true;
      fetch("/api/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: slug, punchline: punchline, category: selectedCategory })
      })
        .then(function(res) { return res.json().then(function(data) { return { ok: res.ok, data: data }; }); })
        .then(function(result) {
          if (result.ok) {
            createdUrl = location.origin + result.data.url;
            resultUrlEl.textContent = createdUrl;
            goToStep("result");
          } else {
            alert(result.data.error || "Something went wrong");
            updateCreateBtn();
          }
        })
        .catch(function() {
          alert("Something went wrong");
          updateCreateBtn();
        });
    };

    document.getElementById("copyBtn").onclick = function() {
      navigator.clipboard.writeText(createdUrl);
    };

    document.getElementById("openBtn").onclick = function() {
      window.open(createdUrl, "_blank");
    };

    document.getElementById("resetBtn").onclick = function() {
      selectedCategory = null;
      createdUrl = null;
      slugAvailable = false;
      punchlineEl.value = "";
      slugEl.value = "";
      previewEl.textContent = "";
      availabilityEl.textContent = "";
      availabilityEl.className = "availability";
      nextTo3Btn.disabled = true;
      createBtnEl.disabled = true;
      goToStep(1);
    };
  </script>
</body>
</html>`;
}
```

- [ ] **Step 2: Run full test suite**

Run: `npx vitest run`
Expected: All tests PASS (the router integration test for `GET /` already checks that the wizard returns HTML containing "Loke Jinks")

- [ ] **Step 3: Manual smoke test**

Run: `npx wrangler dev`

Verify in browser at `http://localhost:8787`:
1. Root page shows the 3-step wizard
2. Click a category → advances to step 2
3. Pick a template or type a punchline → Next button enables
4. Type a slug → shows preview, checks availability
5. Hit Random → fills a slug
6. Create → shows result with copy and open buttons
7. Open in new tab → see the punchline page
8. Create another → resets

- [ ] **Step 4: Commit**

```bash
git add src/pages/wizard.ts
git commit -m "feat: add creation wizard with 3-step flow"
```

---

## Spec Coverage Check

| Spec Requirement | Task |
|-----------------|------|
| Joke categories | Task 2 (types.ts), Task 6 (templates) |
| Slug-only URL style | Task 2 (validation), Task 8 (create) |
| KV data model (slug → joke JSON) | Task 8 (create), Task 9 (router lookup) |
| First come, first served collisions | Task 8 (create — 409 check) |
| No expiration | Default KV behavior, no TTL set |
| Routing table (all 5 routes) | Task 9 (router) |
| Creation wizard (3 steps) | Task 10 (wizard.ts) |
| Punchline page (dark, centered, dynamic sizing) | Task 3 |
| No meta spoilers | Task 3 (generic OG tags) |
| Zero chrome on punchline page | Task 3 |
| Copy link + open in new tab | Task 10 (wizard result screen) |
| Random slug generation | Task 5 |
| Slug availability check | Task 7 |
| 404 page | Task 4 |
| Cloudflare Workers + KV | Task 1 (wrangler.toml), all tasks |
| TypeScript, no framework | All tasks |
