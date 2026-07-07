import Link from "next/link";
import { defaultConsents } from "@/lib/store/seed";

const topics = ["AI infrastructure", "stablecoins", "capital markets", "regulation", "startups"];
const objectives = ["market monitoring", "business development", "thought leadership", "fundraising intelligence"];

export default function OnboardingPage() {
  return (
    <main className="safe-shell min-h-screen bg-paper px-4 py-6">
      <section className="mx-auto max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-moss">Onboarding</p>
        <h1 className="mt-3 text-4xl font-semibold text-ink">Seed your intelligence graph</h1>
        <div className="mt-8 space-y-6">
          <Panel title="Topics">
            <div className="flex flex-wrap gap-2">
              {topics.map((topic) => (
                <button key={topic} className="rounded-full bg-white px-4 py-2 text-sm font-semibold shadow-panel">
                  {topic}
                </button>
              ))}
            </div>
          </Panel>
          <Panel title="Professional objectives">
            <div className="grid gap-2 sm:grid-cols-2">
              {objectives.map((objective) => (
                <label key={objective} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-panel">
                  <input type="checkbox" defaultChecked className="h-4 w-4 accent-moss" />
                  <span className="text-sm font-medium">{objective}</span>
                </label>
              ))}
            </div>
          </Panel>
          <Panel title="Consent settings">
            <div className="space-y-3">
              {Object.entries(defaultConsents).map(([key, value]) => (
                <label key={key} className="flex items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-panel">
                  <span className="text-sm font-medium">{key.replace(/([A-Z])/g, " $1")}</span>
                  <input type="checkbox" defaultChecked={value} className="h-4 w-4 accent-moss" />
                </label>
              ))}
            </div>
          </Panel>
          <Link href="/feed" className="block rounded-full bg-moss px-5 py-4 text-center font-semibold text-white">
            Continue to feed
          </Link>
        </div>
      </section>
    </main>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-ink">{title}</h2>
      {children}
    </section>
  );
}
