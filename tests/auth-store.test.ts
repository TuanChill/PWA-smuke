import { describe, expect, it, beforeEach, vi } from "vitest";
import { useAuthStore } from "../lib/store/use-auth-store";

describe("useAuthStore & Onboarding Dynamic Routing", () => {
  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.setState({
      token: null,
      user: null,
      onboarding: null,
      isLoading: false,
    });
  });

  it("sets session and logs out correctly", () => {
    const user = { id: "usr_123", email: "founder@smuke.app", name: "Alex" };
    useAuthStore.getState().setSession("test_jwt_token", user);

    expect(useAuthStore.getState().token).toBe("test_jwt_token");
    expect(useAuthStore.getState().user?.email).toBe("founder@smuke.app");

    useAuthStore.getState().logout();
    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
  });

  describe("handleOnboardingCta (3-way smart routing)", () => {
    it("Branch 1: redirects unauthenticated user to /login", async () => {
      const mockRouter = { push: vi.fn() };

      useAuthStore.setState({
        token: null,
        user: null,
      });

      await useAuthStore.getState().handleOnboardingCta(mockRouter);

      expect(mockRouter.push).toHaveBeenCalledTimes(1);
      expect(mockRouter.push).toHaveBeenCalledWith("/login");
    });

    it("Branch 2: redirects authenticated user with INCOMPLETE onboarding to /onboarding", async () => {
      const mockRouter = { push: vi.fn() };

      useAuthStore.setState({
        token: "jwt_token_valid",
        user: { id: "usr_1", email: "user@example.com" },
        onboarding: {
          selectedTopics: [],
          objectives: [],
          consents: {},
          completed: false,
        },
      });

      await useAuthStore.getState().handleOnboardingCta(mockRouter);

      expect(mockRouter.push).toHaveBeenCalledTimes(1);
      expect(mockRouter.push).toHaveBeenCalledWith("/onboarding");
    });

    it("Branch 3: redirects authenticated user with COMPLETED onboarding straight to /feed", async () => {
      const mockRouter = { push: vi.fn() };

      useAuthStore.setState({
        token: "jwt_token_valid",
        user: { id: "usr_1", email: "user@example.com" },
        onboarding: {
          selectedTopics: ["AI", "Crypto"],
          objectives: ["Market Monitoring"],
          role: "founder",
          consents: {},
          completed: true,
        },
      });

      await useAuthStore.getState().handleOnboardingCta(mockRouter);

      expect(mockRouter.push).toHaveBeenCalledTimes(1);
      expect(mockRouter.push).toHaveBeenCalledWith("/feed");
    });
  });
});
