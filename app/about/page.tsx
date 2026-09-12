import { siteConfig } from "@/lib/site-config";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="prose-article max-w-3xl">
      <h1 className="font-serif text-3xl font-bold text-ink">About {siteConfig.name}</h1>
      <p className="mt-4 text-muted">
        {siteConfig.name} reports on insider trading disclosures, material corporate events, and
        earnings releases as they are filed with the U.S. Securities and Exchange Commission. Our
        coverage is built directly from primary-source regulatory filings and company press
        releases — not from summarizing other publications&apos; reporting.
      </p>
      <p className="mt-4 text-muted">
        Each article on {siteConfig.name} links back to the underlying SEC filing or company
        release it was built from, so readers can verify the facts at the source. We publish a
        focused set of stories each day on corporate insider activity and regulatory disclosures.
      </p>
      <p className="mt-4 text-muted">
        See our <a className="text-accent hover:underline" href="/editorial-standards">Editorial
        Standards &amp; Sources</a> page for details on how articles are produced and corrected.
      </p>
    </div>
  );
}
