import { NextRequest, NextResponse } from "next/server";
import { memoryStore } from "@/lib/store/memory-store";
import { getAuthenticatedBackendClient } from "@/lib/api/axios-client";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token =
    (authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null) ||
    request.cookies.get("smuke_token")?.value;

  if (token) {
    try {
      const backendClient = getAuthenticatedBackendClient(token);
      const beRes = await backendClient.get("/social-accounts/list");

      if (beRes.data?.success && Array.isArray(beRes.data?.data)) {
        const normalized = beRes.data.data.map((item: any) => ({
          ...item,
          id: String(item.id || item._id),
          _id: String(item._id || item.id),
          userId: String(item.user?.id || item.user?._id || item.user || item.userId || "user_current"),
          platform: item.platform === "twitter" ? "x" : item.platform,
          username: item.username || item.handle || item.accountName || item.accountId || "operator",
          accountName: item.accountName || item.name || item.username,
          avatarUrl: item.avatarUrl || item.profileImageUrl || item.profile_photo_url || item.picture,
          profileUrl: item.profileUrl || item.profile_url,
          status: item.connectionStatus || item.status || (item.isConnected ? "active" : "disconnected"),
          isConnected: item.isConnected ?? true,
          connectionStatus: item.connectionStatus || item.status || "active",
          connectedAt: item.connectedAt || item.createdAt || new Date().toISOString(),
        }));
        return NextResponse.json({ success: true, data: normalized });
      }
    } catch (err) {
      console.warn("Failed to fetch social accounts from backend, falling back to local store:", err);
    }
  }

  // Fallback to memory store
  const localAccounts = memoryStore.listSocialAccounts();
  return NextResponse.json({ success: true, data: localAccounts });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const platform = searchParams.get("platform");

  if (!id && !platform) {
    return NextResponse.json({ error: "Missing account id or platform" }, { status: 400 });
  }

  const authHeader = request.headers.get("authorization");
  const token =
    (authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null) ||
    request.cookies.get("smuke_token")?.value;

  if (token && id) {
    try {
      const backendClient = getAuthenticatedBackendClient(token);
      await backendClient.delete(`/social-accounts/${id}`);
    } catch (err) {
      console.warn("Failed to delete social account from backend:", err);
    }
  }

  // Remove from local memory store
  if (id) memoryStore.deleteSocialAccount(id);
  if (platform) memoryStore.deleteSocialAccount(platform);

  return NextResponse.json({ success: true, message: "Disconnected successfully" });
}
