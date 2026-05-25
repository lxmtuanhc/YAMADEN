import { initialQuotes } from "../data/mockData";
import { requestService } from "./requestService";
import { useAppStore } from "../stores/appStore";
import type { Quote, QuoteStatus } from "../types";
import { APP_STORAGE_KEY } from "../constants/storageKeys";
import { getUserToken } from "./authService";

export type UpdateQuoteInput = Partial<Pick<Quote, "status" | "validUntil" | "items" | "projectName" | "visibleToCustomer" | "viewedByCustomerAt" | "acceptedAt" | "rejectedAt" | "changeRequestedAt" | "changeRequestMessage">>;

const QUOTE_LAYOUT_STORAGE_KEY = "yamaden-quotes-layout-v1";
const quoteSeedById = new Map(initialQuotes.map(quote => [quote.id, quote]));

function delay() {
  return new Promise(resolve => window.setTimeout(resolve, 120));
}

function normalizeQuote(quote: Quote): Quote {
  const seed = quoteSeedById.get(quote.id);
  return {
    ...quote,
    id: String(quote.id || quote.quoteCode || ""),
    quoteCode: quote.quoteCode || quote.id,
    quoteNo: quote.quoteNo || quote.quoteCode || quote.id,
    requestId: quote.requestId || seed?.requestId || "",
    items: quote.items || seed?.items || [],
    projectName: quote.projectName || seed?.projectName || "",
    validUntil: quote.validUntil || seed?.validUntil || "",
    title: quote.title || quote.projectName || seed?.projectName || "",
    visibleToCustomer: quote.visibleToCustomer === true,
    customerId: quote.customerId || "",
    customerName: quote.customerName || "",
    customerPhone: quote.customerPhone || "",
    customerEmail: quote.customerEmail || "",
    fileUrl: quote.fileUrl || "",
    originalName: quote.originalName || quote.fileName || "",
    fileName: quote.fileName || "",
    mimeType: quote.mimeType || "",
    fileSize: quote.fileSize || 0,
    ext: quote.ext || "",
    sentToCustomerAt: quote.sentToCustomerAt || "",
    acceptedAt: quote.acceptedAt || "",
    rejectedAt: quote.rejectedAt || "",
    changeRequestedAt: quote.changeRequestedAt || "",
    changeRequestMessage: quote.changeRequestMessage || "",
    isDeleted: Boolean(quote.isDeleted),
    deletedAt: quote.deletedAt || null,
    deletedBy: quote.deletedBy || "",
    deletedByRole: quote.deletedByRole || "",
    daysLeftBeforePermanentDelete: quote.daysLeftBeforePermanentDelete
  };
}

function visibleToCurrentUser(quote: Quote): boolean {
  const user = useAppStore.getState().user;
  if (!quote.visibleToCustomer) return false;
  if (!quote.customerId && !quote.customerName) return false;
  if (!user) return true;
  return Boolean(
    !quote.customerId && !quote.customerPhone && !quote.customerEmail ||
    quote.customerId === user.id ||
    quote.customerPhone === user.phone ||
    quote.customerEmail === user.email
  );
}

function readQuotes(): Quote[] {
  const storeQuotes = useAppStore.getState().quotes;
  let savedQuotes: Quote[] = [];
  let layoutQuotes: Quote[] = [];
  try {
    const raw = JSON.parse(localStorage.getItem(APP_STORAGE_KEY) || "null");
    const saved = raw?.state?.quotes;
    if (Array.isArray(saved)) savedQuotes = saved.map(normalizeQuote);
  } catch (error) {
    console.warn("Unable to read quote cache", error);
  }
  try {
    const raw = JSON.parse(localStorage.getItem(QUOTE_LAYOUT_STORAGE_KEY) || "null");
    if (Array.isArray(raw?.quotes)) layoutQuotes = raw.quotes.map(normalizeQuote);
  } catch (error) {
    console.warn("Unable to read quote layout cache", error);
  }
  if (storeQuotes.length || savedQuotes.length || layoutQuotes.length) {
    const byId = new Map<string, Quote>();
    storeQuotes.map(normalizeQuote).forEach(quote => byId.set(quote.id || quote.quoteCode || "", quote));
    layoutQuotes.forEach(quote => byId.set(quote.id || quote.quoteCode || "", quote));
    savedQuotes.forEach(quote => byId.set(quote.id || quote.quoteCode || "", quote));
    return [...byId.values()];
  }

  return initialQuotes.map(normalizeQuote);
}

