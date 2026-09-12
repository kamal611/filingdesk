import { siteConfig } from "@/lib/site-config";

export const metadata = { title: "Editorial Standards & Sources" };

export default function EditorialStandardsPage() {
  return (
    <div className="prose-article max-w-3xl">
      <h1 className="font-serif text-3xl font-bold text-ink">Editorial Standards &amp; Sources</h1>

      <h2 className="mt-8 font-serif text-xl font-bold text-ink">Where our facts come from</h2>
      <p className="text-muted">
        Every article published on {siteConfig.name} is generated from a primary-source document:
        a Form 4 insider-transaction filing, a Form 8-K material-event filing, an earnings press
        release, or another document filed with the SEC and made public through its EDGAR system.
        We do not rewrite or summarize articles from other news organizations.
      </p>

      <h2 className="mt-8 font-serif text-xl font-bold text-ink">How articles are produced</h2>
      <p className="text-muted">
        Our reporting pipeline monitors new SEC filings as they are made public, extracts the
        factual details (parties involved, transaction amounts, dates, and filing type), and
        produces a short news article stating those facts. Articles are structured and, in part,
        automated; every article links the specific filing or release it is based on so readers
        can verify it independently.
      </p>

      <h2 className="mt-8 font-serif text-xl font-bold text-ink">Corrections</h2>
      <p className="text-muted">
        If you believe an article contains an error, please <a className="text-accent hover:underline" href="/contact">contact us</a> with
        the article link and a description of the issue, and we will review and correct it
        promptly.
      </p>

      <h2 className="mt-8 font-serif text-xl font-bold text-ink">Not investment advice</h2>
      <p className="text-muted">
        Content on {siteConfig.name} is for informational purposes only and describes public
        disclosures; it is not a recommendation to buy or sell any security.
      </p>
    </div>
  );
}
