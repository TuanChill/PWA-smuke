import { filterAllowedRawItems, sourceForUrl } from "@/lib/ingestion/source-catalog";
import type { RawNewsItem } from "@/lib/ingestion/normalise";

type GdeltArticle = {
  url?: string;
  title?: string;
  seendate?: string;
  domain?: string;
  sourcecountry?: string;
  language?: string;
};

type GdeltResponse = {
  articles?: GdeltArticle[];
};

const gdeltQueries = [
  "(business OR markets OR finance OR economy OR earnings OR central bank)",
  "(crypto OR bitcoin OR ethereum OR stablecoin OR blockchain)",
  "(AI OR semiconductors OR cloud OR startups OR technology)",
  "(geopolitics OR policy OR regulation OR trade)"
];

export async function fetchGdeltSource(maxRecords = 30): Promise<RawNewsItem[]> {
  const responses = await Promise.all(gdeltQueries.map((query) => fetchGdeltQuery(query, Math.ceil(maxRecords / gdeltQueries.length))));
  const merged = responses.flat();
  const seen = new Set<string>();
  const unique = merged.filter((item) => {
    const key = item.url.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return filterAllowedRawItems(unique).slice(0, maxRecords);
}

async function fetchGdeltQuery(query: string, maxRecords: number): Promise<RawNewsItem[]> {
  const url = new URL("https://api.gdeltproject.org/api/v2/doc/doc");
  url.searchParams.set("query", query);
  url.searchParams.set("mode", "artlist");
  url.searchParams.set("format", "json");
  url.searchParams.set("sort", "hybridrel");
  url.searchParams.set("maxrecords", String(maxRecords));

  const response = await fetch(url);
  if (!response.ok) throw new Error(`GDELT fetch failed with status ${response.status}`);
  const data = (await response.json()) as GdeltResponse;

  return (data.articles ?? [])
    .filter((article): article is Required<Pick<GdeltArticle, "url" | "title">> & GdeltArticle => Boolean(article.url && article.title))
    .map((article) => {
      const source = sourceForUrl(article.url);
      return {
        id: `gdelt_${Buffer.from(article.url).toString("base64url").slice(0, 18)}`,
        title: article.title,
        url: article.url,
        sourceName: source?.name ?? article.domain ?? "GDELT source",
        sourceType: "api",
        excerpt: `Discovered through GDELT from ${article.domain ?? "an approved source"}.`,
        publishedAt: article.seendate ? parseGdeltDate(article.seendate) : undefined
      };
    });
}

function parseGdeltDate(value: string) {
  const match = value.match(/^(\d{4})(\d{2})(\d{2})T?(\d{2})?(\d{2})?(\d{2})?/);
  if (!match) return undefined;
  const [, year, month, day, hour = "00", minute = "00", second = "00"] = match;
  return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`).toISOString();
}
