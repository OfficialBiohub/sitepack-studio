import { describe, expect, it } from "vitest";
import { createEphemeralArchiveDownload, getEphemeralArchive } from "./archiveDownloads";

describe("ephemeral archive delivery", () => {
  it("creates a private temporary download URL with a safe filename", () => {
    const created = createEphemeralArchiveDownload(Buffer.from("zip bytes"), "site pack!.zip");
    const id = created.downloadUrl.split("/").at(-1)!;
    const stored = getEphemeralArchive(id);

    expect(created.downloadUrl).toMatch(/^\/api\/archives\/[a-f0-9]{32}$/);
    expect(created.expiresInMinutes).toBe(15);
    expect(stored?.fileName).toBe("site-pack-.zip");
    expect(stored?.buffer.toString()).toBe("zip bytes");
  });
});
