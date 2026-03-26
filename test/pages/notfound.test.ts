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
    expect(html).toContain("#0c0c0e");
  });

  it("links back to home", () => {
    const html = renderNotFound();
    expect(html).toContain('href="/"');
  });
});
