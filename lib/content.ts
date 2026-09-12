import fs from "fs";
import path from "path";

export type Article = {
  slug: string;
  title: string;
  dek: string; // subheadline
  category: string; // matches siteConfig.categories[].slug
  ticker?: string;
  companyName?: string;
  publishedAt: string; // ISO date
  byline: string;
  body: string[]; // paragraphs
  sourceLabel: string;
  sourceUrl: string;
  tags: string[];
};

const CONTENT_PATH = path.join(process.cwd(), "content", "articles.json");

export function getAllArticles(): Article[] {
  try {
    const raw = fs.readFileSync(CONTENT_PATH, "utf-8");
    const parsed = JSON.parse(raw) as Article[];
    return parsed.sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  } catch {
    return [];
  }
}

export function getArticleBySlug(slug: string): Article | undefined {
  return getAllArticles().find((a) => a.slug === slug);
}

export function getArticlesByCategory(category: string): Article[] {
  return getAllArticles().filter((a) => a.category === category);
}

export function getRelatedArticles(article: Article, limit = 4): Article[] {
  return getAllArticles()
    .filter((a) => a.slug !== article.slug && a.category === article.category)
    .slice(0, limit);
}
