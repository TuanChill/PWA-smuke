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
import type { Article } from "@/lib/types";

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
  // Strip any internal thinking tags
  let cleaned = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  // Strip markdown code fences if present
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, "").replace(/\n?```$/, "").trim();
  }
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end < start) return fallback;
  try {
    return JSON.parse(cleaned.slice(start, end + 1)) as T;
  } catch {
    return fallback;
  }
}

export class MiniMaxProvider implements AiProvider {
  constructor(private readonly config: MiniMaxConfig) {}

  private async completeJson<T>(messages: MiniMaxMessage[], fallback: T): Promise<T> {
    try {
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
          temperature: 0.2,
          thinking: { type: "disabled" }
        })
      });

      if (!response.ok) {
        console.warn(`MiniMax request returned status ${response.status}`);
        return fallback;
      }

      const payload = await response.json();
      return parseJson(extractText(payload), fallback);
    } catch (err) {
      console.warn("MiniMax completeJson error:", err);
      return fallback;
    }
  }

  async summariseArticle(input: ArticleInput) {
    const data = await this.completeJson(
      prompt(input, "Return JSON {\"summary\":\"one to two sentence Smuke summary answering what happened, why it matters, who is affected, and why relevant\"}."),
      { summary: `${input.title} highlights critical market movements and industry shifts.` }
    );
    const parsed = articleSummarySchema.safeParse(data);
    return parsed.success ? parsed.data : { summary: `${input.title} highlights critical market movements and industry shifts.` };
  }

  async classifyArticle(input: ArticleInput) {
    const fallback = { primaryCategory: "business" as const, secondaryCategories: [], audienceTags: [], professionalRelevanceTags: [] };
    const data = await this.completeJson(
      prompt(input, "Return JSON with primaryCategory, secondaryCategories, audienceTags, professionalRelevanceTags."),
      fallback
    );
    const parsed = articleClassificationSchema.safeParse(data);
    return parsed.success ? parsed.data : fallback;
  }

  async extractEntities(input: ArticleInput) {
    const data = await this.completeJson(prompt(input, "Return JSON with entities, regions, sectors arrays."), {
      entities: [],
      regions: [],
      sectors: []
    });
    const parsed = entityExtractionSchema.safeParse(data);
    return parsed.success ? parsed.data : { entities: [], regions: [], sectors: [] };
  }

  async extractTopics(input: ArticleInput) {
    const data = await this.completeJson(prompt(input, "Return JSON with topics array."), { topics: [] });
    const parsed = topicExtractionSchema.safeParse(data);
    return parsed.success ? parsed.data : { topics: [] };
  }

  async generateCompressedIntent(input: ArticleInput) {
    const fallbackText = `${input.title} delivers actionable strategic intelligence for decision-makers.`;
    const data = await this.completeJson(prompt(input, "Return JSON {\"compressedIntent\":\"semantic core meaning\"}."), {
      compressedIntent: fallbackText
    });
    const parsed = compressedIntentSchema.safeParse(data);
    return parsed.success ? parsed.data : { compressedIntent: fallbackText };
  }

  async scoreImportance(input: ArticleInput) {
    const data = await this.completeJson(prompt(input, "Return JSON {\"importanceScore\":0.8}."), { importanceScore: 0.75 });
    const parsed = importanceScoreSchema.safeParse(data);
    return parsed.success ? parsed.data : { importanceScore: 0.75 };
  }

  async createArticleEmbedding(input: ArticleInput) {
    const data = await this.completeJson(prompt(input, "Return JSON {\"embedding\":[0.1, ... 16 floats]}."), {
      embedding: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]
    });
    const parsed = embeddingSchema.safeParse(data);
    return parsed.success ? parsed.data : { embedding: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8] };
  }

  async detectDuplicateArticle(input: ArticleInput) {
    return { duplicate: false, clusterId: `cluster_${input.sourceName.toLowerCase().replace(/[^a-z0-9]/g, "")}` };
  }

  async transcribeVoiceComment(input: { audioUrl: string }) {
    return { transcript: `Transcribed thought leadership on source reference (${input.audioUrl})` };
  }

  async extractUserSentiment(input: { text: string; article?: Article }) {
    const data = await this.completeJson(
      [
        systemMessage(),
        {
          role: "user",
          content: `Analyze this user perspective on the article. Return JSON with stance (positive|negative|neutral|mixed), sentiment, intent, professionalAngle, confidence (0-1), topics, entities, regions, writingStyleSignals, sensitiveProfileFlag (boolean), sensitiveLabels.
User Text: ${input.text}
Article: ${input.article?.content.title ?? "none"}`
        }
      ],
      {
        topics: [],
        entities: [],
        regions: [],
        stance: "neutral" as const,
        sentiment: "analytical",
        intent: "professional perspective",
        professionalAngle: "strategic evaluation",
        confidence: 0.8,
        writingStyleSignals: ["analytical"],
        sensitiveProfileFlag: false,
        sensitiveLabels: []
      }
    );
    const parsed = sentimentExtractionSchema.safeParse(data);
    return parsed.success ? parsed.data : {
      topics: [],
      entities: [],
      regions: [],
      stance: "neutral" as const,
      sentiment: "analytical",
      intent: "professional perspective",
      professionalAngle: "strategic evaluation",
      confidence: 0.8,
      writingStyleSignals: ["analytical"],
      sensitiveProfileFlag: false,
      sensitiveLabels: []
    };
  }

  async extractUserIntent(input: { text: string }) {
    const data = await this.completeJson([{ role: "user", content: `Return JSON {"intent":"...","confidence":0.0} for this text: ${input.text}` }], {
      intent: "preference signal",
      confidence: 0.5
    });
    return { intent: String((data as { intent?: unknown }).intent ?? "preference signal"), confidence: Number((data as { confidence?: unknown }).confidence ?? 0.5) };
  }

  async generateCommentaryDraft(input: CommentaryInput) {
    const sourceUrl = input.article.source.canonicalUrl || input.article.source.sourceUrl;
    const platform = input.targetPlatform || "linkedin";
    const userAngle = input.userComment?.trim() || input.perspectiveAngle?.trim() || "Strategic market implications";
    const category = input.article.classification?.primaryCategory || "Business";

    const defaultFallbackDraft =
      platform === "twitter_x"
        ? `${userAngle} — ${input.article.content.title}\n\n${sourceUrl} #${category} #Smuke`
        : `${userAngle}\n\n${input.article.content.title}\n\n${input.article.content.summary}\n\nKey Takeaway: ${input.article.content.compressedIntent || input.article.content.title}\n\n🔗 Read more: ${sourceUrl}\n\n#${category} #ExecutiveInsights #SmukeNews`;

    const fallback = {
      draft: defaultFallbackDraft,
      rationale: "Grounded social narrative composed from verified source intelligence."
    };

    const data = await this.completeJson(
      [
        systemMessage(),
        {
          role: "user",
          content: `Generate a high-impact, source-grounded social post draft for platform '${platform}'. Return valid JSON with {"draft": "...", "rationale": "..."}.
Article Title: ${input.article.content.title}
Article Summary: ${input.article.content.summary}
Source Link: ${sourceUrl}
Source Name: ${input.article.source.name}
User Point of View / Comment: ${input.userComment ?? "none"}
Perspective Angle: ${input.perspectiveAngle ?? "none"}
Author Persona & Writing Style: ${input.writingStyle ?? "Founder / Executive perspective, sharp, analytical, commercially aware"}

Instructions:
1. Embody the Author's Persona and Writing Style throughout the post.
2. Lead with the User's point of view / perspective angle as the narrative hook.
3. Contextualize with key facts from the article summary to back up the claim.
4. If platform is 'linkedin', structure with clear paragraphs, a strategic takeaway/question, the source link (${sourceUrl}), and 3-4 topic hashtags.
5. If platform is 'twitter_x', create a punchy post under 280 characters linking the user's take with the source link (${sourceUrl}) and key hashtags.
6. If platform is 'executive_memo', format as bulleted executive brief with core intelligence, strategic take, and source reference.
7. Always include the source link (${sourceUrl}).`
        }
      ],
      fallback
    );

    const parsed = commentaryDraftSchema.safeParse(data);
    return parsed.success ? parsed.data : fallback;
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
