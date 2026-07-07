import { AppNav } from "@/components/AppNav";
import { FeedClient } from "@/components/FeedClient";
import { refreshFeedQueue } from "@/lib/ranking/ranker";
import { memoryStore } from "@/lib/store/memory-store";

export default function FeedPage() {
  const cards = memoryStore.getFeedQueue().length > 0 ? memoryStore.getFeedQueue() : refreshFeedQueue();

  return (
    <main className="min-h-screen bg-paper">
      <FeedClient initialCards={cards} />
      <AppNav />
    </main>
  );
}
