import { createHash } from "node:crypto";
import { lookup } from "node:dns/promises";
import path from "node:path";
import * as cheerio from "cheerio";
import JSZip from "jszip";

const MAX_ASSETS = 180;
const MAX_PAGES = 16;
const MAX_TOTAL_BYTES = 30 * 1024 * 1024;
const MAX_SINGLE_FILE_BYTES = 8 * 1024 * 1024;
const REQUEST_TIMEOUT_MS = 18_000;
const USER_AGENT = "SitePackStudio/1.0 (+public-site-archiver)";

export type CrawlOptions = {
  includeSameOriginPages: boolean;
  includeSourceMaps: boolean;
  preserveStructure: boolean;
  renameAssets: boolean;
};

type RecordedResource = {
  url: string;
  localPath: string;
  task?: Promise<void>;
};

export type ArchiveSummary = {
  fileCount: number;
  pageCount: number;
  assetCount: number;
  skippedCount: number;
  byteLength: number;
};

export type ArchiveBuild = {
  buffer: Buffer;
  summary: ArchiveSummary;
  entryPath: string;
  skipped: Array<{ url: string; reason: string }>;
};

export class SiteCrawlerError extends Error {
  constructor(
    message: string,
    readonly code: "INVALID_URL" | "UNSAFE_TARGET" | "ROBOTS_BLOCKED" | "FETCH_FAILED" | "LIMIT_REACHED",
  ) {
    super(message);
    this.name = "SiteCrawlerError";
  }
}

function hash(value: string) {
  return createHash("sha256").update(value).digest("hex").slice(0, 12);
}

function safeHost(hostname: string) {
  return hostname.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "site";
}

function isUnsafeIpv4(address: string) {
  const parts = address.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return true;
  const [a, b, c, d] = parts;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    // 192.0.0.0/24 is special-purpose space. Do not block the broader
    // 192.0.0.0/16 range: public sites, including www.biohub.org, resolve
    // to 192.0.66.96 and must remain reachable.
    (a === 192 && b === 0 && c === 0 && !((d === 9) || (d === 10))) ||
    (a === 192 && b === 0 && c === 2) ||
    (a === 192 && b === 88 && c === 99) ||
    (a === 198 && b === 51 && c === 100) ||
    (a === 203 && b === 0 && c === 113) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
}

export function isPublicIp(address: string) {
  if (address.includes(".")) return !isUnsafeIpv4(address.replace(/^::ffff:/i, ""));
  const normalized = address.toLowerCase();
  return !(
    normalized === "::" ||
    normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe80:") ||
    normalized.startsWith("::ffff:127.") ||
    normalized.startsWith("::ffff:10.") ||
    normalized.startsWith("::ffff:192.168.") ||
    normalized.startsWith("::ffff:169.254.")
  );
}

export function normalizePublicUrl(value: string, base?: string) {
  let url: URL;
  try {
    url = new URL(value, base);
  } catch {
    throw new SiteCrawlerError("Enter a valid public http or https URL.", "INVALID_URL");
  }

  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) {
    throw new SiteCrawlerError("Only public http or https URLs without credentials can be archived.", "INVALID_URL");
  }
  if (url.port && !["80", "443"].includes(url.port)) {
    throw new SiteCrawlerError("Non-standard network ports are not supported for safety.", "UNSAFE_TARGET");
  }
  url.hash = "";
  return url;
}

async function assertPublicTarget(url: URL) {
  const hostname = url.hostname.toLowerCase();
  if (hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".local") || hostname.endsWith(".internal")) {
    throw new SiteCrawlerError("Private, local, and internal network addresses cannot be archived.", "UNSAFE_TARGET");
  }

  const records = await lookup(hostname, { all: true, verbatim: true }).catch(() => []);
  if (records.length === 0) throw new SiteCrawlerError("The hostname could not be resolved from the archive service.", "FETCH_FAILED");
  if (records.some((record) => !isPublicIp(record.address))) {
    throw new SiteCrawlerError("This address resolves to a private or reserved network range and cannot be archived.", "UNSAFE_TARGET");
  }
}

