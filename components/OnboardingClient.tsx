"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";

const TOPICS = [
  "AI Infrastructure",
  "LLMs & Agents",
  "Crypto & Stablecoins",
  "Capital Markets",
  "Startups & Venture",
  "Regulation & Policy",
  "Cybersecurity",
  "Semiconductors",
  "Macroeconomics",
  "Developer Tools",
];

const OBJECTIVES = [
  { id: "market_monitoring", label: "Market & Sector Monitoring", desc: "Track fast-moving trends and critical headlines" },
  { id: "deal_sourcing", label: "Deal & Investment Sourcing", desc: "Spot emerging startups, funding rounds, and partnerships" },
  { id: "competitive_intel", label: "Competitive Intelligence", desc: "Monitor competitors, product launches, and talent moves" },
  { id: "fundraising_intel", label: "Fundraising & Capital", desc: "Follow LP dynamics, valuation benchmarks, and capital flows" },
  { id: "thought_leadership", label: "Research & Synthesis", desc: "Deep-dive briefings and macro trend analysis" },
];

const ROLES = [
  "Founder / Executive",
  "Investor / VC",
  "Operator / Product Leader",
  "Engineer / Builder",
  "Researcher / Analyst",
];

export function OnboardingClient() {
  const { user, token, submitOnboarding, loginWithGoogle } = useAuth();
  const router = useRouter();

  const [selectedTopics, setSelectedTopics] = useState<string[]>([
    "AI Infrastructure",
    "Crypto & Stablecoins",
    "Startups & Venture",
  ]);
  const [selectedObjectives, setSelectedObjectives] = useState<string[]>([
    "Market & Sector Monitoring",
    "Deal & Investment Sourcing",
  ]);
  const [selectedRole, setSelectedRole] = useState<string>("Founder / Executive");
  const [company, setCompany] = useState<string>("");
  const [consents, setConsents] = useState<Record<string, boolean>>({
    consentPreferenceTracking: true,
    consentPersonalisedCommentary: true,
    consentSensitiveSentimentTracking: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const toggleObjective = (label: string) => {
    setSelectedObjectives((prev) =>
      prev.includes(label) ? prev.filter((o) => o !== label) : [...prev, label]
    );
  };

  const toggleConsent = (key: string) => {
    setConsents((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSubmit = async () => {
    if (selectedTopics.length === 0) {
      setErrorMessage("Please select at least one topic of interest.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const payload = {
      topics: selectedTopics,
      objectives: selectedObjectives,
      role: selectedRole,
      company: company.trim() || undefined,
      consents,
    };

    if (token) {
      const success = await submitOnboarding(payload);
      if (success) {
        router.push("/feed");
        return;
      }
    }

    // Fallback: save to localStorage for guest or offline mode and proceed
    try {
      localStorage.setItem("smuke_guest_onboarding", JSON.stringify(payload));
    } catch {}

    router.push("/feed");
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-16">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-moss">
          Personalized Intelligence Graph
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Tune your news radar
        </h1>
        <p className="mt-2 text-sm text-ink/70">
          {user?.name
            ? `Welcome ${user.name}! Select your focus areas to train your initial swipe deck.`
            : "Select your focus areas to train your initial AI swipe deck."}
        </p>
      </div>

      {!token && (
        <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-panel border border-moss/20">
          <div>
            <p className="text-sm font-semibold text-ink">Sign in with Google to sync across devices</p>
            <p className="text-xs text-ink/60">Preserve your preference memory and read anywhere.</p>
          </div>
          <button
            type="button"
            onClick={loginWithGoogle}
            className="rounded-full bg-moss px-4 py-2 text-xs font-semibold text-white hover:bg-moss/90 transition"
          >
            Google Sign In
          </button>
        </div>
      )}

      {/* 1. Topics of Interest */}
      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold text-ink">1. Core Topics & Signals</h2>
          <span className="text-xs text-ink/50">{selectedTopics.length} selected</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((topic) => {
            const isSelected = selectedTopics.includes(topic);
            return (
              <button
                key={topic}
                type="button"
                onClick={() => toggleTopic(topic)}
                className={`rounded-full px-4 py-2.5 text-xs font-semibold transition-all duration-150 ${
                  isSelected
                    ? "bg-moss text-white shadow-sm scale-[1.02]"
                    : "bg-white text-ink/80 hover:bg-fog shadow-panel border border-transparent"
                }`}
              >
                {isSelected && <span className="mr-1.5">✓</span>}
                {topic}
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Objectives */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-ink">2. Professional Objectives</h2>
        <div className="grid gap-2 sm:grid-cols-1">
          {OBJECTIVES.map((obj) => {
            const isSelected = selectedObjectives.includes(obj.label);
            return (
              <div
                key={obj.id}
                onClick={() => toggleObjective(obj.label)}
                className={`cursor-pointer rounded-2xl p-4 transition-all duration-150 ${
                  isSelected
                    ? "bg-white ring-2 ring-moss shadow-panel"
                    : "bg-white shadow-panel hover:bg-fog/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="mt-0.5 h-4 w-4 rounded accent-moss"
                  />
                  <div>
                    <p className="text-sm font-semibold text-ink">{obj.label}</p>
                    <p className="text-xs text-ink/60 mt-0.5">{obj.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Role & Company */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-ink">3. Your Role & Organization</h2>
        <div className="space-y-3 rounded-2xl bg-white p-5 shadow-panel">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-ink/60">Primary Role</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedRole(r)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                    selectedRole === r
                      ? "bg-moss text-white"
                      : "bg-paper text-ink/80 hover:bg-fog"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="pt-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-ink/60">Company / Project (Optional)</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Acme Ventures, DeepTech Labs"
              className="mt-1.5 w-full rounded-xl border border-ink/15 bg-paper px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/40 focus:border-moss focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* 4. Privacy & Consent */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-ink">4. Privacy & AI Controls</h2>
        <div className="space-y-2">
          <label className="flex items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-panel cursor-pointer">
            <div>
              <p className="text-sm font-medium text-ink">Preference Graph Learning</p>
              <p className="text-xs text-ink/60">Learn from swipe swipes and saves to improve relevance.</p>
            </div>
            <input
              type="checkbox"
              checked={consents.consentPreferenceTracking}
              onChange={() => toggleConsent("consentPreferenceTracking")}
              className="h-4 w-4 accent-moss"
            />
          </label>

          <label className="flex items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-panel cursor-pointer">
            <div>
              <p className="text-sm font-medium text-ink">AI Strategic Commentary</p>
              <p className="text-xs text-ink/60">Receive contextual AI reason tags and takeaways.</p>
            </div>
            <input
              type="checkbox"
              checked={consents.consentPersonalisedCommentary}
              onChange={() => toggleConsent("consentPersonalisedCommentary")}
              className="h-4 w-4 accent-moss"
            />
          </label>
        </div>
      </section>

      {errorMessage && (
        <p className="text-sm font-semibold text-rose-600 text-center">{errorMessage}</p>
      )}

      {/* Submit Button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full rounded-full bg-moss py-4 text-center text-sm font-bold text-white shadow-md hover:bg-moss/90 active:scale-[0.99] transition disabled:opacity-50"
      >
        {isSubmitting ? "Personalizing your feed..." : "Save & Launch Feed →"}
      </button>
    </div>
  );
}
