import { ArrowUpRight, MessageCircle, ShieldCheck } from "lucide-react";
import type { CSSProperties } from "react";
import { PAPER_TEXTURE_URL, SiteChrome, SiteFooter } from "@/components/SiteChrome";

const contacts = [
  { label: "Facebook", detail: "SitePack Studio", href: "https://www.facebook.com/SitepackStudio", icon: MessageCircle },
  { label: "Telegram", detail: "@SitepackStudiobot", href: "https://t.me/SitepackStudiobot", icon: MessageCircle },
];

export default function CreatorContact() {
  return (
    <main className="site-shell info-page" style={{ "--paper-image": `url(${PAPER_TEXTURE_URL})` } as CSSProperties}>
      <SiteChrome />
      <section className="page-intro page-intro-clay">
        <div className="index-mark page-index-mark">04</div>
        <div>
          <p className="eyebrow"><span className="eyebrow-dot" /> CREATOR CONTACT</p>
          <h1>Start a<br /><em>conversation.</em></h1>
        </div>
        <p className="page-intro-copy">Use the official creator channels for questions, feedback, and notes about SitePack Studio.</p>
      </section>

      <section className="contact-section">
        <div className="contact-heading"><p className="section-kicker">OFFICIAL CHANNELS</p><h2>Send a note.<br /><em>Keep it direct.</em></h2></div>
        <div className="contact-grid">
          {contacts.map((contact) => {
            const Icon = contact.icon;
            return (
              <a className="contact-card" href={contact.href} target="_blank" rel="noreferrer" key={contact.label}>
                <span className="contact-icon"><Icon size={22} /></span>
                <div><span className="contact-label">{contact.label}</span><strong>{contact.detail}</strong></div>
                <ArrowUpRight size={19} />
              </a>
            );
          })}
        </div>
      </section>

      <section className="contact-note-section">
        <ShieldCheck size={25} />
        <div><p className="section-kicker">A QUICK REMINDER</p><p>SitePack is for pages you are entitled to archive. The creator can help with the tool, but cannot grant permission for another person’s website or protected material.</p></div>
        <a href="/#pack" className="page-action">Back to the packer <ArrowUpRight size={17} /></a>
      </section>
      <SiteFooter />
    </main>
  );
}
