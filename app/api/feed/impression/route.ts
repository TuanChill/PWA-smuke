import { NextResponse } from "next/server";
import { z } from "zod";

const impressionSchema = z.object({
  articleId: z.string(),
  visibleMs: z.number().int().nonnegative().optional()
});

export async function POST(request: Request) {
  const body = impressionSchema.parse(await request.json());
  return NextResponse.json({ ok: true, impression: body });
}
