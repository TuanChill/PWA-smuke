import { AppNav } from "@/components/AppNav";
import { memoryStore } from "@/lib/store/memory-store";

export default function PreferencesPage() {
  const preferences = memoryStore.listPreferences();

  return (
    <main className="safe-shell min-h-screen bg-paper px-4 pb-24 pt-6">
      <section className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-moss">Preference graph</p>
        <h1 className="mt-3 text-4xl font-semibold text-ink">Inferred signals</h1>
        <div className="mt-8 grid gap-3">
          {preferences.map((node) => (
            <article key={node.id} className="rounded-3xl bg-white p-5 shadow-panel">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-moss">{node.nodeType}</p>
                  <h2 className="mt-2 text-xl font-semibold text-ink">{node.label}</h2>
                </div>
                <span className="rounded-full bg-fog px-3 py-1 text-sm font-semibold text-moss">{node.score.toFixed(2)}</span>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-fog">
                <div className="h-full bg-moss" style={{ width: `${Math.min(100, Math.max(0, node.confidence * 100))}%` }} />
              </div>
            </article>
          ))}
        </div>
      </section>
      <AppNav />
    </main>
  );
}
