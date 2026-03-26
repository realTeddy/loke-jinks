# Loke Jinks

> **Joke Links** &rarr; **Loke Jinks**. The J and L are swapped. That's the joke.

**[lokejinks.tewodros.me](https://lokejinks.tewodros.me)**

A website for creating joke URLs. You craft a URL that looks legit, attach a punchline, and share the link. When someone opens it, the punchline hits them immediately &mdash; big text, dark screen, nothing else.

No accounts. No sign-ups. Just shareable joke links backed by a key-value store.

## How it works

1. **Pick a style** &mdash; Misdirection, Yo Mama, Deez Nuts, That's What She Said, Anti-joke, Callback, or write your own
2. **Write the punchline** &mdash; use a template or go custom
3. **Craft the URL** &mdash; make it look like a real resource (`/study/materials/chapter-3`)
4. **Share it** &mdash; the recipient opens the link and gets got

### Examples

| URL | Punchline |
|-----|-----------|
| `/study/materials/chapter-3` | Yo mama so old, her birth certificate says expired. |
| `/deez/nuts` | Got 'em! |
| `/blog/quarterly-review` | This meeting could have been an email. |
| `/health/obesity-research` | Yo mama so fat, she uses Google Earth as a mirror. |

## Tech stack

- **[Cloudflare Workers](https://workers.cloudflare.com/)** &mdash; serverless runtime, globally distributed
- **[Cloudflare KV](https://developers.cloudflare.com/kv/)** &mdash; key-value store (slug &rarr; joke)
- **TypeScript** &mdash; no framework, no frontend build step
- **[Vitest](https://vitest.dev/)** + `@cloudflare/vitest-pool-workers` &mdash; tests run inside the Workers runtime

## Development

### Prerequisites

- Node.js 20+
- A [Cloudflare account](https://dash.cloudflare.com/sign-up) (free tier works)

### Setup

```bash
git clone https://github.com/realTeddy/loke-jinks.git
cd loke-jinks
npm install
```

### Create your KV namespace

```bash
npx wrangler kv namespace create JOKES
npx wrangler kv namespace create JOKES --preview
```

Update `id` and `preview_id` in `wrangler.toml` with the output from those commands.

### Run locally

```bash
npm run dev
```

Open [http://localhost:8787](http://localhost:8787).

### Run tests

```bash
npm test
```

### Deploy

```bash
npm run deploy
```

## CI/CD

GitHub Actions deploys to Cloudflare Workers on every push to `main`. The workflow runs type-checking, tests, then deploys.

### Setup

1. Create a [Cloudflare API token](https://dash.cloudflare.com/profile/api-tokens) with **Edit Cloudflare Workers** permissions
2. Add it as a repository secret named `CLOUDFLARE_API_TOKEN`

That's it. Push to `main` and it deploys.

## Project structure

```
src/
  index.ts              # Router — dispatches all requests
  types.ts              # Joke, Env, category definitions
  validation.ts         # Slug validation rules
  routes/
    check.ts            # GET /api/check?slug=
    create.ts           # POST /api/create
    random.ts           # GET /api/random-slug
  pages/
    wizard.ts           # Creation wizard (HTML + CSS + JS inlined)
    punchline.ts        # Punchline landing page
    notfound.ts         # 404 page
  templates/
    jokes.ts            # Pre-written joke templates by category
test/                   # Mirrors src/ structure
```

## Built with Claude Code

This project was almost entirely created by [Claude Code](https://claude.ai/code), Anthropic's AI coding agent. The brainstorming, architecture design, implementation plan, TDD implementation, code review, and visual design were all done by Claude Code.

The human provided the concept, made decisions at each step, and gave feedback. Claude Code did the rest.

## License

[MIT](LICENSE)
