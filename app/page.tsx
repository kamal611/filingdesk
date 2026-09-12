import ArticleCard from "@/components/ArticleCard";
import { getAllArticles } from "@/lib/content";
import { siteConfig } from "@/lib/site-config";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const articles = getAllArticles();
  const lead = articles[0];
  const rest = articles.slice(1, 13);

  return (
    <div>
      {lead && (
        <section className="mb-8 border-b border-line pb-8">
          <div className="text-xs font-semibold uppercase tracking-wide text-accent">
            {siteConfig.categories.find((c) => c.slug === lead.category)?.label}
          </div>
          <h1 className="mt-2 font-serif text-4xl font-bold leading-tight text-ink">
            <Link href={`/article/${lead.slug}`} className="hover:underline">
              {lead.title}
            </Link>
          </h1>
          <p className="mt-3 max-w-3xl text-lg text-muted">{lead.dek}</p>
        </section>
      )}

      {articles.length === 0 && (
        <div className="rounded border border-line bg-white p-8 text-center text-muted">
          <p className="font-serif text-xl font-semibold text-ink">No articles published yet</p>
          <p className="mt-2 text-sm">
            The content pipeline hasn&apos;t run yet. Once the daily ingestion job runs, original
            articles generated from SEC filings will appear here automatically.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-x-10 md:grid-cols-2">
        {rest.map((a) => (
          <ArticleCard key={a.slug} article={a} />
        ))}
      </div>
    </div>
  );
}
