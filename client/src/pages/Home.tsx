/* Design direction: Paper Utility — asymmetrical editorial layout, ink rules, highlighter-yellow action states, and compact utility details. */
import {
  ArrowDownToLine,
  ArrowUpRight,
  Check,
  CircleAlert,
  FileArchive,
  Globe2,
  LoaderCircle,
  MoveRight,
  PackageCheck,
  Settings2,
  Sparkles,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState, type CSSProperties } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { PAPER_TEXTURE_URL } from "@/lib/siteAssets";
import { SiteChrome, SiteFooter } from "@/components/SiteChrome";

type JobState = "idle" | "preparing" | "ready" | "error";

type DownloadOptions = {
  renameAssets: boolean;
  includeSameOriginPages: boolean;
  includeSourceMaps: boolean;
  preserveStructure: boolean;
};

const ASSET_URLS = {
  hero: "https://github.com/OfficialBiohub/sitepack-studio/releases/download/sitepack-original-design-assets/sitepack-reference-hero-collage.webp",
  stamps: "https://github.com/OfficialBiohub/sitepack-studio/releases/download/sitepack-original-design-assets/sitepack-file-stamps_00b5f49e.jpg",
};

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const initialOptions: DownloadOptions = {
  renameAssets: true,
  includeSameOriginPages: false,
  includeSourceMaps: false,
  preserveStructure: true,
};

const fileTypes = [
  { label: "HTML", value: "01", detail: "page structure", tone: "yellow" },
  { label: "CSS", value: "02", detail: "visual rules", tone: "paper" },
  { label: "JS", value: "03", detail: "static script code", tone: "olive" },
  { label: "MEDIA", value: "04", detail: "linked imagery", tone: "clay" },
  { label: "FONTS", value: "05", detail: "type assets", tone: "paper" },
];

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

