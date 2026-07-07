import { refreshFeedQueue } from "../lib/ranking/ranker";

const cards = refreshFeedQueue();
console.log(`Mock worker refreshed ${cards.length} queued feed cards.`);
