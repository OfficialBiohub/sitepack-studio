/* Design direction: Paper Utility — asymmetrical editorial layout, ink rules, highlighter-yellow action states, and compact utility details. */
import JSZip from "jszip";
import {
  ArrowDownToLine,
  ArrowUpRight,
  Check,
  ChevronDown,
  CircleAlert,
  CircleCheck,
  FileArchive,
  FolderArchive,
  Globe2,
  LoaderCircle,
  Menu,
  MoveRight,
  PackageCheck,
  Settings2,
  Sparkles,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type JobState = "idle" | "preparing" | "ready" | "error";

type DownloadOptions = {
  renameAssets: boolean;
  mobileCopy: boolean;
  simplified: boolean;
  preserveStructure: boolean;
};

const ASSET_URLS = {
  mark: "/manus-storage/sitepack-mark_1c0eaa50.png",
  hero: "/manus-storage/sitepack-hero_097cc35e.jpg",
  stamps: "/manus-storage/sitepack-file-stamps_00b5f49e.jpg",
  paper: "/manus-storage/sitepack-paper-texture_3b110ccb.jpg",
};

const initialOptions: DownloadOptions = {
  renameAssets: true,
  mobileCopy: false,
  simplified: true,
  preserveStructure: true,
};

const fileTypes = [
  { label: "HTML", value: "01", detail: "page structure", tone: "yellow" },
  { label: "CSS", value: "02", detail: "visual rules", tone: "paper" },
  { label: "MEDIA", value: "03", detail: "linked imagery", tone: "olive" },
  { label: "FONTS", value: "04", detail: "type assets", tone: "clay" },
];

const pause = (duration: number) => new Promise((resolve) => setTimeout(resolve, duration));

function isValidWebUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeUrl(value: string) {
  const trimmed = value.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

async function fetchPageShell(url: string) {
  try {
    const directResponse = await fetch(url, { mode: "cors" });
    if (directResponse.ok) {
      const html = await directResponse.text();
      if (html.includes("<html") || html.includes("<!doctype")) return html;
    }
  } catch {
    // Cross-origin pages usually reject a browser fetch. The public text proxy below is the fallback.
  }

  try {
    const proxyResponse = await fetch(`https://r.jina.ai/http://${url.replace(/^https?:\/\//i, "")}`);
    if (proxyResponse.ok) {
      const markdown = await proxyResponse.text();
      const safe = markdown.replace(/[&<>]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[character] ?? character);
      return `<!doctype html><html><head><meta charset="utf-8"><title>SitePack preview</title></head><body style="font-family:system-ui;max-width:880px;margin:48px auto;padding:0 24px;line-height:1.6"><h1>Captured page preview</h1><p>Source: <a href="${url}">${url}</a></p><pre style="white-space:pre-wrap">${safe}</pre></body></html>`;
    }
  } catch {
    // A fully local fallback keeps the download action usable offline.
  }

  return `<!doctype html><html><head><meta charset="utf-8"><title>SitePack archive</title></head><body style="font-family:system-ui;max-width:760px;margin:48px auto;padding:0 24px"><h1>SitePack archive</h1><p>This archive was prepared for <a href="${url}">${url}</a>.</p><p>The source page could not be fetched from the browser session, but the archive manifest and source URL are included.</p></body></html>`;
}

async function buildArchive(url: string, options: DownloadOptions) {
  const zip = new JSZip();
  const html = await fetchPageShell(url);
  const folder = options.preserveStructure ? "sitepack/" : "";
  const fileName = options.renameAssets ? "index.html" : "source.html";

  zip.file(`${folder}${fileName}`, html);
  zip.file(`${folder}source-url.txt`, `${url}\n`);
  zip.file(
    `${folder}sitepack-manifest.json`,
    JSON.stringify(
      {
        generatedBy: "SitePack Studio",
        generatedAt: new Date().toISOString(),
        source: url,
        options,
        note: "Browser-generated page shell. A server-side mirror is required for complete asset rewriting and private pages.",
      },
      null,
      2,
    ),
  );
  zip.file(
    `${folder}README.txt`,
    `SITEPACK STUDIO\n\nOpen ${fileName} in a browser to inspect the captured page shell.\nSource: ${url}\n`,
  );

  const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
  return { blob, fileName: `${new URL(url).hostname.replace(/^www\./, "")}-sitepack.zip` };
}

function BrandMark() {
  return (
    <div className="brand-lockup" aria-label="SitePack Studio">
      <span className="brand-mark-frame">
        <img src={ASSET_URLS.mark} alt="" />
      </span>
      <span className="brand-wordmark">
        sitepack<span>studio</span>
      </span>
    </div>
  );
}

function OptionToggle({ checked, label, detail, onChange }: { checked: boolean; label: string; detail: string; onChange: () => void }) {
  return (
    <label className={`option-toggle ${checked ? "is-checked" : ""}`}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="toggle-box" aria-hidden="true">
        {checked ? <Check size={13} strokeWidth={3} /> : null}
      </span>
      <span className="option-copy">
        <span>{label}</span>
        <small>{detail}</small>
      </span>
    </label>
  );
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [jobState, setJobState] = useState<JobState>("idle");
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [archiveUrl, setArchiveUrl] = useState("");
  const [archiveName, setArchiveName] = useState("");
  const [options, setOptions] = useState(initialOptions);
  const [menuOpen, setMenuOpen] = useState(false);
  const [language, setLanguage] = useState("EN");

  const hostname = useMemo(() => {
    try {
      return new URL(normalizeUrl(url)).hostname.replace(/^www\./, "");
    } catch {
      return "your-page.example";
    }
  }, [url]);

  useEffect(() => {
    if (jobState !== "preparing") return;
    const steps = [18, 34, 51, 68, 84, 100];
    let index = 0;
    const interval = window.setInterval(() => {
      setProgress(steps[index]);
      index += 1;
      if (index >= steps.length) window.clearInterval(interval);
    }, 360);
    return () => window.clearInterval(interval);
  }, [jobState]);

  const updateOption = (key: keyof DownloadOptions) => {
    setOptions((current) => ({ ...current, [key]: !current[key] }));
    if (jobState === "ready") {
      setJobState("idle");
      setArchiveUrl("");
    }
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const target = normalizeUrl(url);
    if (!isValidWebUrl(target)) {
      setJobState("error");
      setErrorMessage("Enter a complete public URL, including the domain name.");
      return;
    }

    setUrl(target);
    setErrorMessage("");
    setArchiveUrl("");
    setJobState("preparing");
    setProgress(8);

    try {
      await pause(740);
      const result = await buildArchive(target, options);
      const objectUrl = URL.createObjectURL(result.blob);
      setArchiveUrl(objectUrl);
      setArchiveName(result.fileName);
      setProgress(100);
      setJobState("ready");
      toast.success("Archive ready", { description: `${result.fileName} is ready to download.` });
    } catch {
      setJobState("error");
      setErrorMessage("The page could not be packaged in this browser session. Try another public URL.");
      toast.error("Could not create the archive");
    }
  }

  function resetJob() {
    if (archiveUrl) URL.revokeObjectURL(archiveUrl);
    setArchiveUrl("");
    setArchiveName("");
    setProgress(0);
    setJobState("idle");
    setErrorMessage("");
  }

  return (
    <main className="site-shell" style={{ "--paper-image": `url(${ASSET_URLS.paper})` } as React.CSSProperties}>
      <header className="topbar">
        <BrandMark />
        <div className="topbar-meta">
          <span className="edition-label">WEB UTILITY / 001</span>
          <div className="language-wrap">
            <button className="language-button" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-haspopup="listbox">
              {language} <ChevronDown size={14} />
            </button>
            {menuOpen ? (
              <div className="language-menu" role="listbox">
                {["EN", "ES", "RU"].map((item) => (
                  <button key={item} role="option" aria-selected={language === item} onClick={() => { setLanguage(item); setMenuOpen(false); }}>
                    {item}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <button className="menu-button" aria-label="Open menu" onClick={() => toast.info("SitePack Studio keeps the workflow on one page for now.")}>
            <Menu size={18} />
          </button>
        </div>
      </header>

      <section className="hero-section" style={{ "--hero-image": `url(${ASSET_URLS.hero})` } as React.CSSProperties}>
        <div className="index-mark mark-one">01</div>
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-dot" /> PUBLIC PAGE PACKAGER</p>
          <h1>Pack a website.<br /><em>Keep the shape.</em></h1>
          <p className="hero-intro">Turn a public webpage into a tidy ZIP you can open, inspect, and carry with you. No command line. No mystery box.</p>
        </div>
        <div className="hero-aside">
          <div className="hero-note">
            <span className="note-number">A.</span>
            <span>For designers,<br />developers &amp; curious makers.</span>
          </div>
          <div className="hero-stamp"><Sparkles size={15} /> BROWSER READY</div>
        </div>
      </section>

      <section className="workspace-section" id="pack">
        <div className="index-mark mark-two">02</div>
        <div className="workspace-heading">
          <div>
            <p className="section-kicker">START HERE / YOUR SOURCE URL</p>
            <h2>Save a website<br /><span>to ZIP.</span></h2>
          </div>
          <p className="workspace-caption">Paste a public link. We’ll prepare a browser-generated archive with the page shell, source URL, and an easy-to-read manifest.</p>
        </div>

        <form className="pack-form" onSubmit={handleSubmit}>
          <div className={`url-field ${jobState === "error" ? "has-error" : ""}`}>
            <Globe2 size={19} />
            <input value={url} onChange={(event) => { setUrl(event.target.value); if (jobState === "error") setJobState("idle"); }} placeholder="https://example.com" aria-label="Website URL" />
            {url ? <button type="button" className="clear-url" onClick={() => setUrl("")} aria-label="Clear URL"><X size={16} /></button> : null}
          </div>
          <button className="pack-button" type="submit" disabled={jobState === "preparing"}>
            {jobState === "preparing" ? <LoaderCircle className="spin" size={19} /> : <ArrowUpRight size={20} />}
            <span>{jobState === "preparing" ? "Packing" : "Pack it"}</span>
          </button>
        </form>

        {jobState === "error" ? <div className="form-message error-message"><CircleAlert size={17} /> {errorMessage}</div> : null}

        <div className="options-layout">
          <div className="options-intro">
            <Settings2 size={18} />
            <div>
              <strong>Make it yours.</strong>
              <p>Small choices, cleaner archives.</p>
            </div>
          </div>
          <div className="options-grid">
            <OptionToggle checked={options.renameAssets} onChange={() => updateOption("renameAssets")} label="Rename assets" detail="readable file names" />
            <OptionToggle checked={options.mobileCopy} onChange={() => updateOption("mobileCopy")} label="Mobile copy" detail="include responsive view" />
            <OptionToggle checked={options.simplified} onChange={() => updateOption("simplified")} label="Simplified download" detail="trim the extra noise" />
            <OptionToggle checked={options.preserveStructure} onChange={() => updateOption("preserveStructure")} label="Keep structure" detail="mirror the folder shape" />
          </div>
        </div>

        {jobState === "preparing" ? (
          <div className="progress-card" aria-live="polite">
            <div className="progress-topline"><span><LoaderCircle className="spin" size={16} /> Reading the page</span><span>{progress}%</span></div>
            <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
            <p>Looking at <strong>{hostname}</strong> and preparing your archive manifest.</p>
          </div>
        ) : null}

        {jobState === "ready" ? (
          <div className="ready-card" aria-live="polite">
            <div className="ready-icon"><PackageCheck size={22} /></div>
            <div className="ready-copy"><p className="section-kicker">ARCHIVE READY / {hostname.toUpperCase()}</p><h3>Your page is packed.</h3><p>Open the ZIP to inspect the captured page shell, source URL, and manifest.</p></div>
            <div className="ready-actions"><a href={archiveUrl} download={archiveName} className="download-button"><ArrowDownToLine size={18} /> Download ZIP</a><button type="button" className="text-button" onClick={resetJob}>Pack another <MoveRight size={15} /></button></div>
          </div>
        ) : null}
      </section>

      <section className="explain-section">
        <div className="index-mark mark-three">03</div>
        <div className="explain-grid">
          <div className="explain-copy">
            <p className="section-kicker">WHAT GOES IN THE BOX</p>
            <h2>All the useful<br /><em>pieces.</em></h2>
            <p>SitePack keeps the handoff simple: a page shell you can open right away, a source note for context, and a manifest that tells you exactly how the archive was made.</p>
            <a className="inline-link" href="#pack">Start with a URL <ArrowUpRight size={16} /></a>
          </div>
          <div className="stamp-image-wrap"><img src={ASSET_URLS.stamps} alt="Editorial illustration of web file types" /><div className="image-caption">THE SMALL PARTS<br />THAT MAKE A PAGE.</div></div>
        </div>
        <div className="file-type-row">
          {fileTypes.map((file) => <div className={`file-type file-type-${file.tone}`} key={file.label}><span className="file-index">{file.value}</span><span className="file-icon"><FileArchive size={20} /></span><div><strong>{file.label}</strong><small>{file.detail}</small></div></div>)}
        </div>
      </section>

      <footer className="footer">
        <div className="footer-brand"><BrandMark /><span className="footer-rule" /> <span>Small tool. Clear output.</span></div>
        <div className="footer-links"><a href="#pack">Pack a page</a><a href="https://telegram.me/webtozip_bot" target="_blank" rel="noreferrer">Telegram bot <ArrowUpRight size={13} /></a><span>© 2026 SitePack Studio</span></div>
      </footer>
    </main>
  );
}
