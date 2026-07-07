import { fetchGdeltSource } from "@/lib/ingestion/gdelt-source";
import { processRawItem } from "@/lib/ingestion/normalise";
import { fetchRssSource } from "@/lib/ingestion/rss-source";
import { credibleSources, filterAllowedRawItems } from "@/lib/ingestion/source-catalog";
import { memoryStore } from "@/lib/store/memory-store";

export type IngestMode = "mock" | "rss" | "gdelt" | "live";

export async function ingestCredibleSources(mode: IngestMode) {
  const rawItems =
    mode === "gdelt"
      ? await safeFetchGdelt()
      : mode === "rss"
        ? await fetchApprovedRss()
        : mode === "live"
          ? [...(await safeFetchGdelt()), ...(await fetchApprovedRss())]
          : [];

  const unique = capPerSource(dedupeRawItems(filterStrategicItems(filterAllowedRawItems(rawItems))), 14);
  const articles = await Promise.all(unique.slice(0, 60).map(processRawItem));
  articles.forEach((article) => memoryStore.upsertArticle(article));

  return {
    rawCount: rawItems.length,
    acceptedCount: unique.length,
    storedCount: articles.length,
    articles
  };
}

async function safeFetchGdelt() {
  try {
    return await fetchGdeltSource(40);
  } catch {
    return [];
  }
}

async function fetchApprovedRss() {
  const jobs = credibleSources.flatMap((source) =>
    source.feedUrls.map(async (feedUrl) => {
      try {
        return await fetchRssSource(feedUrl, source.name);
      } catch {
        return [];
      }
    })
  );

  return (await Promise.all(jobs)).flat();
}

function dedupeRawItems(items: Awaited<ReturnType<typeof fetchApprovedRss>>) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.url.toLowerCase();
    if (seen.has(key) || memoryStore.hasArticleUrl(item.url)) return false;
    seen.add(key);
    return true;
  });
}

const strategicTerms = [
  "ai",
  "artificial intelligence",
  "bank",
  "bitcoin",
  "bond",
  "business",
  "central bank",
  "chip",
  "cloud",
  "crypto",
  "currency",
  "deal",
  "economy",
  "earnings",
  "ethereum",
  "finance",
  "fintech",
  "funding",
  "inflation",
  "investment",
  "ipo",
  "market",
  "merger",
  "oil",
  "policy",
  "rate",
  "regulation",
  "semiconductor",
  "shares",
  "stablecoin",
  "startup",
  "stock",
  "tariff",
  "tech",
  "trade",
  "venture"
];

function filterStrategicItems(items: Awaited<ReturnType<typeof fetchApprovedRss>>) {
  return items.filter((item) => {
    const text = `${item.title} ${item.excerpt ?? ""}`.toLowerCase();
    return strategicTerms.some((term) => text.includes(term));
  });
}

function capPerSource(items: Awaited<ReturnType<typeof fetchApprovedRss>>, cap: number) {
  const counts = new Map<string, number>();
  return items.filter((item) => {
    const count = counts.get(item.sourceName) ?? 0;
    if (count >= cap) return false;
    counts.set(item.sourceName, count + 1);
    return true;
  });
}
