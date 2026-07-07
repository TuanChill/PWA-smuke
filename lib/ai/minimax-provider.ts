import {
  articleClassificationSchema,
  articleSummarySchema,
  commentaryDraftSchema,
  compressedIntentSchema,
  embeddingSchema,
  entityExtractionSchema,
  importanceScoreSchema,
  sentimentExtractionSchema,
  topicExtractionSchema
} from "@/lib/ai/schemas";
import type { AiProvider, ArticleInput, CommentaryInput } from "@/lib/ai/provider";

type MiniMaxMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type MiniMaxConfig = {
  apiKey: string;
  baseUrl: string;
  model: string;
};

function extractText(payload: unknown): string {
  if (typeof payload !== "object" || payload === null) return "";
  const record = payload as Record<string, unknown>;
  const choices = record.choices;
  if (Array.isArray(choices) && choices.length > 0) {
    const first = choices[0] as Record<string, unknown>;
    const message = first.message as Record<string, unknown> | undefined;
    if (typeof message?.content === "string") return message.content;
    if (typeof first.text === "string") return first.text;
  }
  if (typeof record.reply === "string") return record.reply;
  if (typeof record.output === "string") return record.output;
  return "";
}

function parseJson<T>(text: string, fallback: T): T {
  const trimmed = text.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start < 0 || end < start) return fallback;
  try {
    return JSON.parse(trimmed.slice(start, end + 1)) as T;
  } catch {
    return fallback;
  }
}

export class MiniMaxProvider implements AiProvider {
  constructor(private readonly config: MiniMaxConfig) {}

  private async completeJson<T>(messages: MiniMaxMessage[], fallback: T): Promise<T> {
    const response = await fetch(this.config.baseUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: this.config.model,
        stream: false,
        messages,
        temperature: 0.2
      })
    });

    if (!response.ok) {
      throw new Error(`MiniMax request failed with status ${response.status}`);
    }

    const payload = await response.json();
    return parseJson(extractText(payload), fallback);
  }

  async summariseArticle(input: ArticleInput) {
    const data = await this.completeJson(
      prompt(input, "Return JSON {\"summary\":\"one to two sentence Smuke summary answering what happened, why it matters, who is affected, and why relevant\"}."),
      { summary: "" }
    );
    return articleSummarySchema.parse(data);
  }

  async classifyArticle(input: ArticleInput) {
    const data = await this.completeJson(
      prompt(input, "Return JSON with primaryCategory, secondaryCategories, audienceTags, professionalRelevanceTags."),
      { primaryCategory: "business", secondaryCategories: [], audienceTags: [], professionalRelevanceTags: [] }
    );
    return articleClassificationSchema.parse(data);
  }

  async extractEntities(input: ArticleInput) {
    const data = await this.completeJson(prompt(input, "Return JSON with entities, regions, sectors arrays."), {
      entities: [],
      regions: [],
      sectors: []
    });
    return entityExtractionSchema.parse(data);
  }

  async extractTopics(input: ArticleInput) {
    const data = await this.completeJson(prompt(input, "Return JSON with topics array."), { topics: [] });
    return topicExtractionSchema.parse(data);
  }

  async generateCompressedIntent(input: ArticleInput) {
    const data = await this.completeJson(prompt(input, "Return JSON {\"compressedIntent\":\"semantic core meaning\"}."), {
      compressedIntent: ""
    });
    return compressedIntentSchema.parse(data);
  }

  async scoreImportance(input: ArticleInput) {
    const data = await this.completeJson(prompt(input, "Return JSON {\"importanceScore\":0.0 to 1.0}."), {
      importanceScore: 0.5
    });
    return importanceScoreSchema.parse(data);
  }

  async createArticleEmbedding(input: ArticleInput) {
    const seed = input.title + input.url;
    const embedding = Array.from({ length: 16 }, (_, index) => Number((((seed.charCodeAt(index % seed.length) || 13) % 97) / 96).toFixed(4)));
    return embeddingSchema.parse({ embedding });
  }

  async detectDuplicateArticle(input: ArticleInput) {
    return {
      duplicate: false,
      clusterId: `cluster_${input.title.toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 28)}`
    };
  }

  async transcribeVoiceComment() {
    return { transcript: "Voice transcription requires a MiniMax speech endpoint configuration." };
  }

  async extractUserSentiment(input: { text: string }) {
    const data = await this.completeJson(
      [
        systemMessage(),
        {
          role: "user",
          content:
            "Analyze this user comment for Smuke personalization. Return JSON with topics, entities, regions, stance, sentiment, intent, professionalAngle, confidence, writingStyleSignals, sensitiveProfileFlag, sensitiveLabels. Comment: " +
            input.text
        }
      ],
      {
        topics: [],
        entities: [],
        regions: [],
        stance: "neutral",
        sentiment: "neutral",
        intent: "preference signal",
        professionalAngle: "general relevance",
        confidence: 0.5,
        writingStyleSignals: [],
        sensitiveProfileFlag: false,
        sensitiveLabels: []
      }
    );
    return sentimentExtractionSchema.parse(data);
  }

  async extractUserIntent(input: { text: string }) {
    const data = await this.completeJson([{ role: "user", content: `Return JSON {"intent":"...","confidence":0.0} for this text: ${input.text}` }], {
      intent: "preference signal",
      confidence: 0.5
    });
    return { intent: String((data as { intent?: unknown }).intent ?? "preference signal"), confidence: Number((data as { confidence?: unknown }).confidence ?? 0.5) };
  }

  async generateCommentaryDraft(input: CommentaryInput) {
    const data = await this.completeJson(
      [
        systemMessage(),
        {
          role: "user",
          content: `Generate concise source-grounded commentary. Return JSON with draft and rationale. Article: ${input.article.content.title}. Summary: ${input.article.content.summary}. User comment: ${input.userComment ?? "none"}. Style: ${input.writingStyle ?? "sharp, analytical, commercially aware"}.`
        }
      ],
      { draft: "", rationale: "" }
    );
    return commentaryDraftSchema.parse(data);
  }

  async updateUserWritingStyleProfile(input: { approvedDraft: string; currentStyle?: string }) {
    return {
      writingStyle: `${input.currentStyle ?? "concise and analytical"}; approved sample emphasizes ${input.approvedDraft.slice(0, 80)}`
    };
  }
}

function systemMessage(): MiniMaxMessage {
  return {
    role: "system",
    content:
      "You are Smuke.app's structured news intelligence processor. Return valid compact JSON only. Do not fabricate facts. Do not store or infer sensitive labels unless explicitly requested and consented."
  };
}

function prompt(input: ArticleInput, instruction: string): MiniMaxMessage[] {
  return [
    systemMessage(),
    {
      role: "user",
      content: `${instruction}\nTitle: ${input.title}\nSource: ${input.sourceName}\nURL: ${input.url}\nExcerpt: ${input.excerpt ?? ""}\nPublished: ${input.publishedAt ?? ""}`
    }
  ];
}