function OptionToggle({ checked, label, detail, onChange }: { checked: boolean; label: string; detail: string; onChange: () => void }) {
  return (
    <label className={`option-toggle ${checked ? "is-checked" : ""}`}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="toggle-box" aria-hidden="true">{checked ? <Check size={13} strokeWidth={3} /> : null}</span>
      <span className="option-copy"><span>{label}</span><small>{detail}</small></span>
    </label>
  );
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [jobState, setJobState] = useState<JobState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState<{ downloadUrl: string; archiveName: string; fileCount: number; pageCount: number; assetCount: number; skippedCount: number; byteLength: number; skipped: Array<{ url: string; reason: string }> } | null>(null);
  const [options, setOptions] = useState(initialOptions);
  const [hasPermission, setHasPermission] = useState(true);
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);

  const packMutation = trpc.packer.create.useMutation();
  const hostname = useMemo(() => {
    try { return new URL(normalizeUrl(url)).hostname.replace(/^www\./, ""); } catch { return "your-page.example"; }
  }, [url]);

  useEffect(() => {
    const handleInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
  }, []);

  async function installApp() {
    if (!installPrompt) {
      toast.info("Install SitePack Studio", { description: "Use your browser menu and choose Add to Home screen or Install app." });
      return;
    }
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") toast.success("Installation started");
    setInstallPrompt(null);
  }

  const updateOption = (key: keyof DownloadOptions) => {
    setOptions((current) => ({ ...current, [key]: !current[key] }));
    if (jobState === "ready") { setJobState("idle"); setResult(null); }
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const target = normalizeUrl(url);
    if (!isValidWebUrl(target)) { setJobState("error"); setErrorMessage("Enter a complete public URL, including the domain name."); return; }
    if (!hasPermission) { setJobState("error"); setErrorMessage("Confirm that you have permission to archive this public website before continuing."); return; }
    setUrl(target); setErrorMessage(""); setResult(null); setJobState("preparing");
    try {
      const archive = await packMutation.mutateAsync({ url: target, acceptsPermissions: true, options });
      setResult(archive); setJobState("ready");
      toast.success("Archive ready", { description: `${archive.fileCount} files are ready to download.` });
    } catch (error) {
      const message = error instanceof Error ? error.message : "The public page could not be packaged.";
      setJobState("error"); setErrorMessage(message); toast.error("Could not create the archive", { description: message });
    }
  }

  function resetJob() { setResult(null); setJobState("idle"); setErrorMessage(""); }

  return (
    <main className="site-shell" style={{ "--paper-image": `url(${PAPER_TEXTURE_URL})` } as CSSProperties}>
      <SiteChrome />

      <section className="hero-section" style={{ "--hero-image": `url(${ASSET_URLS.hero})` } as CSSProperties}>
        <div className="index-mark mark-one">01</div>
        <div className="hero-copy"><p className="eyebrow"><span className="eyebrow-dot" /> PUBLIC SITE ARCHIVER</p><h1>Pack a website.<br /><em>Keep the files.</em></h1><p className="hero-intro">Download public HTML, stylesheets, scripts, images, fonts, and linked frontend assets into a tidy offline ZIP.</p></div>
        <div className="hero-aside"><div className="hero-note"><span className="note-number">A.</span><span>For permitted public pages,<br />not private access.</span></div><div className="hero-stamp"><Sparkles size={15} /> SERVER POWERED</div></div>
      </section>

      <section className="workspace-section" id="pack">
        <div className="index-mark mark-two">02</div>
        <div className="workspace-heading"><div><p className="section-kicker">START HERE / YOUR SOURCE URL</p><h2>Save a website<br /><span>to ZIP.</span></h2></div><p className="workspace-caption">We fetch public frontend source files on the server, including static scripts and assets, rewrite local references, and give you one offline-ready package.</p></div>
        <form className="pack-form" onSubmit={handleSubmit}>
          <div className={`url-field ${jobState === "error" ? "has-error" : ""}`}><Globe2 size={19} /><input value={url} onChange={(event) => { setUrl(event.target.value); if (jobState === "error") setJobState("idle"); }} placeholder="https://example.com" aria-label="Website URL" />{url ? <button type="button" className="clear-url" onClick={() => setUrl("")} aria-label="Clear URL"><X size={16} /></button> : null}</div>
          <button className="pack-button" type="submit" disabled={packMutation.isPending}>{packMutation.isPending ? <LoaderCircle className="spin" size={19} /> : <ArrowUpRight size={20} />}<span>{packMutation.isPending ? "Packing" : "Pack it"}</span></button>
        </form>
        <label className={`permission-note ${hasPermission ? "is-checked" : ""}`}><input type="checkbox" checked={hasPermission} onChange={() => setHasPermission((value) => !value)} /><span className="toggle-box" aria-hidden="true">{hasPermission ? <Check size={12} strokeWidth={3} /> : null}</span><span>I confirm I have permission to archive this public website and its visible frontend files.</span></label>
        {jobState === "error" ? <div className="form-message error-message"><CircleAlert size={17} /> {errorMessage}</div> : null}

        <div className="options-layout"><div className="options-intro"><Settings2 size={18} /><div><strong>Make it yours.</strong><p>Pick the shape of your archive.</p></div></div><div className="options-grid"><OptionToggle checked={options.renameAssets} onChange={() => updateOption("renameAssets")} label="Rename assets" detail="clean stable file names" /><OptionToggle checked={options.includeSameOriginPages} onChange={() => updateOption("includeSameOriginPages")} label="Linked pages" detail="up to 16 same-origin pages" /><OptionToggle checked={options.includeSourceMaps} onChange={() => updateOption("includeSourceMaps")} label="Source maps" detail="include public .map files" /><OptionToggle checked={options.preserveStructure} onChange={() => updateOption("preserveStructure")} label="Keep structure" detail="keep pages in their own folder" /></div></div>

        {jobState === "preparing" ? <div className="progress-card" aria-live="polite"><div className="progress-topline"><span><LoaderCircle className="spin" size={16} /> Fetching public frontend files</span><span>WORKING</span></div><div className="progress-track"><span className="indeterminate" /></div><p>Reading <strong>{hostname}</strong>, downloading accessible files, and rebuilding local references. Large sites can take a moment.</p></div> : null}
        {jobState === "ready" && result ? <div className="ready-card" aria-live="polite"><div className="ready-icon"><PackageCheck size={22} /></div><div className="ready-copy"><p className="section-kicker">ARCHIVE READY / {hostname.toUpperCase()}</p><h3>{result.fileCount} files, packed for offline use.</h3><p>{result.pageCount} HTML page{result.pageCount === 1 ? "" : "s"}, {result.assetCount} discovered public file{result.assetCount === 1 ? "" : "s"}, and {result.skippedCount} unavailable reference{result.skippedCount === 1 ? "" : "s"} recorded in the manifest. The package includes a clear backend-source availability note.</p></div><div className="ready-actions"><a href={result.downloadUrl} download={result.archiveName} className="download-button"><ArrowDownToLine size={18} /> Download ZIP</a><button type="button" className="text-button" onClick={resetJob}>Pack another <MoveRight size={15} /></button></div></div> : null}
      </section>

      <section className="explain-section"><div className="index-mark mark-three">03</div><div className="explain-grid"><div className="explain-copy"><p className="section-kicker">WHAT GOES IN THE BOX</p><h2>All the useful<br /><em>pieces.</em></h2><p>SitePack follows public static references from a page, including stylesheets, module imports, import maps, fonts, images, media, social images, and manifest files. Each ZIP includes a source index with captured public URLs, local paths, types, and sizes. A public address cannot reveal private backend code, databases, API secrets, logins, paywalled content, or CAPTCHA-protected pages.</p><a className="inline-link" href="#pack">Start with a URL <ArrowUpRight size={16} /></a></div><div className="stamp-image-wrap"><img src={ASSET_URLS.stamps} alt="Editorial illustration of web file types" /><div className="image-caption">THE SMALL PARTS<br />THAT MAKE A PAGE.</div></div></div><div className="file-type-row">{fileTypes.map((file) => <div className={`file-type file-type-${file.tone}`} key={file.label}><span className="file-index">{file.value}</span><span className="file-icon"><FileArchive size={20} /></span><div><strong>{file.label}</strong><small>{file.detail}</small></div></div>)}</div></section>

      <SiteFooter onInstall={() => void installApp()} />
    </main>
  );
}
