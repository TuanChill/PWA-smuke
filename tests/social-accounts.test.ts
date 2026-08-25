import { describe, expect, it, beforeEach } from "vitest";
import { memoryStore } from "@/lib/store/memory-store";
import { socialPlatformSchema, socialAccountSchema, type SocialAccount } from "@/lib/types";

describe("Social Accounts Integration (Option A)", () => {
  beforeEach(() => {
    // Clear all social accounts before each test
    memoryStore.clearSocialAccounts();
  });

  it("validates supported social platforms schema", () => {
    expect(socialPlatformSchema.safeParse("linkedin").success).toBe(true);
    expect(socialPlatformSchema.safeParse("x").success).toBe(true);
    expect(socialPlatformSchema.safeParse("threads").success).toBe(true);

    // Unsupported platforms fail
    expect(socialPlatformSchema.safeParse("facebook").success).toBe(false);
    expect(socialPlatformSchema.safeParse("instagram").success).toBe(false);
  });

  it("validates SocialAccount data structure", () => {
    const validAccount: SocialAccount = {
      id: "soc_linkedin_1",
      userId: "user_demo",
      platform: "linkedin",
      username: "tuan_operator",
      accountName: "Tuan Nguyen",
      avatarUrl: "https://example.com/avatar.jpg",
      status: "active",
      connectedAt: new Date().toISOString()
    };

    const parsed = socialAccountSchema.safeParse(validAccount);
    expect(parsed.success).toBe(true);
  });

  it("stores and lists social accounts in memoryStore", () => {
    expect(memoryStore.listSocialAccounts()).toHaveLength(0);

    const account: SocialAccount = {
      id: "soc_x_1",
      userId: "user_demo",
      platform: "x",
      username: "tuanchill",
      accountName: "Tuan Chill",
      status: "active",
      connectedAt: new Date().toISOString()
    };

    memoryStore.upsertSocialAccount(account);
    const accounts = memoryStore.listSocialAccounts();
    expect(accounts).toHaveLength(1);
    expect(accounts[0].platform).toBe("x");
    expect(accounts[0].username).toBe("tuanchill");
  });

  it("retrieves active account by platform", () => {
    const linkedinAcc: SocialAccount = {
      id: "soc_linkedin_2",
      userId: "user_demo",
      platform: "linkedin",
      username: "tuan_pro",
      status: "active",
      connectedAt: new Date().toISOString()
    };
    memoryStore.upsertSocialAccount(linkedinAcc);

    const found = memoryStore.getSocialAccountByPlatform("linkedin");
    expect(found).toBeDefined();
    expect(found?.username).toBe("tuan_pro");

    const notFound = memoryStore.getSocialAccountByPlatform("threads");
    expect(notFound).toBeUndefined();
  });

  it("disconnects / deletes social account by id or platform", () => {
    const threadsAcc: SocialAccount = {
      id: "soc_threads_3",
      userId: "user_demo",
      platform: "threads",
      username: "tuan_threads",
      status: "active",
      connectedAt: new Date().toISOString()
    };
    memoryStore.upsertSocialAccount(threadsAcc);
    // Delete by id
    memoryStore.deleteSocialAccount(threadsAcc.id);
    expect(memoryStore.listSocialAccounts()).toHaveLength(0);
  });

  it("supports multiple connected accounts on the same platform", () => {
    const personalLinkedIn: SocialAccount = {
      id: "soc_linkedin_personal",
      userId: "user_demo",
      platform: "linkedin",
      username: "tuanchill_personal",
      accountName: "Tuan Nguyen (Personal)",
      status: "active",
      connectedAt: new Date().toISOString()
    };

    const companyLinkedIn: SocialAccount = {
      id: "soc_linkedin_company",
      userId: "user_demo",
      platform: "linkedin",
      username: "capylabs_page",
      accountName: "Capylabs Company Page",
      status: "active",
      connectedAt: new Date().toISOString()
    };

    memoryStore.upsertSocialAccount(personalLinkedIn);
    memoryStore.upsertSocialAccount(companyLinkedIn);

    const accounts = memoryStore.listSocialAccounts();
    expect(accounts).toHaveLength(2);

    const linkedInAccounts = memoryStore.getSocialAccountsByPlatform("linkedin");
    expect(linkedInAccounts).toHaveLength(2);
    expect(linkedInAccounts.map((a) => a.username)).toEqual(["tuanchill_personal", "capylabs_page"]);

    // Disconnect one account by ID leaves the other intact
    memoryStore.deleteSocialAccount("soc_linkedin_personal");
    expect(memoryStore.listSocialAccounts()).toHaveLength(1);
    expect(memoryStore.listSocialAccounts()[0].id).toBe("soc_linkedin_company");
  });
});
