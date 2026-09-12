import ArticleCard from "@/components/ArticleCard";
import { getArticlesByCategory } from "@/lib/content";
import { siteConfig } from "@/lib/site-config";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const cat = siteConfig.categories.find((c) => c.slug === params.slug);
  if (!cat) return {};
  return {
    title: cat.label,
    description: `Latest ${cat.label} coverage from ${siteConfig.name}, sourced directly from SEC filings.`,
  };
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const cat = siteConfig.categories.find((c) => c.slug === params.slug);
  if (!cat) return notFound();
  const articles = getArticlesByCategory(params.slug);

  return (
    <div>
      <h1 className="border-b border-line pb-4 font-serif text-3xl font-bold text-ink">
        {cat.label}
      </h1>
      {articles.length === 0 ? (
        <p className="mt-6 text-muted">No articles in this section yet.</p>
      ) : (
        <div className="mt-2">
          {articles.map((a) => (
            <ArticleCard key={a.slug} article={a} dense />
          ))}
        </div>
      )}
    </div>
  );
}
