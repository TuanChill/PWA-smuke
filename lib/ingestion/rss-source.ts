import type { RawNewsItem } from "@/lib/ingestion/normalise";

function tagValue(item: string, tag: string) {
  const match = item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/s, "$1").trim();
}

export async function fetchRssSource(feedUrl: string, sourceName: string): Promise<RawNewsItem[]> {
  const response = await fetch(feedUrl);
  if (!response.ok) throw new Error(`RSS fetch failed with status ${response.status}`);
  const xml = await response.text();
  const items = xml.match(/<item[\s\S]*?<\/item>/gi) ?? [];

  return items.slice(0, 20).map((item, index) => ({
    id: tagValue(item, "guid") ?? `rss_${index}`,
    title: tagValue(item, "title") ?? "Untitled RSS item",
    url: tagValue(item, "link") ?? feedUrl,
    sourceName,
    sourceType: "rss",
    excerpt: tagValue(item, "description"),
    publishedAt: tagValue(item, "pubDate") ? new Date(tagValue(item, "pubDate") as string).toISOString() : undefined
  }));
}
