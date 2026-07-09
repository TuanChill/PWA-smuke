import { NextResponse } from "next/server";
import { demoAdCampaigns } from "@/lib/ads/catalog";
import { rankAds } from "@/lib/ranking/ad-ranker";
import { memoryStore } from "@/lib/store/memory-store";

export async function GET() {
  const consents = memoryStore.getConsents();
  const ads = rankAds(demoAdCampaigns, memoryStore.getMemorySnapshot(), consents.consentMarketingPersonalisation).slice(0, 5);
  return NextResponse.json({
    consentAds: consents.consentMarketingPersonalisation,
    ads
  });
}
