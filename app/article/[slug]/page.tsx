import { getArticleBySlug, getAllArticles, getRelatedArticles } from "@/lib/content";
import { siteConfig } from "@/lib/site-config";
import ArticleCard from "@/components/ArticleCard";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const article = getArticleBySlug(params.slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.dek,
    openGraph: {
      title: article.title,
      description: article.dek,
      type: "article",
      publishedTime: article.publishedAt,
    },
  };
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = getArticleBySlug(params.slug);
  if (!article) return notFound();
  const related = getRelatedArticles(article);
  const categoryLabel =
    siteConfig.categories.find((c) => c.slug === article.category)?.label ?? article.category;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.dek,
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    author: [{ "@type": "Organization", name: siteConfig.name }],
    publisher: {
      "@type": "Organization",
      name: siteConfig.publisherLegalName,
      logo: { "@type": "ImageObject", url: `https://${siteConfig.domain}/logo.svg` },
    },
    mainEntityOfPage: `https://${siteConfig.domain}/article/${article.slug}`,
  };

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="text-xs font-semibold uppercase tracking-wide text-accent">
        {categoryLabel}
        {article.ticker && <span className="text-muted"> · {article.ticker}</span>}
      </div>
      <h1 className="mt-2 font-serif text-4xl font-bold leading-tight text-ink">
        {article.title}
      </h1>
      <p className="mt-3 text-lg text-muted">{article.dek}</p>
      <p className="mt-4 border-y border-line py-2 text-sm text-muted">
        {article.byline} ·{" "}
        {new Date(article.publishedAt).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
      </p>

      <div className="prose-article mt-6 max-w-3xl">
        {article.body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <div className="mt-6 max-w-3xl rounded border border-line bg-white p-4 text-sm text-muted">
        <span className="font-semibold text-ink">Source: </span>
        <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
          {article.sourceLabel}
        </a>
      </div>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="border-b border-line pb-2 font-serif text-xl font-bold text-ink">
            More in {categoryLabel}
          </h2>
          {related.map((a) => (
            <ArticleCard key={a.slug} article={a} dense />
          ))}
        </section>
      )}
    </article>
  );
}
