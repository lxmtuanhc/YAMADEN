import type { Quote, QuoteFile } from "../types";

export type DisplayQuoteFile = QuoteFile & {
  displayName: string;
  displayUrl: string;
  displaySize?: number;
  displayDate?: string;
};

export function getQuoteFileUrl(file?: QuoteFile | null) {
  return file?.fileUrl || file?.url || file?.secureUrl || file?.secure_url || "";
}

export function isValidFileUrl(url: unknown) {
  return typeof url === "string" && /^https?:\/\//i.test(url.trim());
}

function repairMojibake(text: string) {
  if (!/[ÃÂã�]|Ná|á»/.test(text)) return text;
  try {
    return decodeURIComponent(escape(text));
  } catch {
    return text;
  }
}

export function getQuoteFileName(file: QuoteFile, index: number) {
  const name = file.originalName || file.fileName || file.name || `Báo giá ${index + 1}`;
  return repairMojibake(String(name));
}

function fileKey(file: DisplayQuoteFile, index: number) {
  return file.id || file.quoteId || file.displayUrl || file.fileName || file.originalName || String(index);
}

export function getQuoteFiles(quote?: Quote | null): DisplayQuoteFile[] {
  if (!quote) return [];
  const directFile = quote.fileUrl
    ? [{
        id: quote.id,
        quoteId: quote.id,
        originalName: quote.originalName,
        fileName: quote.fileName,
        fileUrl: quote.fileUrl,
        mimeType: quote.mimeType,
        fileSize: quote.fileSize,
        ext: quote.ext,
        sentAt: quote.sentAt || quote.quoteSentAt || quote.sentToCustomerAt || quote.createdAt,
        uploadedAt: quote.createdAt
      }]
    : [];
  const rawFiles = [
    ...(quote.quotationFiles || []),
    ...(quote.quoteFiles || []),
    ...directFile
  ];
  const normalized = rawFiles.map((file, index) => {
    const displayUrl = getQuoteFileUrl(file);
    const displayName = getQuoteFileName(file, index);
    return {
      ...file,
      displayName,
      displayUrl,
      displaySize: file.fileSize || file.size,
      displayDate: file.sentAt || file.uploadedAt || file.createdAt
    };
  });
  const seen = new Set<string>();
  return normalized.filter((file, index) => {
    const key = fileKey(file, index);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function isQuoteSent(quote?: Quote | null) {
  return Boolean(quote?.quoteSent || getQuoteFiles(quote).length);
}

export function groupQuotesByRequest(quotes: Quote[]): Quote[] {
  const grouped = new Map<string, Quote>();
  quotes.forEach(quote => {
    const key = quote.requestId || quote.quoteCode || quote.id;
    const existing = grouped.get(key);
    const files = getQuoteFiles(quote);
    if (!existing) {
      grouped.set(key, {
        ...quote,
        quoteFiles: files,
        quotationFiles: files,
        quoteSent: isQuoteSent(quote),
        quoteFileCount: files.length
      });
      return;
    }
    const mergedFiles = [...getQuoteFiles(existing), ...files];
    grouped.set(key, {
      ...existing,
      quoteFiles: mergedFiles,
      quotationFiles: mergedFiles,
      quoteSent: isQuoteSent(existing) || isQuoteSent(quote),
      quoteSentAt: existing.quoteSentAt || quote.quoteSentAt || existing.sentAt || quote.sentAt,
      quoteFileCount: mergedFiles.length
    });
  });
  return [...grouped.values()];
}

export function quoteFileType(file: DisplayQuoteFile) {
  const ext = (file.ext || file.displayName.split(".").pop() || "").replace(".", "").toUpperCase();
  return ext || "FILE";
}

export function formatQuoteFileSize(size?: number) {
  const bytes = Number(size || 0);
  if (!bytes) return "";
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(bytes >= 10 * 1024 * 1024 ? 0 : 1)}MB`;
  if (bytes >= 1024) return `${Math.max(1, Math.round(bytes / 1024))}KB`;
  return `${bytes}B`;
}