function relativeReference(fromLocalPath: string, toLocalPath: string) {
  const relative = path.posix.relative(path.posix.dirname(fromLocalPath), toLocalPath) || path.posix.basename(toLocalPath);
  return relative.startsWith(".") ? relative : `./${relative}`;
}

function shouldIgnoreReference(value: string | undefined) {
  if (!value) return true;
  const normalized = value.trim().toLowerCase();
  return !normalized || normalized.startsWith("#") || normalized.startsWith("data:") || normalized.startsWith("blob:") || normalized.startsWith("javascript:") || normalized.startsWith("mailto:") || normalized.startsWith("tel:");
}

function contentTypeExtension(contentType: string) {
  const type = contentType.split(";")[0].trim().toLowerCase();
  const known: Record<string, string> = {
    "text/css": ".css",
    "text/javascript": ".js",
    "application/javascript": ".js",
    "application/json": ".json",
    "image/svg+xml": ".svg",
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/x-icon": ".ico",
    "font/woff2": ".woff2",
    "font/woff": ".woff",
    "font/ttf": ".ttf",
    "font/otf": ".otf",
    "application/font-woff": ".woff",
    "video/mp4": ".mp4",
    "audio/mpeg": ".mp3",
  };
  return known[type] ?? ".bin";
}

function extensionFor(url: URL, contentType = "") {
  const extension = path.posix.extname(url.pathname).toLowerCase();
  if (extension && extension.length <= 8) return extension;
  return contentTypeExtension(contentType);
}

