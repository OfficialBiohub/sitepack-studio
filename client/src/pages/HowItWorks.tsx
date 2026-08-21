import { ArrowDownToLine, CheckCircle2, FileArchive, Globe2, PackageCheck } from "lucide-react";
import { Link } from "wouter";
import { SitePage } from "@/components/SiteChrome";

const steps = [
  { number: "01", icon: Globe2, title: "Share a public URL", copy: "Paste the address of a website you are allowed to archive. SitePack works with public, browser-accessible frontend files." },
  { number: "02", icon: FileArchive, title: "Choose the package shape", copy: "Select whether to rename assets, follow same-origin pages, include public source maps, or preserve the source structure." },
  { number: "03", icon: PackageCheck, title: "Download the ZIP", copy: "SitePack collects public frontend references, rebuilds local paths, and prepares an offline-ready archive with a source index." },
];

export default function HowItWorks() {
  return (
    <SitePage>
      <section className="subpage-hero">
        <div className="index-mark page-mark">01</div>
        <div>
          <p className="section-kicker">FIELD GUIDE / 001</p>
          <h1 className="subpage-title">How the <em>pack</em><br />comes together.</h1>
        </div>
        <p className="subpage-intro">A deliberate three-step workflow for keeping a permitted public website’s visible frontend files close at hand.</p>
      </section>

      <section className="process-section" aria-label="SitePack workflow">
        <div className="process-heading"><p className="section-kicker">THE ROUTE FROM URL TO ZIP</p><p>Nothing hidden, nothing inferred. You choose the source, the scope, and the archive shape.</p></div>
        <div className="process-flow">
          {steps.map(({ number, icon: Icon, title, copy }) => <article className="process-step" key={number}><span className="step-number">{number}</span><span className="step-icon"><Icon size={23} /></span><h2>{title}</h2><p>{copy}</p></article>)}
        </div>
      </section>

      <section className="rules-section">
        <div><p className="section-kicker">A CLEAR BOUNDARY</p><h2>Public pages only.<br /><em>Permission first.</em></h2></div>
        <div className="rules-copy"><p>SitePack is designed for visible public frontend resources: HTML, stylesheets, client-side scripts, images, fonts, media, manifests, and linked static files. It does not reveal private backend code, databases, account areas, API secrets, paywalled material, or CAPTCHA-protected pages.</p><div className="rule-check"><CheckCircle2 size={18} /><span>Confirm you have permission before creating an archive.</span></div><Link href="/#pack" className="black-action">Start a permitted archive <ArrowDownToLine size={17} /></Link></div>
      </section>
    </SitePage>
  );
}
