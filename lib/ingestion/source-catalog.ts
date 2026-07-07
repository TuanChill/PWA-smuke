import type { RawNewsItem } from "@/lib/ingestion/normalise";

export type SourceTier = "tier_1_global" | "tier_1_regional" | "tier_2_local_verified" | "tier_1_crypto";

export type CredibleSource = {
  id: string;
  name: string;
  homepage: string;
  domains: string[];
  regions: string[];
  categories: Array<"business" | "markets" | "crypto" | "technology" | "geopolitics" | "policy" | "world">;
  tier: SourceTier;
  feedUrls: string[];
  notes: string;
};

export const credibleSources: CredibleSource[] = [
  {
    id: "nyt",
    name: "The New York Times",
    homepage: "https://www.nytimes.com",
    domains: ["nytimes.com", "rss.nytimes.com"],
    regions: ["US", "Global"],
    categories: ["business", "markets", "technology", "world"],
    tier: "tier_1_global",
    feedUrls: [
      "https://rss.nytimes.com/services/xml/rss/nyt/Business.xml",
      "https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml"
    ],
    notes: "Public RSS metadata only; link back to original story."
  },
  {
    id: "guardian",
    name: "The Guardian",
    homepage: "https://www.theguardian.com",
    domains: ["theguardian.com"],
    regions: ["UK", "Global"],
    categories: ["business", "technology", "world", "geopolitics"],
    tier: "tier_1_global",
    feedUrls: [
      "https://www.theguardian.com/business/rss",
      "https://www.theguardian.com/technology/rss"
    ],
    notes: "Public RSS metadata only; link back to original story."
  },
  {
    id: "cnn",
    name: "CNN",
    homepage: "https://www.cnn.com",
    domains: ["cnn.com", "rss.cnn.com"],
    regions: ["US", "Global"],
    categories: ["world", "business", "geopolitics"],
    tier: "tier_1_global",
    feedUrls: ["http://rss.cnn.com/rss/money_news_international.rss"],
    notes: "Public RSS metadata only; business feed availability can vary by region."
  },
  {
    id: "cnbc",
    name: "CNBC",
    homepage: "https://www.cnbc.com",
    domains: ["cnbc.com"],
    regions: ["US", "Global"],
    categories: ["business", "markets", "technology"],
    tier: "tier_1_global",
    feedUrls: ["https://www.cnbc.com/id/100003114/device/rss/rss.html", "https://www.cnbc.com/id/10001147/device/rss/rss.html"],
    notes: "Public RSS metadata only; direct feeds are preferred over article scraping."
  },
  {
    id: "coindesk",
    name: "CoinDesk",
    homepage: "https://www.coindesk.com",
    domains: ["coindesk.com"],
    regions: ["Global"],
    categories: ["crypto", "markets"],
    tier: "tier_1_crypto",
    feedUrls: ["https://www.coindesk.com/arc/outboundfeeds/rss/"],
    notes: "Crypto market news RSS; metadata only."
  },
  {
    id: "cointelegraph",
    name: "Cointelegraph",
    homepage: "https://cointelegraph.com",
    domains: ["cointelegraph.com"],
    regions: ["Global"],
    categories: ["crypto", "markets", "technology"],
    tier: "tier_1_crypto",
    feedUrls: ["https://cointelegraph.com/rss"],
    notes: "Crypto news RSS; metadata only."
  },
  {
    id: "decrypt",
    name: "Decrypt",
    homepage: "https://decrypt.co",
    domains: ["decrypt.co"],
    regions: ["Global"],
    categories: ["crypto", "technology"],
    tier: "tier_1_crypto",
    feedUrls: ["https://decrypt.co/feed"],
    notes: "Crypto/Web3 news RSS; metadata only."
  },
  {
    id: "nikkei-asia",
    name: "Nikkei Asia",
    homepage: "https://asia.nikkei.com",
    domains: ["asia.nikkei.com"],
    regions: ["Asia"],
    categories: ["business", "markets", "geopolitics", "technology"],
    tier: "tier_1_regional",
    feedUrls: ["https://asia.nikkei.com/rss/feed/nar"],
    notes: "Regional Asia business source; metadata only."
  }
];

export const allowedSourceDomains = new Set(credibleSources.flatMap((source) => source.domains));

export function isAllowedSourceUrl(url: string) {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    return [...allowedSourceDomains].some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
  } catch {
    return false;
  }
}

export function sourceForUrl(url: string) {
  const hostname = new URL(url).hostname.replace(/^www\./, "");
  return credibleSources.find((source) => source.domains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`)));
}

export function filterAllowedRawItems(items: RawNewsItem[]) {
  return items.filter((item) => isAllowedSourceUrl(item.url));
}
