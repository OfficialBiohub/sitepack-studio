import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("Vite React runtime configuration", () => {
  it("deduplicates React and React DOM for hook-based UI packages", () => {
    const configPath = path.resolve(import.meta.dirname, "../../../vite.config.ts");
    const source = fs.readFileSync(configPath, "utf8");

    expect(source).toContain('dedupe: ["react", "react-dom"]');
  });
});
