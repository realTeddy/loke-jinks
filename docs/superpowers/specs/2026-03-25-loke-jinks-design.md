# Loke Jinks — Design Spec

## Overview

Loke Jinks (a letter-swap of "Joke Links") is a joke URL sharing website. Users create shareable links where the URL is the setup and the landing page is the punchline. No user accounts — just a key-value store mapping URL slugs to jokes.

## Concept

The name "Loke Jinks" is itself a misdirection — swapping the J and L in "Joke Links." This sets the tone for the whole product: everything is a setup for a punchline.

The sender shares a URL that looks plausible in context (a study resource, a health article, a completion of a phrase). The recipient clicks it and gets hit with the punchline immediately — big text, dark page, nothing else.

## Joke Categories

All categories are supported. Category is stored with the joke for potential future use but doesn't affect rendering behavior.

| Category | Description |
|----------|-------------|
| Misdirection | URL looks like a legit resource, punchline recontextualizes it |
| Yo Mama | Shared in a plausible context, absurd by contrast |
| Deez Nuts / Ligma | URL is the setup, page is the punchline |
| That's What She Said | Innocuous URL, sexual reframe |
| Anti-joke | Subverts expectation, no real punchline |
| Callback | Sender sets up context in chat, URL is the closer |
| Custom | User writes their own |

## URL Style

All joke URLs are slug-based paths. No query parameter mode. Examples:

- `/deez/nuts`
- `/health/obesity-research`
- `/study/materials/chapter-3`

Slug rules:
- Alphanumeric characters, hyphens, and forward slashes only
- No trailing slashes, no double slashes
- Max length: 100 characters
- Slugs starting with `api/` are reserved

## Data Model

Single Cloudflare KV namespace called `JOKES`.

**Key:** The slug (e.g., `deez/nuts`)
**Value:** JSON blob:

```json
{
  "punchline": "Got 'em!",
  "category": "deez-nuts",
  "createdAt": "2026-03-25T12:00:00Z"
}
```

Slug collisions: first come, first served. If a slug is taken, the user picks another.

Jokes do not expire. They live forever. TTL may be added later if storage or moderation becomes an issue.

## Routing

Single Cloudflare Worker handles all requests.

| Method | Path | Behavior |
|--------|------|----------|
| `GET /` | Serve the creation wizard |
| `GET /api/check?slug=:slug` | Check slug availability — slug passed as query param (since slugs contain slashes). Returns `{ available: true/false }` |
| `POST /api/create` | Create joke — accepts `{ slug, punchline, category }`, returns the full URL |
| `GET /api/random-slug` | Generate a random plausible-looking slug. Returns word-based paths like `report/quarterly-summary` or `docs/getting-started` — meant to look like real URLs |
| `GET /*` | Wildcard catch-all — look up slug in KV. Found → render punchline page. Not found → 404 |

## Creation Wizard

A 3-step wizard that feels quick, not bureaucratic. Single-page stepper with back/next navigation.

### Step 1: Pick Your Style

Category selection. Each category shown as a card with a brief one-liner description. Tapping a card advances to step 2 and loads relevant templates.

### Step 2: Write the Punchline

- If templates exist for the chosen category, show them as clickable cards the user can select and optionally edit
- Always show a "Write your own" textarea
- Templates are starting points, not constraints

### Step 3: Craft Your URL

- Text input for the slug
- Live preview of the full URL (e.g., `lokejinks.com/deez/nuts`)
- Real-time availability check as the user types
- "Random" button generates a plausible slug via `/api/random-slug`
- Submit creates the joke

### Result Screen

After creation:
- The shareable URL displayed prominently
- Copy Link button
- Open in New Tab button (so they can preview what the recipient sees)
- "Create another" link

## Punchline Landing Page

What the recipient sees when they open a joke link. The entire point of the product.

### Design Rules

- **Dark background, white text, vertically centered** — nothing else on the page
- **Dynamic text sizing** — short punchlines (e.g., "Got 'em!") get massive text (~4-5rem). Longer punchlines scale down (~1.5-2rem). Always readable, always centered in the viewport.
- **Zero chrome** — no header, no footer, no branding, no "create your own" link, no watermark. The emptiness is the design.
- **No meta spoilers** — page title and OG meta tags use a generic neutral title for all jokes (e.g., just the domain name). The punchline must never leak into link previews.

## Tech Stack

### Platform: Cloudflare Workers + KV

- Workers handles routing, API, and HTML rendering
- KV stores slug → joke mappings (read-heavy, write-light — ideal for KV)
- Globally distributed, zero server management
- Free tier: 100K requests/day, 1GB KV storage

### Implementation Details

- **Language:** TypeScript
- **Framework:** None — routing is ~5 paths, a simple switch/if-else is clearer than a dependency
- **HTML rendering:** Server-rendered template strings in TypeScript. No React, no frontend build step.
- **Wizard interactivity:** Vanilla JS for the 3-step stepper logic
- **CSS:** Minimal, inlined or served as a static asset
- **Dependencies:** Only `wrangler` for dev/deploy

### Project Structure

```
loke-jinks/
├── src/
│   ├── index.ts          # Worker entry — request router
│   ├── routes/
│   │   ├── create.ts     # POST /api/create
│   │   ├── check.ts      # GET /api/check/:slug
│   │   └── random.ts     # GET /api/random-slug
│   ├── pages/
│   │   ├── wizard.ts     # Serves creation wizard HTML
│   │   ├── punchline.ts  # Renders punchline landing page
│   │   └── notfound.ts   # 404 page
│   └── templates/
│       └── jokes.ts      # Pre-written joke templates by category
├── static/
│   └── wizard/           # CSS + JS for the creation wizard
├── wrangler.toml         # Cloudflare config — KV binding, routes
├── package.json
└── tsconfig.json
```

## Out of Scope (for now)

- User accounts or authentication
- Content moderation (may add later)
- Joke expiration / TTL (may add later)
- Analytics or view counts
- Share buttons (WhatsApp, Discord, etc.)
- OG image generation
