import { buildPublicSiteArchive } from "../server/services/siteCrawler";

const target = process.argv[2] ?? "https://example.com";

const archive = await buildPublicSiteArchive(target, {
  includeSameOriginPages: false,
  includeSourceMaps: false,
  preserveStructure: true,
  renameAssets: true,
});

if (archive.buffer.byteLength < 400) {
  throw new Error("Expected a non-empty ZIP archive.");
}
if (archive.entryPath !== "index.html") {
  throw new Error("The archive entry point was not index.html.");
}

console.log(JSON.stringify({
  target,
  archiveBytes: archive.buffer.byteLength,
  files: archive.summary.fileCount,
  pages: archive.summary.pageCount,
  assets: archive.summary.assetCount,
  skipped: archive.summary.skippedCount,
}, null, 2));
