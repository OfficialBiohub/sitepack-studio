import { ArrowUpRight, MessageCircle, Send, Sparkles } from "lucide-react";
import { EXTERNAL_LINKS, SitePage } from "@/components/SiteChrome";

export default function CreatorContact() {
  return (
    <SitePage>
      <section className="subpage-hero contact-hero">
        <div className="index-mark page-mark">03</div>
        <div>
          <p className="section-kicker">OPEN LINE / 003</p>
          <h1 className="subpage-title">Creator<br /><em>contact.</em></h1>
        </div>
        <p className="subpage-intro">Have a question, an idea for the tool, or need a direct line to the person behind SitePack Studio? Choose the channel that fits.</p>
      </section>

      <section className="contact-section">
        <div className="contact-intro"><p className="section-kicker">SAY HELLO</p><h2>Small tools grow<br />through <em>clear notes.</em></h2><p>Use the official channels below for project feedback, questions about the workflow, or messages for the SitePack Studio creator.</p></div>
        <div className="contact-cards">
          <a className="contact-card contact-card-yellow" href={EXTERNAL_LINKS.telegram} target="_blank" rel="noreferrer"><span className="contact-card-icon"><Send size={25} /></span><span className="contact-card-label">TELEGRAM</span><h3>@SitepackStudiobot</h3><p>Message the SitePack Studio bot directly.</p><span className="contact-card-link">Open Telegram <ArrowUpRight size={17} /></span></a>
          <a className="contact-card contact-card-paper" href={EXTERNAL_LINKS.facebook} target="_blank" rel="noreferrer"><span className="contact-card-icon"><MessageCircle size={25} /></span><span className="contact-card-label">FACEBOOK</span><h3>SitePack Studio</h3><p>Follow updates and send a message through the official page.</p><span className="contact-card-link">Open Facebook <ArrowUpRight size={17} /></span></a>
        </div>
      </section>

      <section className="contact-note"><Sparkles size={19} /><p><strong>Helpful detail:</strong> include the public page address and a short description of what happened when you write. It makes a useful reply easier.</p></section>
    </SitePage>
  );
}
