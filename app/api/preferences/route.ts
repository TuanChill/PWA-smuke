import { NextRequest, NextResponse } from "next/server";
import { memoryStore } from "@/lib/store/memory-store";
import { getAuthenticatedBackendClient } from "@/lib/api/axios-client";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token =
    (authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null) ||
    req.cookies.get("smuke_token")?.value;

  if (token) {
    try {
      const backendClient = getAuthenticatedBackendClient(token);
      const res = await backendClient.get("/users/preferences");
      if (res.data?.success && Array.isArray(res.data?.data) && res.data.data.length > 0) {
        return NextResponse.json({ preferences: res.data.data });
      }
    } catch (err) {
      console.warn("Failed to fetch preferences from backend, falling back to local store:", err);
    }
  }

  return NextResponse.json({ preferences: memoryStore.listPreferences() });
}

export async function DELETE(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token =
    (authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null) ||
    request.cookies.get("smuke_token")?.value;

  if (token) {
    try {
      const backendClient = getAuthenticatedBackendClient(token);
      await backendClient.delete("/users/preferences");
    } catch (err) {
      console.warn("Failed to clear backend preferences:", err);
    }
  }

  try {
    const body = await request.json();
    if (body?.id) {
      memoryStore.deletePreference(body.id);
      return NextResponse.json({ ok: true });
    }
  } catch {}

  memoryStore.clearPreferences();
  return NextResponse.json({ ok: true });
}
