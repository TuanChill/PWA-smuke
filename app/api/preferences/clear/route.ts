import { NextResponse } from "next/server";
import { memoryStore } from "@/lib/store/memory-store";

export async function POST() {
  memoryStore.clearPreferences();
  return NextResponse.json({ ok: true });
}
