import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const publicDir = path.resolve(process.cwd(), "client/public");

describe("SitePack Studio PWA assets", () => {
  it("declares an installable standalone manifest with a same-origin icon", () => {
    const manifest = JSON.parse(readFileSync(path.join(publicDir, "manifest.webmanifest"), "utf8"));

    expect(manifest.name).toBe("SitePack Studio");
    expect(manifest.display).toBe("standalone");
    expect(manifest.icons).toContainEqual(expect.objectContaining({ src: "/sitepack-icon.svg", purpose: "any maskable" }));
  });

  it("keeps archive API requests out of the offline cache", () => {
    const worker = readFileSync(path.join(publicDir, "service-worker.js"), "utf8");

    expect(worker).toContain("url.pathname.startsWith(\"/api/\")");
    expect(worker).toContain("/offline.html");
  });
});
