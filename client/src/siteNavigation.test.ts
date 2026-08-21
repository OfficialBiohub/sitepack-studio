import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const source = (relativePath: string) => readFileSync(path.resolve(process.cwd(), relativePath), "utf8");

describe("SitePack Studio information pages", () => {
  it("selects a page for each menu destination", () => {
    const app = source("client/src/App.tsx");

    expect(app).toContain('pathname === "/" ? Home');
    expect(app).toContain('pathname === "/how-it-works" ? HowItWorks');
    expect(app).toContain('pathname === "/archive-history" ? ArchiveHistory');
    expect(app).toContain('pathname === "/creator-contact" ? CreatorContact');
  });

  it("exposes the requested labels in the shared primary navigation", () => {
    const navigation = source("client/src/lib/siteNavigation.ts");

    expect(navigation).toContain('{ href: "/", label: "Home"');
    expect(navigation).toContain('{ href: "/how-it-works", label: "How It Works"');
    expect(navigation).toContain('{ href: "/archive-history", label: "Archive & History"');
    expect(navigation).toContain('{ href: "/creator-contact", label: "Creator Contact"');
  });
});
