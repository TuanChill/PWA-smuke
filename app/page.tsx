import Link from "next/link";
import { seedArticles } from "@/lib/store/seed";
import { LandingCta, LandingNavActions } from "@/components/LandingCta";

export default function HomePage() {
  const lead = seedArticles[0];

  return (
    <main className="min-h-screen bg-paper">
      <section className="safe-shell mx-auto flex min-h-screen max-w-6xl flex-col justify-between px-4 py-5 sm:px-6">
        <nav className="flex items-center justify-between text-sm">
          <Link href="/" className="font-semibold tracking-wide text-moss">
            Smuke.app
          </Link>
          <LandingNavActions />
        </nav>

        <div className="grid items-end gap-8 py-10 md:grid-cols-[1fr_0.8fr]">
          <div className="max-w-2xl">
            <p className="mb-4 inline-flex rounded-full bg-fog px-3 py-1 text-sm font-medium text-moss">
              Personal intelligence feed
            </p>
            <h1 className="text-5xl font-semibold leading-[1.02] text-ink sm:text-7xl">
              Smuke.app
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-ink/72">
              A mobile-first news intelligence PWA that ranks live stories against your topics, objectives, comments, and consented preference graph.
            </p>
            <LandingCta />
          </div>

          <div className="rounded-[2rem] border border-ink/10 bg-white p-4 shadow-card">
            <article className="rounded-[1.5rem] bg-ink p-5 text-white">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-white/55">
                <span>{lead.source.name}</span>
                <span>{lead.classification.primaryCategory}</span>
              </div>
              <h2 className="mt-8 text-3xl font-semibold leading-tight">{lead.content.title}</h2>
              <p className="mt-4 text-sm leading-6 text-white/72">{lead.content.summary}</p>
              <div className="mt-8 flex flex-wrap gap-2">
                {["AI infrastructure", "trusted source tier", "market signal"].map((tag) => (
                  <span key={tag} className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/75">
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
