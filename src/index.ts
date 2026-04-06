import { RSS_SOURCES, Article } from "./types.js";
import { fetchRSS } from "./fetcher.js";
import { parseRSS } from "./parser.js";
import { filterLast24Hours, sortByDateDesc, deduplicateByUrl, randomSample } from "./filter.js";
import { formatMarkdown } from "./formatter.js";
import { saveReport } from "./output.js";
import { translateToChinese } from "./translator.js";

const CONCURRENCY_LIMIT = 5;
const HN_SAMPLE_COUNT = 10;

async function translateDescriptions(articles: Article[]): Promise<Article[]> {
  console.log("\n翻译摘要中...");
  const translated: Article[] = [];

  for (let i = 0; i < articles.length; i += CONCURRENCY_LIMIT) {
    const batch = articles.slice(i, i + CONCURRENCY_LIMIT);
    const batchPromises = batch.map(async (article) => {
      const translatedDesc = await translateToChinese(article.description);
      return { ...article, description: translatedDesc };
    });
    const results = await Promise.all(batchPromises);
    translated.push(...results);
    console.log(`  翻译进度: ${Math.min(i + CONCURRENCY_LIMIT, articles.length)}/${articles.length}`);
  }

  console.log("翻译完成");
  return translated;
}

async function main() {
  console.log("开始抓取AI新闻...\n");

  const allArticles: Article[] = [];

  // 并发抓取所有RSS源
  const fetchPromises = RSS_SOURCES.map(async (source) => {
    try {
      console.log(`抓取中: ${source.name}...`);
      const xml = await fetchRSS(source);
      const articles = parseRSS(xml, source);
      console.log(`  -> 获取到 ${articles.length} 篇`);
      return articles;
    } catch (error) {
      console.error(`  -> ${source.name} 抓取失败: ${error}`);
      return [];
    }
  });

  const results = await Promise.all(fetchPromises);

  for (const articles of results) {
    allArticles.push(...articles);
  }

  // 过滤24小时内的文章
  const recentArticles = filterLast24Hours(allArticles);
  console.log(`\n24小时内文章: ${recentArticles.length} 篇`);

  // 按时间倒序
  const sortedArticles = sortByDateDesc(recentArticles);

  // URL去重
  const uniqueArticles = deduplicateByUrl(sortedArticles);
  console.log(`去重后: ${uniqueArticles.length} 篇`);

  // Hacker News 随机采样10篇
  const hnArticles = uniqueArticles.filter((a) => a.source === "Hacker News");
  const otherArticles = uniqueArticles.filter((a) => a.source !== "Hacker News");
  const sampledHnArticles = randomSample(hnArticles, HN_SAMPLE_COUNT);
  const finalArticles = [...otherArticles, ...sampledHnArticles];
  console.log(`Hacker News 采样: ${hnArticles.length} -> ${sampledHnArticles.length} 篇`);

  // 翻译摘要
  const articlesWithChineseDesc = await translateDescriptions(finalArticles);

  // 生成Markdown
  const markdown = formatMarkdown(articlesWithChineseDesc, new Date());

  // 保存报告
  const outputPath = await saveReport(markdown, new Date());
  console.log(`\n日报已保存至: ${outputPath}`);
}

main().catch(console.error);
