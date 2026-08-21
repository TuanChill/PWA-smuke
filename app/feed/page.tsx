import { AppNav } from "@/components/AppNav";
import { FeedClient } from "@/components/FeedClient";
import { fetchFeedCards, fetchFeedTopics } from "@/lib/feed/feed-api";

export const revalidate = 30;

export default async function FeedPage() {
  const [{ cards }, topics] = await Promise.all([
    fetchFeedCards({ page: 1, limit: 15, sort: "for-you" }),
    fetchFeedTopics(),
  ]);

  return (
    <main className="h-[100dvh] overflow-hidden bg-paper">
      <FeedClient initialCards={cards} initialTopics={topics} />
      <AppNav />
    </main>
  );
}
