import { AppNav } from "@/components/AppNav";
import { memoryStore } from "@/lib/store/memory-store";

export default function CommentaryPage() {
  const drafts = memoryStore.listDrafts();

  return (
    <main className="safe-shell min-h-screen bg-paper px-4 pb-24 pt-6">
      <section className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-moss">Commentary</p>
        <h1 className="mt-3 text-4xl font-semibold text-ink">Drafts for approval</h1>
        <div className="mt-8 grid gap-3">
          {drafts.length === 0 ? (
            <article className="rounded-3xl bg-white p-6 shadow-panel">
              <h2 className="text-xl font-semibold">No drafts yet</h2>
              <p className="mt-2 leading-7 text-ink/70">Comment on a feed card or call the draft API to create a source-grounded thought-leadership draft.</p>
            </article>
          ) : (
            drafts.map((draft) => (
              <article key={draft.id} className="rounded-3xl bg-white p-6 shadow-panel">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-moss">{draft.status}</p>
                <p className="mt-3 leading-7 text-ink/78">{draft.draft}</p>
              </article>
            ))
          )}
        </div>
      </section>
      <AppNav />
    </main>
  );
}
