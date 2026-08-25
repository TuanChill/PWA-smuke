import { NextRequest, NextResponse } from "next/server";
import { memoryStore } from "@/lib/store/memory-store";
import { getAuthenticatedBackendClient } from "@/lib/api/axios-client";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token =
    (authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null) ||
    req.cookies.get("smuke_token")?.value;

  if (token) {
    try {
      const backendClient = getAuthenticatedBackendClient(token);
      await backendClient.delete("/users/preferences");
    } catch (err) {
      console.warn("Failed to clear backend preferences:", err);
    }
  }

  memoryStore.clearPreferences();
  return NextResponse.json({ ok: true });
}
