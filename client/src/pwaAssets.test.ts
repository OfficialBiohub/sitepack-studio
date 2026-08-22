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

  it("uses a reachable image for the configured SitePack Studio logo", async () => {
    const logoUrl = process.env.VITE_APP_LOGO;
    expect(logoUrl).toMatch(/^https:\/\//);

    const response = await fetch(logoUrl!);
    expect(response.ok).toBe(true);
    const header = new Uint8Array(await response.arrayBuffer()).slice(0, 12);
    const isPng = Array.from(header.slice(0, 8)).every((byte, index) => byte === [137, 80, 78, 71, 13, 10, 26, 10][index]);
    const isWebp = new TextDecoder().decode(header.slice(0, 4)) === "RIFF" && new TextDecoder().decode(header.slice(8, 12)) === "WEBP";
    expect(isPng || isWebp).toBe(true);
  });
});
