import { MiniMaxProvider } from "@/lib/ai/minimax-provider";
import { mockAiProvider } from "@/lib/ai/mock-provider";
import type { AiProvider } from "@/lib/ai/provider";

export function getAiProvider(): AiProvider {
  const provider = process.env.SMUKE_AI_PROVIDER ?? "mock";

  if (provider === "minimax") {
    const apiKey = process.env.MINIMAX_API_KEY;
    if (!apiKey) {
      throw new Error("MINIMAX_API_KEY is required when SMUKE_AI_PROVIDER=minimax");
    }

    return new MiniMaxProvider({
      apiKey,
      baseUrl: process.env.MINIMAX_BASE_URL ?? "https://api.minimax.io/v1/chat/completions",
      model: process.env.MINIMAX_MODEL ?? "MiniMax-M3"
    });
  }

  return mockAiProvider;
}
