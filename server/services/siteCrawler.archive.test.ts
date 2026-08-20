import JSZip from "jszip";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SiteArchiveBuilder } from "./siteCrawler";

const source = new URL("https://example.com/");

describe("SiteArchiveBuilder public source packages", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("includes static JavaScript, social assets, and the backend-source availability note", async () => {
    vi.stubGlobal("fetch", vi.fn(async (input: URL | string) => {
      const requestedUrl = String(input);
      if (requestedUrl.endsWith("/robots.txt")) {
        return new Response("User-agent: *\nAllow: /", { headers: { "content-type": "text/plain" } });
      }
      if (requestedUrl === "https://example.com/") {
        return new Response(`<!doctype html><html><head><meta property="og:image" content="/share.png"></head><body><script type="module">import "./app.js";</script></body></html>`, { headers: { "content-type": "text/html" } });
      }
      if (requestedUrl === "https://example.com/app.js") {
        return new Response("export const sitepack = true;", { headers: { "content-type": "text/javascript" } });
      }
      if (requestedUrl === "https://example.com/share.png") {
        return new Response(new Uint8Array([137, 80, 78, 71]), { headers: { "content-type": "image/png" } });
      }
      return new Response("Not found", { status: 404 });
    }));

    const archive = await new SiteArchiveBuilder(source, {
      includeSameOriginPages: false,
      includeSourceMaps: false,
      preserveStructure: true,
      renameAssets: true,
    }).build();
    const zip = await JSZip.loadAsync(archive.buffer);
    const names = Object.keys(zip.files);
    const manifest = JSON.parse(await zip.file("sitepack-manifest.json")!.async("string"));

    expect(names).toContain("BACKEND-SOURCE-NOT-AVAILABLE.md");
    expect(names.some((name) => name.endsWith("-app.js"))).toBe(true);
    expect(names.some((name) => name.endsWith("-share.png"))).toBe(true);
    expect(manifest.limitations.join(" ")).toContain("Backend source");
  });
});

