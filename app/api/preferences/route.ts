import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { memoryStore } from "@/lib/store/memory-store";

function getBackendUrl(): string {
  return (
    process.env.SMUKE_BACKEND_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8080/api/v1"
  );
}

const deleteSchema = z.object({
  id: z.string(),
});

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token =
    (authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null) ||
    req.cookies.get("smuke_token")?.value;

  if (token) {
    try {
      const res = await fetch(`${getBackendUrl()}/users/preferences`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          return NextResponse.json({ preferences: json.data });
        }
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
      await fetch(`${getBackendUrl()}/users/preferences`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
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
  } catch {
    // If no body provided, clear all
  }

  memoryStore.clearPreferences();
  return NextResponse.json({ ok: true });
}
