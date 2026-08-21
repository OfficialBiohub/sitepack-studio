import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const source = (relativePath: string) => readFileSync(path.resolve(process.cwd(), relativePath), "utf8");

describe("SitePack Studio information pages", () => {
  it("registers a route for each menu destination", () => {
    const app = source("client/src/App.tsx");

    expect(app).toContain("<Router>");
    expect(app).toContain('<Route path="/" component={Home} />');
    expect(app).toContain('<Route path="/how-it-works" component={HowItWorks} />');
    expect(app).toContain('<Route path="/archive-history" component={ArchiveHistory} />');
    expect(app).toContain('<Route path="/creator-contact" component={CreatorContact} />');
  });

  it("exposes the requested labels in the shared primary navigation", () => {
    const chrome = source("client/src/components/SiteChrome.tsx");

    expect(chrome).toContain('{ href: "/", label: "Home" }');
    expect(chrome).toContain('{ href: "/how-it-works", label: "How it works" }');
    expect(chrome).toContain('{ href: "/archive-history", label: "Archive & history" }');
    expect(chrome).toContain('{ href: "/creator-contact", label: "Creator contact" }');
  });
});
