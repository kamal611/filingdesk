import Link from "next/link";
import type { Article } from "@/lib/content";
import { siteConfig } from "@/lib/site-config";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ArticleCard({ article, dense }: { article: Article; dense?: boolean }) {
  const categoryLabel =
    siteConfig.categories.find((c) => c.slug === article.category)?.label ?? article.category;

  return (
    <article className={dense ? "border-b border-line py-4" : "border-b border-line py-6"}>
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-accent">
        <span>{categoryLabel}</span>
        {article.ticker && <span className="text-muted">· {article.ticker}</span>}
      </div>
      <h3 className={dense ? "mt-1 font-serif text-lg font-bold text-ink" : "mt-1 font-serif text-2xl font-bold text-ink"}>
        <Link href={`/article/${article.slug}`} className="hover:underline">
          {article.title}
        </Link>
      </h3>
      {!dense && <p className="mt-1 text-muted">{article.dek}</p>}
      <p className="mt-2 text-xs text-muted">
        {article.byline} · {formatDate(article.publishedAt)}
      </p>
    </article>
  );
}
