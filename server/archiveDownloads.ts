import { randomUUID } from "node:crypto";
import type { Express } from "express";

const ARCHIVE_TTL_MS = 15 * 60 * 1000;
const MAX_ACTIVE_ARCHIVES = 32;

type EphemeralArchive = {
  buffer: Buffer;
  expiresAt: number;
  fileName: string;
};

const archives = new Map<string, EphemeralArchive>();

function cleanExpiredArchives(now = Date.now()) {
  for (const [id, archive] of Array.from(archives.entries())) {
    if (archive.expiresAt <= now) archives.delete(id);
  }
  while (archives.size >= MAX_ACTIVE_ARCHIVES) {
    const oldest = archives.keys().next().value;
    if (!oldest) break;
    archives.delete(oldest);
  }
}

function safeArchiveFilename(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-") || "sitepack-archive.zip";
}

export function createEphemeralArchiveDownload(buffer: Buffer, fileName: string) {
  cleanExpiredArchives();
  const id = randomUUID().replace(/-/g, "");
  archives.set(id, {
    buffer,
    fileName: safeArchiveFilename(fileName),
    expiresAt: Date.now() + ARCHIVE_TTL_MS,
  });
  return {
    downloadUrl: `/api/archives/${id}`,
    expiresInMinutes: ARCHIVE_TTL_MS / 60_000,
  };
}

export function getEphemeralArchive(id: string, now = Date.now()) {
  const archive = archives.get(id);
  if (!archive || archive.expiresAt <= now) {
    if (archive) archives.delete(id);
    return undefined;
  }
  return archive;
}

export function registerArchiveDownloadRoutes(app: Express) {
  app.get("/api/archives/:id", (request, response) => {
    const archive = getEphemeralArchive(request.params.id);
    if (!archive) {
      response.status(404).json({ error: "This archive is unavailable or has expired. Please create a new package." });
      return;
    }
    response.setHeader("Cache-Control", "private, no-store");
    response.setHeader("Content-Type", "application/zip");
    response.setHeader("Content-Disposition", `attachment; filename="${archive.fileName}"`);
    response.status(200).send(archive.buffer);
  });
}
