import { ArrowUpRight, FileCode2, FileImage, FileText, ShieldAlert } from "lucide-react";
import type { CSSProperties } from "react";
import { SiteChrome, SiteFooter } from "@/components/SiteChrome";
import { PAPER_TEXTURE_URL } from "@/lib/siteAssets";

const recordItems = [
  { number: "01", icon: FileCode2, title: "Page structure", copy: "Captured public HTML and the local relationships needed to inspect it offline." },
  { number: "02", icon: FileText, title: "Visible rules", copy: "Reachable stylesheets, scripts, fonts, and manifest references discovered from the public page." },
  { number: "03", icon: FileImage, title: "Linked media", copy: "Public images and media that are reachable from the selected page, with a clear local path." },
];

export default function ArchiveHistory() {
  return (
    <main className="site-shell info-page" style={{ "--paper-image": `url(${PAPER_TEXTURE_URL})` } as CSSProperties}>
      <SiteChrome />
      <section className="page-intro page-intro-paper">
        <div className="index-mark page-index-mark">03</div>
        <div>
          <p className="eyebrow"><span className="eyebrow-dot" /> THE LOCAL RECORD</p>
          <h1>Archive the page.<br /><em>Keep its context.</em></h1>
        </div>
        <p className="page-intro-copy">A useful archive is more than a download. It is a readable record of which public files were gathered, where they were placed, and what stayed unavailable.</p>
      </section>

      <section className="archive-ledger-section">
        <div className="ledger-heading"><p className="section-kicker">INSIDE THE PACKAGE</p><h2>A page, filed<br /><em>with care.</em></h2></div>
        <div className="record-grid">
          {recordItems.map((item) => {
            const Icon = item.icon;
            return <article className="record-card" key={item.number}><span className="record-number">{item.number}</span><Icon size={25} /><h3>{item.title}</h3><p>{item.copy}</p></article>;
          })}
        </div>
      </section>

      <section className="archive-boundary-section">
        <div className="boundary-stamp"><ShieldAlert size={19} /> FRONTEND ONLY</div>
        <div><p className="section-kicker">WHAT HISTORY MEANS HERE</p><h2>A source index<br /><em>draws the line.</em></h2></div>
        <p>Each archive includes a source index that records captured public URLs, local paths, types, and sizes. When a reference cannot be retrieved, it stays out of the ZIP rather than pretending to be part of the record.</p>
        <a href="/#pack" className="page-action">Create a local record <ArrowUpRight size={17} /></a>
      </section>
      <SiteFooter />
    </main>
  );
}
