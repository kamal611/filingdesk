// ---------------------------------------------------------------------------
// SITE BRANDING — the only file you need to touch to rebrand the whole site.
// Swap the name, tagline, and colors here; drop a new logo at /public/logo.svg
// ---------------------------------------------------------------------------
export const siteConfig = {
  name: "Financier Post",
  shortName: "Financier Post",
  tagline: "SEC Filings · Earnings · Markets · Corporate News",
  description:
    "Financier Post covers insider trading disclosures, SEC filings, and material corporate events as they are reported to regulators — original reporting built directly from primary-source filings.",
  domain: "web-production-31444.up.railway.app", // update once a custom domain is connected
  twitterHandle: "@financierpost",
  categories: [
    { slug: "insider-trading", label: "Insider Trading" },
    { slug: "corporate-filings", label: "Corporate Filings" },
    { slug: "earnings", label: "Earnings & Guidance" },
  ],
  publisherLegalName: "Financier Post",
  defaultAuthor: "Max I.",
  googleAnalyticsId: "G-PM6GFR1GKY",
  googleSiteVerification: "q3c7dIxtWjgb8p4Nno2-2p1vwyi6gjPVJh0knkc--1U",
};

export type Category = (typeof siteConfig.categories)[number]["slug"];
