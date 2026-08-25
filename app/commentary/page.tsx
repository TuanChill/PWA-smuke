import { AppNav } from "@/components/AppNav";
import { CommentaryClient } from "@/components/CommentaryClient";
import { memoryStore } from "@/lib/store/memory-store";

export const dynamic = "force-dynamic";

export default function CommentaryPage() {
  const drafts = memoryStore.listDrafts();

  return (
    <main className="safe-shell min-h-screen bg-paper px-4 pb-28 pt-6">
      <section className="mx-auto max-w-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-moss">Smuke Studio</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink">Social Post Drafts</h1>
          </div>
          <span className="rounded-full bg-fog px-3 py-1 text-xs font-semibold text-ink/70">
            {drafts.length} {drafts.length === 1 ? "draft" : "drafts"}
          </span>
        </div>

        <p className="mt-2 text-xs text-ink/70">
          Source-grounded thought leadership posts drafted with your personal perspective and AI synthesis.
        </p>

        <CommentaryClient initialDrafts={drafts} />
      </section>

      <AppNav />
    </main>
  );
}
