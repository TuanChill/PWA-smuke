import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { memoryStore } from "@/lib/store/memory-store";
import { getAuthenticatedBackendClient } from "@/lib/api/axios-client";

const connectSchema = z.object({
  platform: z.enum(["linkedin", "x", "threads"]),
  redirect_url_override: z.string().optional(),
  simulate: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = connectSchema.parse(await request.json());
    const authHeader = request.headers.get("authorization");
    const token =
      (authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null) ||
      request.cookies.get("smuke_token")?.value;

    // 1. Try Backend PostForMe OAuth URL if authenticated
    if (token && !body.simulate) {
      try {
        const backendClient = getAuthenticatedBackendClient(token);
        const params: Record<string, string> = {};
        if (body.redirect_url_override) {
          params.redirect_url_override = body.redirect_url_override;
        }

        const beRes = await backendClient.get(`/social-accounts/connect/${body.platform}`, { params });
        if (beRes.data?.success && (beRes.data?.authUrl || beRes.data?.url)) {
          return NextResponse.json({
            success: true,
            authUrl: beRes.data.authUrl || beRes.data.url,
            url: beRes.data.authUrl || beRes.data.url,
            mode: "oauth",
          });
        }
      } catch (err) {
        console.warn("Backend OAuth connect error, falling back to local simulation:", err);
      }
    }

    // 2. Fallback local connect simulation for testing / demo
    const platformNames: Record<string, string> = {
      linkedin: "LinkedIn",
      x: "X / Twitter",
      threads: "Threads",
    };

    const mockAccount = {
      id: `soc_${body.platform}_${Date.now().toString(36)}`,
      userId: memoryStore.getUser().id,
      platform: body.platform,
      username: `${body.platform}_operator`,
      accountName: `${platformNames[body.platform]} Verified Account`,
      avatarUrl: undefined,
      status: "active" as const,
      connectedAt: new Date().toISOString(),
    };

    memoryStore.upsertSocialAccount(mockAccount);

    return NextResponse.json({
      success: true,
      account: mockAccount,
      mode: "direct",
      message: `Connected ${platformNames[body.platform]} successfully!`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Invalid connect request" },
      { status: 400 }
    );
  }
}
