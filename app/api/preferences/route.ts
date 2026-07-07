import { NextResponse } from "next/server";
import { z } from "zod";
import { memoryStore } from "@/lib/store/memory-store";

const deleteSchema = z.object({
  id: z.string()
});

export async function GET() {
  return NextResponse.json({ preferences: memoryStore.listPreferences() });
}

export async function DELETE(request: Request) {
  const body = deleteSchema.parse(await request.json());
  memoryStore.deletePreference(body.id);
  return NextResponse.json({ ok: true });
}
