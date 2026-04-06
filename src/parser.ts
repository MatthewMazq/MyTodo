import { XMLParser } from "fast-xml-parser";
import { Article, RSSSource } from "./types.js";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
});

function extractDescription(raw: unknown, maxLength: number = 100): string {
  if (!raw) return "";
  const text = String(raw).replace(/<[^>]+>/g, "").trim();
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function parseRSS(xml: string, source: RSSSource): Article[] {
  const parsed = parser.parse(xml);
  const articles: Article[] = [];

  // 处理 RSS 2.0 格式 (TechCrunch)
  if (parsed.rss?.channel?.item) {
    const items = Array.isArray(parsed.rss.channel.item)
      ? parsed.rss.channel.item
      : [parsed.rss.channel.item];

    for (const item of items) {
      const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();
      const description =
        item.description || item["content:encoded"] || "";

      articles.push({
        title: String(item.title || "无标题"),
        link: String(item.link || ""),
        pubDate,
        source: source.name,
        description: extractDescription(description),
      });
    }
  }

  // 处理 Atom 格式 (The Verge)
  if (parsed.feed?.entry) {
    const items = Array.isArray(parsed.feed.entry)
      ? parsed.feed.entry
      : [parsed.feed.entry];

    for (const item of items) {
      const pubDate = item.published ? new Date(item.published) : new Date();
      // Atom title: { "#text": "...", "@_type": "html" } 或直接字符串
      let title = "无标题";
      if (typeof item.title === "string") {
        title = item.title;
      } else if (item.title?.["#text"]) {
        title = item.title["#text"];
      } else if (item.title?.["_"]) {
        title = item.title["_"];
      }

      const linkObj = item.link;
      let link = "";
      if (typeof linkObj === "string") {
        link = linkObj;
      } else if (Array.isArray(linkObj)) {
        link = linkObj.find((l: any) => l["@_rel"] === "alternate")?.["@_href"]
          || linkObj[0]?.["@_href"] || "";
      } else if (linkObj?.["@_href"]) {
        link = linkObj["@_href"];
      }

      // Atom summary/content: { "#text": "...", "@_type": "html" }
      let description = "";
      if (typeof item.summary === "string") {
        description = item.summary;
      } else if (item.summary?.["#text"]) {
        description = item.summary["#text"];
      } else if (typeof item.content === "string") {
        description = item.content;
      } else if (item.content?.["#text"]) {
        description = item.content["#text"];
      }

      articles.push({
        title,
        link,
        pubDate,
        source: source.name,
        description: extractDescription(description),
      });
    }
  }

  return articles;
}
