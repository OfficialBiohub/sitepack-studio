import { ArrowDownToLine, ArrowUpRight, ChevronDown, Menu, X } from "lucide-react";
import { useState } from "react";
import { siteNavigation } from "@/lib/siteNavigation";

const BOT_URL = "https://t.me/SitepackStudiobot";
const MARK_URL = "https://github.com/OfficialBiohub/sitepack-studio/releases/download/sitepack-original-design-assets/sitepack-mark_1c0eaa50.png";

export const PAPER_TEXTURE_URL = "https://github.com/OfficialBiohub/sitepack-studio/releases/download/sitepack-original-design-assets/sitepack-paper-texture_3b110ccb.jpg";

export function BrandMark() {
  return (
    <a href="/" className="brand-lockup" aria-label="SitePack Studio home">
      <span className="brand-mark-frame"><img src={MARK_URL} alt="" /></span>
      <span className="brand-wordmark">sitepack<span>studio</span></span>
    </a>
  );
}

export function SiteChrome() {
  const location = window.location.pathname;
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [language, setLanguage] = useState("EN");

  return (
    <header className="topbar">
      <BrandMark />
      <div className="topbar-meta">
        <span className="edition-label">WEB UTILITY / 002</span>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {siteNavigation.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`desktop-nav-link ${location === item.href ? "is-active" : ""}`}
              aria-current={location === item.href ? "page" : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="language-wrap">
          <button className="language-button" onClick={() => setLanguageOpen((open) => !open)} aria-expanded={languageOpen} aria-haspopup="listbox">
            {language} <ChevronDown size={14} />
          </button>
          {languageOpen ? (
            <div className="language-menu" role="listbox">
              {["EN", "ES", "RU"].map((item) => (
                <button key={item} role="option" aria-selected={language === item} onClick={() => { setLanguage(item); setLanguageOpen(false); }}>
                  {item}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div className="site-menu-wrap">
          <button className="menu-button" aria-label="Open site menu" onClick={() => setNavigationOpen((open) => !open)} aria-expanded={navigationOpen} aria-haspopup="menu">
            {navigationOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          {navigationOpen ? (
            <div className="site-nav-menu" role="menu">
              <span className="creator-menu-label">SITE DIRECTORY</span>
              {siteNavigation.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  role="menuitem"
                  className={`site-nav-link ${location === item.href ? "is-active" : ""}`}
                  onClick={() => setNavigationOpen(false)}
                >
                  <span><small>{item.index}</small>{item.label}</span>
                  <ArrowUpRight size={14} />
                </a>
              ))}
              <div className="menu-contact-rule" />
              <a href="https://www.facebook.com/SitepackStudio" target="_blank" rel="noreferrer" role="menuitem" className="site-nav-external">
                Creator Facebook <ArrowUpRight size={13} />
              </a>
              <a href={BOT_URL} target="_blank" rel="noreferrer" role="menuitem" className="site-nav-external">
                @SitepackStudiobot <ArrowUpRight size={13} />
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter({ onInstall }: { onInstall?: () => void }) {
  return (
    <footer className="footer">
      <div className="footer-brand"><BrandMark /><span className="footer-rule" /><span>Small tool. Clear output.</span></div>
      <div className="footer-links">
        <a href="/#pack">Pack a page</a>
        <a href="/how-it-works">How it works</a>
        <a href="/archive-history">Archive & history</a>
        <a href="/creator-contact">Contact</a>
        {onInstall ? <button type="button" className="footer-install" onClick={onInstall}>Install app <ArrowDownToLine size={13} /></button> : null}
        <span>© 2026 SitePack Studio</span>
      </div>
    </footer>
  );
}
