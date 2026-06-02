import type { Quote, QuoteFile } from "../types";

export type DisplayQuoteFile = QuoteFile & {
  displayName: string;
  displayUrl: string;
  displaySize?: number;
  displayDate?: string;
};

export function getQuoteFileUrl(file?: QuoteFile | null) {
  const raw = file?.fileUrl || file?.url || file?.secureUrl || file?.secure_url || file?.downloadUrl || file?.pdfUrl || file?.path || "";
  return normalizeFileUrl(raw);
}

export function normalizeFileUrl(url: unknown) {
  const text = String(url || "").trim();
  if (!text) return "";
  if (/^https?:\/\//i.test(text)) return text;
  if (typeof window !== "undefined" && text.startsWith("/")) {
    return `${window.location.origin}${text}`;
  }
  if (typeof window !== "undefined" && /^(uploads|quote-files)\//i.test(text)) {
    return `${window.location.origin}/${text}`;
  }
  return text;
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
  const name = file.originalName || file.fileName || file.name || `File ${index + 1}`;
  return repairMojibake(String(name));
}

export function getFileExtension(file: QuoteFile | DisplayQuoteFile) {
  const source = file.ext || file.originalName || file.fileName || file.name || ("displayName" in file ? file.displayName : "") || getQuoteFileUrl(file);
  const name = String(source || "").split("?")[0];
  const ext = name.includes(".") ? name.split(".").pop() : "";
  return String(ext || "").replace(".", "").toLowerCase();
}

export function isPreviewableFile(file: QuoteFile | DisplayQuoteFile) {
  return ["pdf", "jpg", "jpeg", "png", "webp", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "csv"].includes(getFileExtension(file));
}

export function isSpecialSoftwareFile(file: QuoteFile | DisplayQuoteFile) {
  return ["jww", "jwc", "dxf", "dwg", "cad", "tfs", "tfas", "zip", "rar"].includes(getFileExtension(file));
}

function fileKey(file: DisplayQuoteFile, index: number) {
  return file.displayUrl || file.fileUrl || file.url || file.downloadUrl || file.fileName || file.originalName || file.id || file.quoteId || String(index);
}

export function getQuoteFiles(quote?: Quote | null): DisplayQuoteFile[] {
  if (!quote) return [];
  const directFileUrl = quote.fileUrl || quote.pdfUrl || "";
  const directFile = directFileUrl
    ? [{
        id: quote.id,
        quoteId: quote.id,
        originalName: quote.originalName,
        fileName: quote.fileName,
        fileUrl: directFileUrl,
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
  const uniqueFiles = (files: DisplayQuoteFile[]) => {
    const seen = new Set<string>();
    return files.filter((file, index) => {
      const key = fileKey(file, index);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };
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
    const mergedFiles = uniqueFiles([...getQuoteFiles(existing), ...files]);
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
  const ext = getFileExtension(file).toUpperCase();
  return ext || "FILE";
}

export function formatQuoteFileSize(size?: number) {
  const bytes = Number(size || 0);
  if (!bytes) return "";
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(bytes >= 10 * 1024 * 1024 ? 0 : 1)}MB`;
  if (bytes >= 1024) return `${Math.max(1, Math.round(bytes / 1024))}KB`;
  return `${bytes}B`;
}
