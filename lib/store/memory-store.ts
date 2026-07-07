import { defaultConsents, demoUser, seedArticles, seedPreferences } from "@/lib/store/seed";
import type { Article, ConsentSettings, FeedCard, InteractionType, PreferenceNode } from "@/lib/types";
import fs from "node:fs";
import path from "node:path";

type InteractionEvent = {
  id: string;
  userId: string;
  articleId: string;
  type: InteractionType;
  weight: number;
  createdAt: string;
};

type CommentEvent = {
  id: string;
  userId: string;
  articleId: string;
  text: string;
  createdAt: string;
};

type Draft = {
  id: string;
  userId: string;
  articleId: string;
  draft: string;
  rationale: string;
  status: "draft" | "approved" | "rejected" | "posted";
  createdAt: string;
};

type StoreState = {
  user: typeof demoUser;
  consents: ConsentSettings;
  articles: Article[];
  preferences: PreferenceNode[];
  interactions: InteractionEvent[];
  comments: CommentEvent[];
  drafts: Draft[];
  feedQueue: FeedCard[];
};

const storePath = path.join(process.cwd(), ".data", "smuke-local-store.json");

const defaultState: StoreState = {
  user: demoUser,
  consents: defaultConsents,
  articles: [...seedArticles],
  preferences: [...seedPreferences],
  interactions: [] as InteractionEvent[],
  comments: [] as CommentEvent[],
  drafts: [] as Draft[],
  feedQueue: [] as FeedCard[]
};

let state = loadState();

function loadState(): StoreState {
  try {
    if (!fs.existsSync(storePath)) return structuredClone(defaultState);
    const parsed = JSON.parse(fs.readFileSync(storePath, "utf8")) as StoreState;
    return {
      ...structuredClone(defaultState),
      ...parsed,
      articles: parsed.articles?.length ? parsed.articles : [...seedArticles],
      preferences: parsed.preferences?.length ? parsed.preferences : [...seedPreferences]
    };
  } catch {
    return structuredClone(defaultState);
  }
}

function persistState() {
  fs.mkdirSync(path.dirname(storePath), { recursive: true });
  fs.writeFileSync(storePath, JSON.stringify(state, null, 2));
}

function refreshState() {
  state = loadState();
}

export const memoryStore = {
  getUser() {
    refreshState();
    return state.user;
  },
  getConsents() {
    refreshState();
    return state.consents;
  },
  updateConsents(next: Partial<ConsentSettings>) {
    refreshState();
    state.consents = { ...state.consents, ...next };
    persistState();
    return state.consents;
  },
  listArticles() {
    refreshState();
    return state.articles;
  },
  hasArticleUrl(url: string) {
    refreshState();
    return state.articles.some((article) => article.source.canonicalUrl === url || article.source.sourceUrl === url);
  },
  upsertArticle(article: Article) {
    refreshState();
    const existing = state.articles.findIndex((item) => item.id === article.id || item.source.canonicalUrl === article.source.canonicalUrl);
    if (existing >= 0) state.articles[existing] = article;
    else state.articles.unshift(article);
    persistState();
    return article;
  },
  getArticle(id: string) {
    refreshState();
    return state.articles.find((article) => article.id === id);
  },
  setFeedQueue(cards: FeedCard[]) {
    refreshState();
    state.feedQueue = cards;
    persistState();
    return state.feedQueue;
  },
  getFeedQueue() {
    refreshState();
    return state.feedQueue;
  },
  addInteraction(event: Omit<InteractionEvent, "id" | "createdAt">) {
    refreshState();
    const row = { ...event, id: `interaction_${state.interactions.length + 1}`, createdAt: new Date().toISOString() };
    state.interactions.push(row);
    persistState();
    return row;
  },
  listPreferences() {
    refreshState();
    return state.preferences;
  },
  upsertPreference(node: PreferenceNode) {
    refreshState();
    const existing = state.preferences.findIndex((item) => item.id === node.id);
    if (existing >= 0) state.preferences[existing] = node;
    else state.preferences.push(node);
    persistState();
    return node;
  },
  deletePreference(id: string) {
    refreshState();
    state.preferences = state.preferences.filter((node) => node.id !== id);
    persistState();
  },
  clearPreferences() {
    refreshState();
    state.preferences = [];
    persistState();
  },
  addComment(event: Omit<CommentEvent, "id" | "createdAt">) {
    refreshState();
    const row = { ...event, id: `comment_${state.comments.length + 1}`, createdAt: new Date().toISOString() };
    state.comments.push(row);
    persistState();
    return row;
  },
  addDraft(event: Omit<Draft, "id" | "createdAt" | "status">) {
    refreshState();
    const row = { ...event, id: `draft_${state.drafts.length + 1}`, status: "draft" as const, createdAt: new Date().toISOString() };
    state.drafts.unshift(row);
    persistState();
    return row;
  },
  listDrafts() {
    refreshState();
    return state.drafts;
  },
  exportUserData() {
    refreshState();
    return {
      user: state.user,
      consents: state.consents,
      preferences: state.preferences,
      interactions: state.interactions,
      comments: state.comments,
      drafts: state.drafts
    };
  }
};
