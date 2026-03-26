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
