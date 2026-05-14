import { initialQuotes } from "../data/mockData";
import { useAppStore } from "../stores/appStore";
import type { Quote, QuoteStatus } from "../types";

export type UpdateQuoteInput = Partial<Pick<Quote, "status" | "validUntil" | "items" | "projectName">>;

function delay() {
  return new Promise(resolve => window.setTimeout(resolve, 120));
}

function readQuotes(): Quote[] {
  const storeQuotes = useAppStore.getState().quotes;
  if (storeQuotes.length) return storeQuotes;

  try {
    const raw = JSON.parse(localStorage.getItem("yamaden-mobile-spa") || "null");
    const saved = raw?.state?.quotes;
    if (Array.isArray(saved)) return saved;
  } catch (error) {
    console.warn("Unable to read quote cache", error);
  }

  return initialQuotes;
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
    return quoteService.updateQuote(id, { status });
  }
};
