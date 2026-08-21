export type SiteNavigationItem = {
  href: string;
  label: string;
  index: string;
  description: string;
};

export const siteNavigation: SiteNavigationItem[] = [
  { href: "/", label: "Home", index: "01", description: "Pack a public page" },
  { href: "/how-it-works", label: "How It Works", index: "02", description: "See the archive process" },
  { href: "/archive-history", label: "Archive & History", index: "03", description: "Understand the record" },
  { href: "/creator-contact", label: "Creator Contact", index: "04", description: "Reach the creator" },
];
