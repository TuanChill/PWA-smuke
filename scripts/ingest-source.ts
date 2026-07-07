import { fetchMockSource } from "../lib/ingestion/mock-source";
import { processRawItem } from "../lib/ingestion/normalise";
import { refreshFeedQueue } from "../lib/ranking/ranker";
import { memoryStore } from "../lib/store/memory-store";

async function main() {
  const source = process.argv[2] ?? "mock";
  if (source !== "mock") {
    throw new Error("Only mock source is wired for the local script. Use the RSS adapter from route handlers or workers.");
  }

  const articles = await Promise.all(fetchMockSource().map(processRawItem));
  articles.forEach((article) => memoryStore.upsertArticle(article));
  refreshFeedQueue();
  console.log(`Ingested ${articles.length} mock articles.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
