// ---------------------------------------------------------------------------
// SITE BRANDING — the only file you need to touch to rebrand the whole site.
// Swap the name, tagline, and colors here; drop a new logo at /public/logo.svg
// ---------------------------------------------------------------------------
export const siteConfig = {
  name: "Filing Desk",
  shortName: "Filing Desk",
  tagline: "Corporate Filings & Insider Activity, Direct From the Source",
  description:
    "Filing Desk covers insider trading disclosures, SEC filings, and material corporate events as they are reported to regulators — original reporting built directly from primary-source filings.",
  domain: "example.com", // replace with the real domain once registered
  twitterHandle: "@filingdesk",
  categories: [
    { slug: "insider-trading", label: "Insider Trading" },
    { slug: "corporate-filings", label: "Corporate Filings" },
    { slug: "earnings", label: "Earnings & Guidance" },
  ],
  publisherLegalName: "Filing Desk Media",
};

export type Category = (typeof siteConfig.categories)[number]["slug"];
