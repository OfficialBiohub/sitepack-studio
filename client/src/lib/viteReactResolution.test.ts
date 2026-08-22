import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Vite React and tRPC runtime configuration", () => {
  it("deduplicates React and routes HMR through the managed secure preview", () => {
    const configPath = resolve(import.meta.dirname, "../../../vite.config.ts");
    const source = readFileSync(configPath, "utf8");

    expect(source).toContain('dedupe: ["react", "react-dom"]');
    expect(source).toContain('exclude: ["@trpc/react-query", "@tanstack/react-query"]');
    expect(source).toContain('protocol: "wss"');
    expect(source).toContain("clientPort: 443");
  });
});
