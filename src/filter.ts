import { Article } from "./types.js";

export function filterLast24Hours(articles: Article[]): Article[] {
  const now = new Date();
  const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  return articles.filter((article) => article.pubDate >= cutoff);
}

export function sortByDateDesc(articles: Article[]): Article[] {
  return [...articles].sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
}

export function deduplicateByUrl(articles: Article[]): Article[] {
  const seen = new Set<string>();
  return articles.filter((article) => {
    const normalizedUrl = article.link.toLowerCase().trim();
    if (seen.has(normalizedUrl)) {
      return false;
    }
    seen.add(normalizedUrl);
    return true;
  });
}
