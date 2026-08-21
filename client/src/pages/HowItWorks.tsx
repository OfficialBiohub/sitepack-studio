import { ArrowDown, ArrowUpRight, FileArchive, Globe2, SlidersHorizontal } from "lucide-react";
import type { CSSProperties } from "react";
import { PAPER_TEXTURE_URL, SiteChrome, SiteFooter } from "@/components/SiteChrome";

const steps = [
  {
    number: "01",
    icon: Globe2,
    title: "Provide a public URL.",
    copy: "Start with a page that is publicly reachable. You confirm that you have permission to archive its visible frontend files before SitePack begins.",
  },
  {
    number: "02",
    icon: SlidersHorizontal,
    title: "Choose the shape of the pack.",
    copy: "Keep the original folder structure, rename assets, include linked same-origin pages, or retain public source maps when you need them.",
  },
  {
    number: "03",
    icon: FileArchive,
    title: "Download the local record.",
    copy: "SitePack retrieves reachable frontend files, rewrites local references, and returns a ZIP prepared for offline inspection.",
  },
];

export default function HowItWorks() {
  return (
    <main className="site-shell info-page" style={{ "--paper-image": `url(${PAPER_TEXTURE_URL})` } as CSSProperties}>
      <SiteChrome />
      <section className="page-intro page-intro-yellow">
        <div className="index-mark page-index-mark">02</div>
        <div>
          <p className="eyebrow"><span className="eyebrow-dot" /> THE ARCHIVE WORKFLOW</p>
          <h1>Three steps.<br /><em>One local copy.</em></h1>
        </div>
        <p className="page-intro-copy">A clear path from a permitted public address to a portable set of frontend files — without asking you to use a command line.</p>
      </section>

      <section className="process-section">
        <div className="process-rail" aria-hidden="true"><span>BEGIN</span><ArrowDown size={16} /><span>ZIP</span></div>
        <div className="process-steps">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <article className="process-step" key={step.number}>
                <div className="step-topline"><span>{step.number}</span><Icon size={22} /></div>
                <h2>{step.title}</h2>
                <p>{step.copy}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="page-note-section">
        <p className="section-kicker">A USEFUL BOUNDARY</p>
        <div className="page-note-grid">
          <h2>Public files are not<br /><em>the whole website.</em></h2>
          <p>A public address can reveal the browser-facing part of a page. It cannot provide private backend code, databases, API secrets, accounts, paywalled material, or protected content. The resulting ZIP keeps that distinction visible.</p>
        </div>
        <a href="/#pack" className="page-action">Start a permitted archive <ArrowUpRight size={17} /></a>
      </section>
      <SiteFooter />
    </main>
  );
}