function categoryForExtension(extension: string) {
  if ([".css", ".scss", ".less"].includes(extension)) return "styles";
  if ([".js", ".mjs", ".cjs", ".map"].includes(extension)) return "scripts";
  if ([".woff", ".woff2", ".ttf", ".otf", ".eot"].includes(extension)) return "fonts";
  if ([".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".ico", ".avif"].includes(extension)) return "images";
  if ([".mp4", ".webm", ".mp3", ".wav", ".ogg"].includes(extension)) return "media";
  return "assets";
}

async function fetchWithRedirects(initialUrl: URL) {
  let currentUrl = initialUrl;
  for (let redirectCount = 0; redirectCount <= 5; redirectCount += 1) {
    await assertPublicTarget(currentUrl);
    const response = await fetch(currentUrl, {
      redirect: "manual",
      headers: { "User-Agent": USER_AGENT, Accept: "text/html,application/xhtml+xml,text/css,application/javascript,image/avif,image/webp,image/*,*/*;q=0.7" },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    }).catch((error) => {
      throw new SiteCrawlerError(`Could not fetch ${currentUrl.hostname}: ${error instanceof Error ? error.message : "network request failed"}`, "FETCH_FAILED");
    });

    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");
      if (!location) throw new SiteCrawlerError("The website returned a redirect without a destination.", "FETCH_FAILED");
      currentUrl = normalizePublicUrl(location, currentUrl.toString());
      continue;
    }

    if (!response.ok) throw new SiteCrawlerError(`The website returned HTTP ${response.status} for ${currentUrl.hostname}.`, "FETCH_FAILED");
    return { response, finalUrl: currentUrl };
  }
  throw new SiteCrawlerError("The website redirected too many times.", "FETCH_FAILED");
}

async function allowedByRobots(url: URL) {
  const robotsUrl = new URL("/robots.txt", url);
  try {
    const { response } = await fetchWithRedirects(robotsUrl);
    if (!response.headers.get("content-type")?.includes("text")) return true;
    const robots = await response.text();
    const groups = robots.split(/\n\s*\n/);
    const pathToCheck = url.pathname || "/";
    for (const group of groups) {
      const lines = group.split(/\r?\n/).map((line) => line.trim());
      const applies = lines.some((line) => /^user-agent\s*:\s*(\*|sitepackstudio)/i.test(line));
      if (!applies) continue;
      for (const line of lines) {
        const match = /^disallow\s*:\s*(.*)$/i.exec(line);
        if (!match) continue;
        const rule = match[1].trim();
        if (rule && pathToCheck.startsWith(rule)) return false;
      }
    }
  } catch {
    // A missing or inaccessible robots.txt does not block an otherwise public fetch.
  }
  return true;
}

export class SiteArchiveBuilder {
  private readonly zip = new JSZip();
  private readonly assets = new Map<string, RecordedResource>();
  private readonly pages = new Map<string, RecordedResource>();
  private readonly skipped: Array<{ url: string; reason: string }> = [];
  private totalBytes = 0;
  private fileCount = 0;

  constructor(
    private readonly source: URL,
    private readonly options: CrawlOptions,
  ) {}

  private registerSkipped(url: string, reason: string) {
    if (this.skipped.length < 100) this.skipped.push({ url, reason });
  }

  private addFile(localPath: string, content: Buffer | string) {
    const byteLength = typeof content === "string" ? Buffer.byteLength(content) : content.byteLength;
    if (byteLength > MAX_SINGLE_FILE_BYTES) throw new SiteCrawlerError(`A linked file exceeded the ${Math.round(MAX_SINGLE_FILE_BYTES / 1024 / 1024)} MB per-file limit.`, "LIMIT_REACHED");
    if (this.totalBytes + byteLength > MAX_TOTAL_BYTES) throw new SiteCrawlerError(`The archive exceeded the ${Math.round(MAX_TOTAL_BYTES / 1024 / 1024)} MB total limit.`, "LIMIT_REACHED");
    this.totalBytes += byteLength;
    this.fileCount += 1;
    this.zip.file(localPath, content);
  }

  private assetPath(url: URL, contentType = "") {
    const extension = extensionFor(url, contentType);
    const category = categoryForExtension(extension);
    const host = safeHost(url.hostname);
    const originalName = path.posix.basename(url.pathname).replace(/[^a-zA-Z0-9._-]/g, "-").replace(/^[-.]+/, "") || "file";
    if (this.options.preserveStructure) {
      const folderSegments = path.posix.dirname(url.pathname)
        .split("/")
        .filter((segment) => segment && segment !== "." && segment !== "..")
        .map((segment) => segment.replace(/[^a-zA-Z0-9._-]/g, "-"));
      const nameWithExtension = extension === path.posix.extname(originalName) ? originalName : `${originalName}${extension}`;
      const safeName = this.options.renameAssets
        ? `${hash(url.toString())}-${nameWithExtension}`
        : `${nameWithExtension}${url.search ? `-${hash(url.search)}` : ""}`;
      return ["assets", host, ...folderSegments, safeName].join("/");
    }
    const name = this.options.renameAssets ? `${host}-${hash(url.toString())}${extension}` : `${host}-${hash(url.toString())}-${originalName}${extension === path.posix.extname(originalName) ? "" : extension}`;
    return `assets/${category}/${name}`;
  }

  private pagePath(url: URL) {
    if (url.toString() === this.source.toString()) return "index.html";
    return `pages/${safeHost(url.hostname)}-${hash(url.toString())}.html`;
  }

  private registerAsset(value: string, baseUrl: URL, parentPath: string) {
    if (shouldIgnoreReference(value)) return value;
    let absolute: URL;
    try {
      absolute = normalizePublicUrl(value, baseUrl.toString());
    } catch (error) {
      this.registerSkipped(value, error instanceof Error ? error.message : "Invalid asset URL");
      return value;
    }
    const canonical = absolute.toString();
    let resource = this.assets.get(canonical);
    if (!resource) {
      if (this.assets.size >= MAX_ASSETS) {
        this.registerSkipped(canonical, `Asset limit of ${MAX_ASSETS} reached`);
        return value;
      }
      resource = { url: canonical, localPath: this.assetPath(absolute) };
      this.assets.set(canonical, resource);
      resource.task = this.crawlAsset(resource, absolute);
    }
    return relativeReference(parentPath, resource.localPath);
  }

  private registerPage(value: string, baseUrl: URL, parentPath: string) {
    if (!this.options.includeSameOriginPages || shouldIgnoreReference(value)) return value;
    let absolute: URL;
    try {
      absolute = normalizePublicUrl(value, baseUrl.toString());
    } catch {
      return value;
    }
    if (absolute.origin !== this.source.origin) return value;
    const canonical = absolute.toString();
    let resource = this.pages.get(canonical);
    if (!resource) {
      if (this.pages.size >= MAX_PAGES) {
        this.registerSkipped(canonical, `Page limit of ${MAX_PAGES} reached`);
        return value;
      }
      resource = { url: canonical, localPath: this.pagePath(absolute) };
      this.pages.set(canonical, resource);
      resource.task = this.crawlPage(resource, absolute);
    }
    return relativeReference(parentPath, resource.localPath);
  }

  private rewriteCss(css: string, baseUrl: URL, parentPath: string) {
    const rewriteReference = (value: string) => this.registerAsset(value, baseUrl, parentPath);
    const importRewritten = css.replace(/@import\s+(?:url\()?\s*(["'])([^"']+)\1\s*\)?/gi, (match, quote: string, raw: string) => {
      const reference = rewriteReference(raw);
      return match.replace(raw, reference);
    });
    return importRewritten.replace(/url\(\s*(["']?)([^"')]+)\1\s*\)/gi, (match, quote: string, raw: string) => {
      const reference = rewriteReference(raw.trim());
      return `url(${quote}${reference}${quote})`;
    });
  }

  private rewriteJavaScript(code: string, baseUrl: URL, parentPath: string) {
    const replaceReference = (raw: string) => /^(?:[./]|https?:\/\/)/i.test(raw.trim())
      ? this.registerAsset(raw, baseUrl, parentPath)
      : raw;
    return code
      .replace(/((?:import|export)\s+(?:[^'";]*?\s+from\s+)?["'])([^"']+)(["'])/g, (_match, prefix: string, raw: string, suffix: string) => `${prefix}${replaceReference(raw)}${suffix}`)
      .replace(/(import\(\s*["'])([^"']+)(["']\s*\))/g, (_match, prefix: string, raw: string, suffix: string) => `${prefix}${replaceReference(raw)}${suffix}`)
      .replace(/(new\s+URL\(\s*["'])([^"']+)(["']\s*,\s*import\.meta\.url\s*\))/g, (_match, prefix: string, raw: string, suffix: string) => `${prefix}${replaceReference(raw)}${suffix}`);
  }

  private rewriteSrcset(srcset: string, baseUrl: URL, parentPath: string) {
    return srcset
      .split(",")
      .map((candidate) => {
        const parts = candidate.trim().split(/\s+/);
        if (!parts[0]) return candidate;
        const rewritten = this.registerAsset(parts[0], baseUrl, parentPath);
        return [rewritten, ...parts.slice(1)].join(" ");
      })
      .join(", ");
  }

  private async crawlAsset(resource: RecordedResource, sourceUrl: URL) {
    try {
      const { response, finalUrl } = await fetchWithRedirects(sourceUrl);
      const declaredLength = Number(response.headers.get("content-length") ?? 0);
      if (declaredLength > MAX_SINGLE_FILE_BYTES) throw new SiteCrawlerError(`Linked file exceeds the ${Math.round(MAX_SINGLE_FILE_BYTES / 1024 / 1024)} MB per-file limit.`, "LIMIT_REACHED");
      const contentType = response.headers.get("content-type") ?? "application/octet-stream";
      const bytes = Buffer.from(await response.arrayBuffer());
      const extension = extensionFor(finalUrl, contentType);
      const isCss = contentType.includes("text/css") || extension === ".css";
      const isJavaScript = /(?:javascript|ecmascript|module)/i.test(contentType) || [".js", ".mjs", ".cjs"].includes(extension);
      const finalPath = resource.localPath;

      if (isCss) {
        this.addFile(finalPath, this.rewriteCss(bytes.toString("utf8"), finalUrl, finalPath));
      } else if (isJavaScript) {
        const script = this.rewriteJavaScript(bytes.toString("utf8"), finalUrl, finalPath);
        const scriptWithSourceMap = this.options.includeSourceMaps
          ? script.replace(/(\/\/[#@]\s*sourceMappingURL=)([^\s]+)/g, (_match, prefix: string, raw: string) => `${prefix}${this.registerAsset(raw, finalUrl, finalPath)}`)
          : script;
        this.addFile(finalPath, scriptWithSourceMap);
      } else {
        this.addFile(finalPath, bytes);
      }
    } catch (error) {
      this.registerSkipped(resource.url, error instanceof Error ? error.message : "Asset download failed");
    }
  }

  private async crawlPage(resource: RecordedResource, sourceUrl: URL) {
    try {
      const { response, finalUrl } = await fetchWithRedirects(sourceUrl);
      const contentType = response.headers.get("content-type") ?? "text/html";
      if (!/(text\/html|application\/xhtml\+xml)/i.test(contentType)) throw new SiteCrawlerError("The requested document is not an HTML page.", "FETCH_FAILED");
      const html = await response.text();
      const $ = cheerio.load(html);
      const pagePath = resource.localPath;
      $("base").remove();

      $("link[href]").each((_index, element) => {
        const link = $(element);
        const href = link.attr("href");
        const rel = (link.attr("rel") ?? "").toLowerCase();
        const shouldFetch = /stylesheet|icon|manifest|modulepreload|preload|apple-touch-icon|mask-icon/.test(rel);
        if (href && shouldFetch) link.attr("href", this.registerAsset(href, finalUrl, pagePath));
      });
      $("script[src]").each((_index, element) => {
        const script = $(element);
        const src = script.attr("src");
        if (src) script.attr("src", this.registerAsset(src, finalUrl, pagePath));
      });
      $("script:not([src])").each((_index, element) => {
        const script = $(element);
        const contents = script.html();
        if (contents) script.text(this.rewriteJavaScript(contents, finalUrl, pagePath));
      });
      $("img[src], source[src], video[src], audio[src], track[src], embed[src], iframe[src], input[src]").each((_index, element) => {
        const node = $(element);
        const src = node.attr("src");
        if (src) node.attr("src", this.registerAsset(src, finalUrl, pagePath));
      });
      $("video[poster], object[data]").each((_index, element) => {
        const node = $(element);
        const attribute = node.is("video") ? "poster" : "data";
        const value = node.attr(attribute);
        if (value) node.attr(attribute, this.registerAsset(value, finalUrl, pagePath));
      });
      $("img[srcset], source[srcset]").each((_index, element) => {
        const node = $(element);
        const srcset = node.attr("srcset");
        if (srcset) node.attr("srcset", this.rewriteSrcset(srcset, finalUrl, pagePath));
      });
      $("link[imagesrcset]").each((_index, element) => {
        const link = $(element);
        const srcset = link.attr("imagesrcset");
        if (srcset) link.attr("imagesrcset", this.rewriteSrcset(srcset, finalUrl, pagePath));
      });
      $("meta[property='og:image'][content], meta[name='twitter:image'][content], meta[itemprop='image'][content]").each((_index, element) => {
        const meta = $(element);
        const content = meta.attr("content");
        if (content) meta.attr("content", this.registerAsset(content, finalUrl, pagePath));
      });
      $("[style]").each((_index, element) => {
        const node = $(element);
        const style = node.attr("style");
        if (style) node.attr("style", this.rewriteCss(style, finalUrl, pagePath));
      });
      $("style").each((_index, element) => {
        const style = $(element);
        style.text(this.rewriteCss(style.html() ?? "", finalUrl, pagePath));
      });
      $("a[href]").each((_index, element) => {
        const anchor = $(element);
        const href = anchor.attr("href");
        if (href && !anchor.attr("download")) anchor.attr("href", this.registerPage(href, finalUrl, pagePath));
      });

      $("head").append(`<meta name="sitepack-source" content="${finalUrl.toString().replace(/&/g, "&amp;").replace(/\"/g, "&quot;")}">`);
      this.addFile(pagePath, $.html());
    } catch (error) {
      this.registerSkipped(resource.url, error instanceof Error ? error.message : "Page download failed");
    }
  }

  private async waitForTasks() {
    let previousTaskCount = -1;
    while (previousTaskCount !== this.assets.size + this.pages.size) {
      previousTaskCount = this.assets.size + this.pages.size;
      const tasks = [...Array.from(this.assets.values()), ...Array.from(this.pages.values())].map((resource) => resource.task).filter((task): task is Promise<void> => Boolean(task));
      await Promise.all(tasks);
    }
  }

  async build(): Promise<ArchiveBuild> {
    if (!(await allowedByRobots(this.source))) throw new SiteCrawlerError("The target site's robots policy disallows archiving this path.", "ROBOTS_BLOCKED");
    const entry: RecordedResource = { url: this.source.toString(), localPath: "index.html" };
    this.pages.set(this.source.toString(), entry);
    entry.task = this.crawlPage(entry, this.source);
    await this.waitForTasks();

    const manifest = {
      generatedBy: "SitePack Studio",
      generatedAt: new Date().toISOString(),
      source: this.source.toString(),
      entry: "index.html",
      options: this.options,
      summary: { files: this.fileCount, pages: this.pages.size, assets: this.assets.size, skipped: this.skipped.length, rawBytes: this.totalBytes },
      skipped: this.skipped,
      limitations: [
        "Only public files accessible without authentication, session cookies, CAPTCHA, or paywall are included.",
        "An archive can be blocked when the target website's robots policy disallows the requested path.",
        "The archive contains public HTML and statically referenced frontend resources. Backend source, server APIs, databases, secrets, and personalized content cannot be retrieved from a public website.",
        "JavaScript-driven runtime requests and assets not statically referenced in the downloaded files may need manual capture.",
      ],
    };
    this.zip.file("sitepack-manifest.json", JSON.stringify(manifest, null, 2));
    this.zip.file("README.txt", `SITEPACK STUDIO\n\nOpen index.html in a browser.\nSource: ${this.source}\n\nThe archive includes public frontend source files that were statically referenced: HTML, CSS, JavaScript, fonts, images, media, and other downloadable assets.\n\nThis package is for pages you are authorized to archive.\n`);
    this.zip.file("BACKEND-SOURCE-NOT-AVAILABLE.md", `# Backend source availability\n\nSitePack Studio can package the public frontend files exposed by a website. A public URL does not expose the website's private server repository, application source, database schema, API credentials, environment variables, authentication sessions, or hosting configuration.\n\nIf you own the website, obtain those files from its repository, hosting provider, backups, or deployment artifact instead.\n`);
    const buffer = await this.zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE", compressionOptions: { level: 6 } });
    return {
      buffer,
      entryPath: "index.html",
      skipped: this.skipped,
      summary: { fileCount: this.fileCount + 3, pageCount: this.pages.size, assetCount: this.assets.size, skippedCount: this.skipped.length, byteLength: buffer.byteLength },
    };
  }
}

export async function buildPublicSiteArchive(url: string, options: CrawlOptions) {
  const source = normalizePublicUrl(url);
  await assertPublicTarget(source);
  const builder = new SiteArchiveBuilder(source, options);
  return builder.build();
}
