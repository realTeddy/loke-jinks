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
