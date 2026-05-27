import { ChevronRight, ReceiptText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../../hooks/useTranslation";
import type { Quote } from "../../types";

export function QuoteCard({ quote, onOpen }: { quote: Quote; onOpen?: (quote: Quote) => void }) {
  const { language } = useTranslation();
  const navigate = useNavigate();
  const labels = quoteLabels(language);
  const files = getQuoteFiles(quote);
  const requestCode = getRequestCode(quote, labels);
  const title = getRequestTitle(quote, labels);
  const quoteDate = getQuoteDate(quote, labels, language);
  const status = getQuoteStatus(quote, files, labels);
  const detailId = getQuoteDetailId(quote);

  function openDetail() {
    if (onOpen) onOpen(quote);
    else navigate(`/quotes/${encodeURIComponent(detailId)}`);
  }

  return (
    <button className="customer-quote-card-v20260528" type="button" onClick={openDetail} aria-label={`${labels.openDetail}: ${requestCode}`}>
      <span className="customer-quote-card-icon" aria-hidden="true">
        <ReceiptText size={22} />
      </span>
      <span className="customer-quote-card-main">
        <span className="customer-quote-card-top">
          <strong className="customer-quote-card-code">{requestCode}</strong>
          <span className={`customer-quote-card-badge ${status.tone}`}>{status.label}</span>
        </span>
        <span className="customer-quote-card-title">{title}</span>
        <span className="customer-quote-card-meta">
          <span>{labels.sentAt}: {quoteDate}</span>
          <span>{labels.fileCount}: {files.length}</span>
        </span>
      </span>
      <ChevronRight size={18} className="customer-quote-card-chevron" />
    </button>
  );
}

type QuoteLabels = ReturnType<typeof quoteLabels>;
type QuoteFileLike = Record<string, unknown>;

function quoteLabels(language: string) {
  if (language === "ja") {
    return {
      received: "\u898b\u7a4d\u53d7\u4fe1\u6e08\u307f",
      accepted: "\u898b\u7a4d\u627f\u8a8d\u6e08\u307f",
      revisionRequested: "\u4fee\u6b63\u4f9d\u983c\u9001\u4fe1\u6e08\u307f",
      none: "\u898b\u7a4d\u306f\u307e\u3060\u3042\u308a\u307e\u305b\u3093",
      sentAt: "\u9001\u4fe1\u65e5",
      fileCount: "\u30d5\u30a1\u30a4\u30eb\u6570",
      noCode: "YMD-\u672a\u8a2d\u5b9a",
      noTitle: "\u30bf\u30a4\u30c8\u30eb\u672a\u8a2d\u5b9a",
      noDate: "\u9001\u4fe1\u65e5\u672a\u8a2d\u5b9a",
      openDetail: "\u898b\u7a4d\u8a73\u7d30\u3092\u958b\u304f"
    };
  }
  return {
    received: "\u0110\u00e3 nh\u1eadn b\u00e1o gi\u00e1",
    accepted: "\u0110\u00e3 ch\u1ea5p nh\u1eadn b\u00e1o gi\u00e1",
    revisionRequested: "\u0110\u00e3 y\u00eau c\u1ea7u ch\u1ec9nh s\u1eeda",
    none: "Ch\u01b0a c\u00f3 b\u00e1o gi\u00e1",
    sentAt: "Ng\u00e0y g\u1eedi",
    fileCount: "S\u1ed1 file",
    noCode: "YMD-\u672a\u8a2d\u5b9a",
    noTitle: "Kh\u00f4ng c\u00f3 ti\u00eau \u0111\u1ec1",
    noDate: "Ch\u01b0a c\u00f3 ng\u00e0y g\u1eedi",
    openDetail: "M\u1edf chi ti\u1ebft b\u00e1o gi\u00e1"
  };
}

export function getQuoteFiles(item: Quote | null | undefined): QuoteFileLike[] {
  if (!item) return [];
  const source = item as Quote & Record<string, unknown>;
  const files = source.quotationFiles || source.quoteFiles || source.files || [];
  if (Array.isArray(files)) return files as QuoteFileLike[];
  return [];
}

export function getRequestCode(item: Quote, labels = quoteLabels("vi")) {
  const source = item as Quote & Record<string, unknown>;
  return safeText(source.requestCode || source.code || source.requestNo || source.displayId || source.requestId || source.id, labels.noCode);
}

export function getRequestTitle(item: Quote, labels = quoteLabels("vi")) {
  const source = item as Quote & Record<string, unknown>;
  return safeText(source.title || source.requestTitle || source.subject || source.projectName || source.content || source.description, labels.noTitle);
}

export function getQuoteDate(item: Quote, labels = quoteLabels("vi"), language = "vi") {
  const source = item as Quote & Record<string, unknown>;
  const value = safeText(source.quoteSentAt || source.quoteUpdatedAt || source.sentAt || source.updatedAt || source.createdAt, "");
  return value ? formatQuoteDate(value, language) : labels.noDate;
}

export function getQuoteStatus(item: Quote, files = getQuoteFiles(item), labels: QuoteLabels = quoteLabels("vi")) {
  const source = item as Quote & Record<string, unknown>;
  if (source.quoteResponseStatus === "accepted") return { key: "accepted", label: labels.accepted, tone: "accepted" };
  if (source.quoteResponseStatus === "revision_requested") return { key: "revision_requested", label: labels.revisionRequested, tone: "revision" };
  if (source.quoteSent === true || files.length > 0) return { key: "received", label: labels.received, tone: "received" };
  return { key: "none", label: labels.none, tone: "none" };
}

export function getQuoteDetailId(item: Quote) {
  const source = item as Quote & Record<string, unknown>;
  return safeText(source.requestId || source.quoteCode || source.id || source.requestCode || source.code || source.requestNo, "unknown");
}

function safeText(value: unknown, fallback: string) {
  const text = String(value || "").trim();
  return text || fallback;
}

function formatQuoteDate(value: string, language = "vi") {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(language === "ja" ? "ja-JP" : "vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}
