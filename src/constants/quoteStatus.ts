import type { TranslationKey } from "../i18n";
import type { QuoteStatus } from "../types";

export const QUOTE_STATUS_LABEL_KEYS: Record<QuoteStatus, TranslationKey> = {
  draft: "quote.draft",
  pending: "quote.pending",
  pending_approval: "quote.pendingApproval",
  sent_to_customer: "quote.sentToCustomer",
  viewed_by_customer: "quote.viewedByCustomer",
  approved: "quote.approved",
  accepted: "quote.approved",
  revision_requested: "quote.revision_requested",
  change_requested: "quote.revision_requested",
  rejected: "quote.rejected",
  expired: "quote.expired"
};

export function calculateQuoteSubtotal(items: Array<{ quantity: number; unitPrice: number; discount?: number; amount?: number }>): number {
  return items.reduce((sum, item) => sum + (item.amount ?? item.quantity * item.unitPrice - (item.discount || 0)), 0);
}

export function calculateQuoteVat(subtotal: number): number {
  return Math.round(subtotal * 0.1);
}

export function calculateQuoteTotal(items: Array<{ quantity: number; unitPrice: number; discount?: number; amount?: number }>): number {
  const subtotal = calculateQuoteSubtotal(items);
  return subtotal + calculateQuoteVat(subtotal);
}
