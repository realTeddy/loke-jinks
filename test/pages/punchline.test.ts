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
    expect(html).toContain("background:#000");
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

  it("loads Syne font", () => {
    const html = renderPunchline("test");
    expect(html).toContain("Syne");
  });
});

describe("getFontSize", () => {
  it("returns largest size for short text", () => {
    expect(getFontSize(5)).toBe("clamp(3rem, 8vw, 6rem)");
  });

  it("returns large size for medium text", () => {
    expect(getFontSize(30)).toBe("clamp(2rem, 6vw, 4.5rem)");
  });

  it("returns medium size for longer text", () => {
    expect(getFontSize(75)).toBe("clamp(1.5rem, 4vw, 3rem)");
  });

  it("returns smallest size for very long text", () => {
    expect(getFontSize(150)).toBe("clamp(1.2rem, 3vw, 2rem)");
  });
});
