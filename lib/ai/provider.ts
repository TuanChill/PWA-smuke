import type { Article } from "@/lib/types";
import type {
  ArticleClassification,
  ArticleSummary,
  CommentaryDraft,
  CompressedIntent,
  Embedding,
  EntityExtraction,
  ImportanceScore,
  SentimentExtraction,
  TopicExtraction
} from "@/lib/ai/schemas";

export type ArticleInput = {
  title: string;
  sourceName: string;
  url: string;
  excerpt?: string;
  publishedAt?: string;
};

export type CommentaryInput = {
  article: Article;
  userComment?: string;
  writingStyle?: string;
};

export interface AiProvider {
  summariseArticle(input: ArticleInput): Promise<ArticleSummary>;
  classifyArticle(input: ArticleInput): Promise<ArticleClassification>;
  extractEntities(input: ArticleInput): Promise<EntityExtraction>;
  extractTopics(input: ArticleInput): Promise<TopicExtraction>;
  generateCompressedIntent(input: ArticleInput): Promise<CompressedIntent>;
  scoreImportance(input: ArticleInput): Promise<ImportanceScore>;
  createArticleEmbedding(input: ArticleInput): Promise<Embedding>;
  detectDuplicateArticle(input: ArticleInput): Promise<{ duplicate: boolean; clusterId: string }>;
  transcribeVoiceComment(input: { audioUrl: string }): Promise<{ transcript: string }>;
  extractUserSentiment(input: { text: string; article?: Article }): Promise<SentimentExtraction>;
  extractUserIntent(input: { text: string; article?: Article }): Promise<{ intent: string; confidence: number }>;
  generateCommentaryDraft(input: CommentaryInput): Promise<CommentaryDraft>;
  updateUserWritingStyleProfile(input: { approvedDraft: string; currentStyle?: string }): Promise<{ writingStyle: string }>;
}
