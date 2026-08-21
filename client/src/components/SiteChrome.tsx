import { ArrowDownToLine, ArrowUpRight, Menu, X } from "lucide-react";
import { type CSSProperties, type ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";

export const EXTERNAL_LINKS = {
  facebook: "https://www.facebook.com/SitepackStudio",
  telegram: "https://t.me/SitepackStudiobot",
};

const ASSET_URLS = {
  mark: "https://github.com/OfficialBiohub/sitepack-studio/releases/download/sitepack-original-design-assets/sitepack-mark_1c0eaa50.png",
  paper: "https://github.com/OfficialBiohub/sitepack-studio/releases/download/sitepack-original-design-assets/sitepack-paper-texture_3b110ccb.jpg",
};

const navigationItems = [
  { href: "/", label: "Home" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/archive-history", label: "Archive & history" },
  { href: "/creator-contact", label: "Creator contact" },
];

const shellStyle = { "--paper-image": `url(${ASSET_URLS.paper})` } as CSSProperties;

function isCurrentRoute(currentPath: string, href: string) {
  return href === "/" ? currentPath === "/" : currentPath.startsWith(href);
}

export function BrandMark() {
  return (
    <Link href="/" className="brand-lockup" aria-label="SitePack Studio home">
      <span className="brand-mark-frame"><img src={ASSET_URLS.mark} alt="" /></span>
      <span className="brand-wordmark">sitepack<span>studio</span></span>
    </Link>
  );
}

export function SiteHeader() {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  return (
    <header className="topbar">
      <BrandMark />
      <nav className="site-navigation" aria-label="Primary navigation">
        <div className="site-nav-links">
          {navigationItems.map((item) => {
            const active = isCurrentRoute(location, item.href);
            return <Link key={item.href} href={item.href} className={`site-nav-link ${active ? "is-active" : ""}`} aria-current={active ? "page" : undefined}>{item.label}</Link>;
          })}
        </div>
        <button className="menu-button" type="button" aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={menuOpen} aria-controls="site-mobile-menu" onClick={() => setMenuOpen((open) => !open)}>
          {menuOpen ? <X size={19} /> : <Menu size={19} />}
          <span>Menu</span>
        </button>
        {menuOpen ? (
          <div className="mobile-nav-panel" id="site-mobile-menu">
            <p>Navigate</p>
            {navigationItems.map((item) => {
              const active = isCurrentRoute(location, item.href);
              return <Link key={item.href} href={item.href} className={`mobile-nav-link ${active ? "is-active" : ""}`} aria-current={active ? "page" : undefined}>{item.label}</Link>;
            })}
          </div>
        ) : null}
      </nav>
    </header>
  );
}

export function SiteFooter({ onInstall }: { onInstall?: () => void | Promise<void> }) {
  return (
    <footer className="footer">
      <div className="footer-brand"><BrandMark /><span className="footer-rule" /><span>Small tool. Clear output.</span></div>
      <div className="footer-links">
        <Link href="/how-it-works">How it works</Link>
        <Link href="/archive-history">Archive & history</Link>
        <Link href="/creator-contact">Creator contact</Link>
        {onInstall ? <button type="button" className="footer-install" onClick={() => { void onInstall(); }}>Install app <ArrowDownToLine size={13} /></button> : null}
        <a href={EXTERNAL_LINKS.facebook} target="_blank" rel="noreferrer">Facebook <ArrowUpRight size={13} /></a>
        <span>© 2026 SitePack Studio</span>
      </div>
    </footer>
  );
}

export function SitePage({ children, onInstall }: { children: ReactNode; onInstall?: () => void | Promise<void> }) {
  return (
    <main className="site-shell" style={shellStyle}>
      <SiteHeader />
      {children}
      <SiteFooter onInstall={onInstall} />
    </main>
  );
}
