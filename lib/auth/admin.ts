import { NextResponse } from "next/server";

export function requireAdminToken(request: Request) {
  const expected = process.env.ADMIN_INGEST_TOKEN;
  if (!expected && process.env.NODE_ENV !== "production") return undefined;

  const supplied = request.headers.get("x-admin-token");
  if (expected && supplied === expected) return undefined;

  return NextResponse.json({ error: "Admin token required" }, { status: 401 });
}
