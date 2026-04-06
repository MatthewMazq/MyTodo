import { Article } from "./types.js";

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export function groupBySource(articles: Article[]): Map<string, Article[]> {
  const groups = new Map<string, Article[]>();

  for (const article of articles) {
    const existing = groups.get(article.source) || [];
    existing.push(article);
    groups.set(article.source, existing);
  }

  return groups;
}

export function formatMarkdown(articles: Article[], date: Date): string {
  const sourceGroups = groupBySource(articles);
  const sources = ["TechCrunch", "The Verge", "Hacker News"];
  const dateStr = date.toISOString().split("T")[0];

  let output = `# AI新闻日报 - ${dateStr}\n\n`;
  output += `共收录 **${articles.length}** 篇文章，来自 **${sourceGroups.size}** 个源\n\n`;
  output += `---\n\n`;

  for (const sourceName of sources) {
    const sourceArticles = sourceGroups.get(sourceName) || [];

    output += `## ${sourceName} (${sourceArticles.length}篇)\n`;

    if (sourceArticles.length === 0) {
      output += `暂无新文章\n`;
    } else {
      for (const article of sourceArticles) {
        const pubDateStr = formatDate(article.pubDate);
        output += `1. [${article.title}](${article.link}) - ${pubDateStr}\n`;
        if (article.description) {
          output += `   摘要：${article.description}\n`;
        }
        output += `\n`;
      }
    }

    output += `\n`;
  }

  return output;
}
