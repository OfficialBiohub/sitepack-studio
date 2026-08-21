import { ArrowUpRight, ClipboardList, FileText, FolderArchive, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { SitePage } from "@/components/SiteChrome";

const archiveNotes = [
  { label: "Public source list", copy: "A source index records captured public URLs, local paths, file types, and sizes for the current package.", icon: ClipboardList },
  { label: "Offline package", copy: "Visible frontend references are rewritten for local use where possible, then delivered together as a ZIP.", icon: FolderArchive },
  { label: "Clear limits", copy: "The archive records what a public page exposed; it cannot supply private systems or content behind access controls.", icon: ShieldCheck },
];

export default function ArchiveHistory() {
  return (
    <SitePage>
      <section className="subpage-hero archive-hero">
        <div className="index-mark page-mark">02</div>
        <div>
          <p className="section-kicker">THE ARCHIVE DESK / 002</p>
          <h1 className="subpage-title">Archive &<br /><em>history.</em></h1>
        </div>
        <p className="subpage-intro">Understand what arrives in each package, what remains outside its reach, and how to retain an accountable record of your own archive work.</p>
      </section>

      <section className="archive-ledger-section">
        <div className="ledger-intro"><p className="section-kicker">WHAT THE PACKAGE REMEMBERS</p><h2>One zip.<br /><em>A clear trail.</em></h2><p>Each completed package includes a source index, making it easier to see the public resources collected for that archive. Keep the ZIP and its index together when you need a durable record.</p></div>
        <div className="archive-ledger">
          <div className="ledger-topline"><span>ARCHIVE NOTES</span><span>PUBLIC FRONTEND ONLY</span></div>
          {archiveNotes.map(({ label, copy, icon: Icon }, index) => <article className="ledger-entry" key={label}><span>{String(index + 1).padStart(2, "0")}</span><Icon size={22} /><div><h3>{label}</h3><p>{copy}</p></div></article>)}
          <div className="ledger-footnote"><FileText size={17} /><span>SitePack does not keep a public archive catalogue or claim ownership of the material you package. Store and use each archive responsibly.</span></div>
        </div>
      </section>

      <section className="history-callout"><div><p className="section-kicker">KEEP YOUR OWN LOG</p><h2>A simple habit for<br /><em>responsible archiving.</em></h2></div><div><p>For work that needs traceability, note the source URL, date, purpose, permission basis, and the archive file name beside your downloaded package. Your own record stays with your project rather than becoming a public list.</p><Link href="/#pack" className="outline-action">Make an archive <ArrowUpRight size={17} /></Link></div></section>
    </SitePage>
  );
}
