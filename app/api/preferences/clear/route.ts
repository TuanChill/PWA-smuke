import { NextRequest, NextResponse } from "next/server";
import { memoryStore } from "@/lib/store/memory-store";

function getBackendUrl(): string {
  return (
    process.env.SMUKE_BACKEND_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8080/api/v1"
  );
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token =
    (authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null) ||
    req.cookies.get("smuke_token")?.value;

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

  memoryStore.clearPreferences();
  return NextResponse.json({ ok: true });
}
