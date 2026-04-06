import { RSSSource } from "./types.js";

export async function fetchRSS(source: RSSSource): Promise<string> {
  const response = await fetch(source.url, {
    headers: {
      "User-Agent": "AI-News-Aggregator/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${source.name}: ${response.status}`);
  }

  return response.text();
}
