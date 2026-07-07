import { memoryStore } from "@/lib/store/memory-store";
import { credibleSources } from "@/lib/ingestion/source-catalog";

export default function AdminPage() {
  const articles = memoryStore.listArticles();

  return (
    <main className="safe-shell min-h-screen bg-paper px-4 py-6">
      <section className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-moss">Admin</p>
            <h1 className="mt-3 text-4xl font-semibold text-ink">Ingestion console</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <form action="/api/admin/ingest" method="post">
              <input type="hidden" name="mode" value="live" />
              <button className="rounded-full bg-moss px-5 py-3 font-semibold text-white">Run live ingest</button>
            </form>
            <form action="/api/admin/ingest" method="post">
              <input type="hidden" name="mode" value="gdelt" />
              <button className="rounded-full bg-ink px-5 py-3 font-semibold text-white">GDELT only</button>
            </form>
            <form action="/api/admin/ingest" method="post">
              <input type="hidden" name="mode" value="mock" />
              <button className="rounded-full bg-white px-5 py-3 font-semibold text-ink shadow-panel">Mock</button>
            </form>
          </div>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-3xl bg-white p-5 shadow-panel">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-moss">Approved sources</p>
            <p className="mt-2 text-3xl font-semibold">{credibleSources.length}</p>
          </div>
          <div className="rounded-3xl bg-white p-5 shadow-panel">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-moss">Public feeds</p>
            <p className="mt-2 text-3xl font-semibold">{credibleSources.reduce((sum, source) => sum + source.feedUrls.length, 0)}</p>
          </div>
          <div className="rounded-3xl bg-white p-5 shadow-panel">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-moss">Policy</p>
            <p className="mt-2 text-sm leading-6 text-ink/70">Metadata, summaries, and source links only. No full article body storage.</p>
          </div>
        </div>
        <div className="mt-8 overflow-hidden rounded-3xl bg-white shadow-panel">
          {articles.map((article) => (
            <div key={article.id} className="border-b border-ink/10 p-5 last:border-b-0">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-semibold text-ink">{article.content.title}</h2>
                <span className="rounded-full bg-fog px-3 py-1 text-xs font-semibold text-moss">{article.metadata.processingStatus}</span>
              </div>
              <p className="mt-2 text-sm text-ink/62">{article.ranking.duplicateClusterId}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
