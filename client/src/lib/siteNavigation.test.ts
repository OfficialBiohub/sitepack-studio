import { describe, expect, it } from "vitest";
import { siteNavigation } from "./siteNavigation";

describe("SitePack primary navigation", () => {
  it("exposes every requested public page with a unique route", () => {
    expect(siteNavigation.map((item) => item.label)).toEqual([
      "Home",
      "How It Works",
      "Archive & History",
      "Creator Contact",
    ]);
    expect(siteNavigation.map((item) => item.href)).toEqual([
      "/",
      "/how-it-works",
      "/archive-history",
      "/creator-contact",
    ]);
    expect(new Set(siteNavigation.map((item) => item.href)).size).toBe(siteNavigation.length);
  });
});
