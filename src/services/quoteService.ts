import { initialQuotes } from "../data/mockData";
import { requestService } from "./requestService";
import { useAppStore } from "../stores/appStore";
import type { Quote, QuoteStatus } from "../types";
import { APP_STORAGE_KEY } from "../constants/storageKeys";

export type UpdateQuoteInput = Partial<Pick<Quote, "status" | "validUntil" | "items" | "projectName">>;

const quoteSeedById = new Map(initialQuotes.map(quote => [quote.id, quote]));

function delay() {
  return new Promise(resolve => window.setTimeout(resolve, 120));
}

function normalizeQuote(quote: Quote): Quote {
  const seed = quoteSeedById.get(quote.id);
  return {
    ...quote,
    requestId: quote.requestId || seed?.requestId || "",
    items: quote.items || seed?.items || [],
    projectName: quote.projectName || seed?.projectName || "",
    validUntil: quote.validUntil || seed?.validUntil || ""
  };
}

function readQuotes(): Quote[] {
  const storeQuotes = useAppStore.getState().quotes;
  if (storeQuotes.length) return storeQuotes.map(normalizeQuote);

  try {
    const raw = JSON.parse(localStorage.getItem(APP_STORAGE_KEY) || "null");
    const saved = raw?.state?.quotes;
    if (Array.isArray(saved)) return saved.map(normalizeQuote);
  } catch (error) {
    console.warn("Unable to read quote cache", error);
  }

  return initialQuotes.map(normalizeQuote);
}

function commitQuotes(quotes: Quote[]) {
  useAppStore.setState({ quotes });
}

export const quoteService = {
  async getQuotes(): Promise<Quote[]> {
    await delay();
    const quotes = readQuotes();
    commitQuotes(quotes);
    return quotes;
  },

  async getQuoteById(id: string): Promise<Quote | null> {
    await delay();
    return readQuotes().find(quote => quote.id === id) || null;
  },

  async getQuotesByRequestId(requestId: string): Promise<Quote[]> {
    await delay();
    const allQuotes = readQuotes();
    commitQuotes(allQuotes);
    return allQuotes.filter(quote => quote.requestId === requestId);
  },

  async updateQuote(id: string, input: UpdateQuoteInput): Promise<Quote> {
    await delay();
    const quotes = readQuotes();
    const existing = quotes.find(quote => quote.id === id);
    if (!existing) throw new Error("Quote not found");

    const updated = { ...existing, ...input };
    commitQuotes(quotes.map(quote => (quote.id === id ? updated : quote)));
    return updated;
  },

  async updateQuoteStatus(id: string, status: QuoteStatus): Promise<Quote> {
    const quote = await quoteService.updateQuote(id, { status });

    if (status === "approved") {
      await requestService.addTimelineEvent(quote.requestId, {
        type: "scheduled",
        message: "request.timelineQuoteApproved"
      });
    }

    if (status === "revision_requested") {
      await requestService.addTimelineEvent(quote.requestId, {
        type: "waiting_customer",
        message: "request.timelineQuoteRevision"
      });
    }

    return quote;
  },

  async approveQuote(id: string): Promise<Quote> {
    return quoteService.updateQuoteStatus(id, "approved");
  },

  async requestRevision(id: string): Promise<Quote> {
    return quoteService.updateQuoteStatus(id, "revision_requested");
  }
};
