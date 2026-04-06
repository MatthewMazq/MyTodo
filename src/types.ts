export interface Article {
  title: string;
  link: string;
  pubDate: Date;
  source: string;
  description: string;
}

export interface RSSSource {
  name: string;
  url: string;
}

export const RSS_SOURCES: RSSSource[] = [
  {
    name: "TechCrunch",
    url: "https://techcrunch.com/category/artificial-intelligence/feed/",
  },
  {
    name: "The Verge",
    url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
  },
  {
    name: "Hacker News",
    url: "https://hnrss.org/newest?q=AI&count=30",
  },
];
