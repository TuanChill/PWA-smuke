import { AppNav } from "@/components/AppNav";
import { memoryStore } from "@/lib/store/memory-store";

export default function PrivacyPage() {
  const consents = memoryStore.getConsents();

  return (
    <main className="safe-shell min-h-screen bg-paper px-4 pb-24 pt-6">
      <section className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-moss">Privacy centre</p>
        <h1 className="mt-3 text-4xl font-semibold text-ink">Consent and data controls</h1>
        <div className="mt-8 space-y-3">
          {Object.entries(consents).map(([key, value]) => (
            <label key={key} className="flex items-center justify-between gap-4 rounded-3xl bg-white p-5 shadow-panel">
              <span className="text-sm font-semibold text-ink">{key.replace(/([A-Z])/g, " $1")}</span>
              <input type="checkbox" defaultChecked={value} className="h-5 w-5 accent-moss" />
            </label>
          ))}
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <a className="rounded-2xl bg-ink px-5 py-4 text-center font-semibold text-white" href="/api/privacy/export">
            Export data
          </a>
          <button className="rounded-2xl bg-coral px-5 py-4 font-semibold text-white">Clear graph</button>
        </div>
      </section>
      <AppNav />
    </main>
  );
}
