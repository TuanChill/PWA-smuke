import type { RawNewsItem } from "@/lib/ingestion/normalise";

export function fetchMockSource(): RawNewsItem[] {
  const now = new Date().toISOString();
  return [
    {
      id: "raw_ai_agents_enterprise",
      title: "Enterprise teams start budgeting for AI agent operations",
      url: "https://example.com/enterprise-ai-agent-ops?utm_source=mock",
      sourceName: "Smuke Mock Wire",
      sourceType: "mock",
      excerpt: "Finance and operations teams are planning new controls for AI agent deployment and monitoring.",
      publishedAt: now
    },
    {
      id: "raw_markets_rate_cut",
      title: "Markets price a slower path for rate cuts after inflation surprise",
      url: "https://example.com/markets-rate-cuts",
      sourceName: "Smuke Mock Wire",
      sourceType: "mock",
      excerpt: "Investors are reassessing duration risk and growth exposure after a hotter inflation print.",
      publishedAt: now
    }
  ];
}
