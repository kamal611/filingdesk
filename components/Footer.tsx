import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-ink text-paper">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div>
            <p className="font-serif text-lg font-bold">{siteConfig.name}</p>
            <p className="mt-2 text-sm text-paper/70">{siteConfig.description}</p>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-paper/60">
              Sections
            </p>
            <ul className="mt-2 space-y-1 text-sm">
              {siteConfig.categories.map((c) => (
                <li key={c.slug}>
                  <Link href={`/category/${c.slug}`} className="hover:underline">
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-paper/60">
              About Us
            </p>
            <ul className="mt-2 space-y-1 text-sm">
              <li>
                <Link href="/about" className="hover:underline">
                  About {siteConfig.name}
                </Link>
              </li>
              <li>
                <Link href="/editorial-standards" className="hover:underline">
                  Editorial Standards &amp; Sources
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:underline">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/rss.xml" className="hover:underline">
                  RSS Feed
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <p className="mt-8 border-t border-paper/10 pt-6 text-xs text-paper/50">
          © {new Date().getFullYear()} {siteConfig.publisherLegalName}. All article content is
          produced from primary-source public filings with the U.S. Securities and Exchange
          Commission and company press releases; each article links its underlying source. This
          is not investment advice.
        </p>
      </div>
    </footer>
  );
}