function commitQuotes(quotes: Quote[]) {
  useAppStore.setState({ quotes });
  try {
    localStorage.setItem(QUOTE_LAYOUT_STORAGE_KEY, JSON.stringify({ quotes }));
  } catch (error) {
    console.warn("Unable to persist quote layout cache", error);
  }
}

function sameQuote(left: Quote, right: Quote) {
  return Boolean(
    (left.id && right.id && left.id === right.id) ||
    (left.quoteCode && right.quoteCode && left.quoteCode === right.quoteCode)
  );
}

async function fetchBackendQuotes(): Promise<Quote[] | null> {
  const token = getUserToken();
  if (!token) return null;
  const response = await fetch("/api/customer/quotes", {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) throw new Error("Quotes load failed");
  const payload = await response.json();
  const items = Array.isArray(payload.data) ? payload.data : Array.isArray(payload) ? payload : [];
  return items.map((item: Quote) => normalizeQuote(item));
}

async function fetchDeletedBackendQuotes(): Promise<Quote[] | null> {
  const token = getUserToken();
  if (!token) return null;
  const response = await fetch("/api/customer/quotes/deleted", {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) throw new Error("Deleted quotes load failed");
  const payload = await response.json();
  const items = Array.isArray(payload.data) ? payload.data : Array.isArray(payload) ? payload : [];
  return items.map((item: Quote) => normalizeQuote(item));
}

async function deleteBackendQuote(id: string): Promise<Quote | null> {
  const token = getUserToken();
  if (!token) return null;
  const response = await fetch(`/api/customer/quotes/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Quote delete failed");
  const payload = await response.json();
  return normalizeQuote(payload.data || payload);
}

async function restoreBackendQuote(id: string): Promise<Quote | null> {
  const token = getUserToken();
  if (!token) return null;
  const response = await fetch(`/api/customer/quotes/${encodeURIComponent(id)}/restore`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` }
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Quote restore failed");
  const payload = await response.json();
  return normalizeQuote(payload.data || payload);
}

async function permanentDeleteBackendQuote(id: string): Promise<boolean | null> {
  const token = getUserToken();
  if (!token) return null;
  const response = await fetch(`/api/customer/quotes/${encodeURIComponent(id)}/permanent`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Quote permanent delete failed");
  return true;
}

export const quoteService = {
  async getQuotes(): Promise<Quote[]> {
    await delay();
    try {
      const backendQuotes = await fetchBackendQuotes();
      if (backendQuotes) {
        const deletedLocal = readQuotes().filter(quote => quote.isDeleted);
        const quotes = [...backendQuotes, ...deletedLocal.filter(deleted => !backendQuotes.some(item => sameQuote(item, deleted)))];
        commitQuotes(quotes);
        return backendQuotes.filter(quote => !quote.isDeleted);
      }
    } catch (error) {
      console.warn("Unable to load quotes from backend", error);
    }
    const quotes = readQuotes();
    commitQuotes(quotes);
    return quotes.filter(quote => !quote.isDeleted && visibleToCurrentUser(quote));
  },

  async getQuoteById(id: string): Promise<Quote | null> {
    await delay();
    const quote = readQuotes().find(item => !item.isDeleted && (item.id === id || item.quoteCode === id));
    if (!quote || !visibleToCurrentUser(quote)) return null;
    if (!quote.viewedByCustomerAt && quote.status === "sent_to_customer") {
      return quoteService.updateQuote(quote.id, { status: "viewed_by_customer", viewedByCustomerAt: new Date().toISOString() });
    }
    return quote;
  },

  async getQuotesByRequestId(requestId: string): Promise<Quote[]> {
    await delay();
    try {
      const backendQuotes = await fetchBackendQuotes();
      if (backendQuotes) {
        commitQuotes(backendQuotes);
        return backendQuotes.filter(quote => !quote.isDeleted && quote.requestId === requestId && visibleToCurrentUser(quote));
      }
    } catch (error) {
      console.warn("Unable to load request quotes from backend", error);
    }
    const allQuotes = readQuotes();
    commitQuotes(allQuotes);
    return allQuotes.filter(quote => !quote.isDeleted && quote.requestId === requestId && visibleToCurrentUser(quote));
  },

  async updateQuote(id: string, input: UpdateQuoteInput): Promise<Quote> {
    await delay();
    const quotes = readQuotes();
    const existing = quotes.find(quote => quote.id === id);
    if (!existing) throw new Error("Quote not found");

    const updated = { ...existing, ...input, updatedAt: new Date().toISOString() };
    commitQuotes(quotes.map(quote => (quote.id === id ? updated : quote)));
    return updated;
  },

  async updateQuoteStatus(id: string, status: QuoteStatus): Promise<Quote> {
    const quote = await quoteService.updateQuote(id, { status });

    if (status === "approved" || status === "accepted") {
      await requestService.addTimelineEvent(quote.requestId, {
        type: "scheduled",
        message: "request.timelineQuoteApproved"
      });
    }

    if (status === "revision_requested" || status === "change_requested") {
      await requestService.addTimelineEvent(quote.requestId, {
        type: "waiting_customer",
        message: "request.timelineQuoteRevision"
      });
    }

    return quote;
  },

  async deleteQuote(id: string): Promise<Quote> {
    await delay();
    try {
      const deleted = await deleteBackendQuote(id);
      if (deleted) {
        commitQuotes(readQuotes().map(quote => (quote.id === id || quote.quoteCode === id ? deleted : quote)));
        return deleted;
      }
    } catch (error) {
      console.warn("Unable to delete quote in backend", error);
    }

    const quotes = readQuotes();
    const existing = quotes.find(quote => quote.id === id || quote.quoteCode === id);
    if (!existing) throw new Error("Quote not found");
    const deleted = normalizeQuote({
      ...existing,
      isDeleted: true,
      deletedAt: new Date().toISOString(),
      deletedBy: useAppStore.getState().user?.id || "",
      deletedByRole: "user",
      daysLeftBeforePermanentDelete: 30
    });
    commitQuotes(quotes.map(quote => (sameQuote(quote, deleted) ? deleted : quote)));
    return deleted;
  },

  async getDeletedQuotes(): Promise<Quote[]> {
    await delay();
    try {
      const deleted = await fetchDeletedBackendQuotes();
      if (deleted) {
        const activeLocal = readQuotes().filter(quote => !quote.isDeleted);
        commitQuotes([...activeLocal, ...deleted]);
        return deleted;
      }
    } catch (error) {
      console.warn("Unable to load deleted quotes from backend", error);
    }
    return readQuotes()
      .filter(quote => quote.isDeleted)
      .sort((left, right) => new Date(right.deletedAt || 0).getTime() - new Date(left.deletedAt || 0).getTime());
  },

  async restoreQuote(id: string): Promise<Quote> {
    await delay();
    try {
      const restored = await restoreBackendQuote(id);
      if (restored) {
        commitQuotes(readQuotes().map(quote => (quote.id === id || quote.quoteCode === id ? restored : quote)));
        return restored;
      }
    } catch (error) {
      console.warn("Unable to restore quote in backend", error);
    }

    const quotes = readQuotes();
    const existing = quotes.find(quote => quote.id === id || quote.quoteCode === id);
    if (!existing) throw new Error("Quote not found");
    const restored = normalizeQuote({ ...existing, isDeleted: false, deletedAt: null, deletedBy: "", deletedByRole: "" });
    commitQuotes(quotes.map(quote => (sameQuote(quote, restored) ? restored : quote)));
    return restored;
  },

  async permanentDeleteQuote(id: string): Promise<void> {
    await delay();
    try {
      const deleted = await permanentDeleteBackendQuote(id);
      if (deleted) {
        commitQuotes(readQuotes().filter(quote => quote.id !== id && quote.quoteCode !== id));
        return;
      }
    } catch (error) {
      console.warn("Unable to permanently delete quote in backend", error);
    }
    commitQuotes(readQuotes().filter(quote => quote.id !== id && quote.quoteCode !== id));
  },

  async approveQuote(id: string): Promise<Quote> {
    return quoteService.updateQuote(id, { status: "accepted", acceptedAt: new Date().toISOString() });
  },

  async requestRevision(id: string): Promise<Quote> {
    return quoteService.updateQuote(id, { status: "change_requested", changeRequestedAt: new Date().toISOString() });
  },

  async rejectQuote(id: string): Promise<Quote> {
    return quoteService.updateQuote(id, { status: "rejected", rejectedAt: new Date().toISOString() });
  }
};
