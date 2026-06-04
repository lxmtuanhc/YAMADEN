import type { RequestFileKind, RequestMediaFile, SupportRequest } from "../types";

const KIND_BY_EXTENSION: Record<string, RequestFileKind> = {
  jpg: "image",
  jpeg: "image",
  png: "image",
  webp: "image",
  mp4: "video",
  mov: "video",
  quicktime: "video",
  pdf: "pdf",
  doc: "document",
  docx: "document",
  xls: "spreadsheet",
  xlsx: "spreadsheet",
  csv: "spreadsheet",
  ppt: "presentation",
  pptx: "presentation",
  jww: "cad",
  jwc: "cad",
  dxf: "cad",
  dwg: "cad",
  zip: "archive"
};

export function cleanFileText(value: unknown) {
  return String(value || "").trim();
}

export function fileExtensionFrom(value: unknown) {
  const text = cleanFileText(value).split("?")[0].split("#")[0].toLowerCase();
  const match = text.match(/\.([a-z0-9]+)$/i);
  return match ? match[1] : "";
}

export function requestFileUrl(file: RequestMediaFile) {
  return cleanFileText(file.downloadUrl || file.secureUrl || file.secure_url || file.url || file.path);
}

export function requestFileName(file: RequestMediaFile, fallback = "file") {
  const url = requestFileUrl(file);
  const name = cleanFileText(file.originalName || file.filename || file.fileName || file.name);
  if (name) return name;
  try {
    const pathname = new URL(url).pathname;
    return decodeURIComponent(pathname.split("/").pop() || fallback);
  } catch {
    return url.split("/").pop() || fallback;
  }
}

export function requestFileKind(file: RequestMediaFile): RequestFileKind {
  const explicitKind = cleanFileText(file.kind || file.type || file.mediaType).toLowerCase();
  if (isKnownKind(explicitKind)) return explicitKind;

  const mimeType = cleanFileText(file.mimeType || file.mimetype).toLowerCase();
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel") || mimeType.includes("csv")) return "spreadsheet";
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint")) return "presentation";
  if (mimeType.includes("word") || mimeType.includes("document")) return "document";
  if (mimeType.includes("zip")) return "archive";

  const ext = cleanFileText(file.ext || fileExtensionFrom(file.originalName || file.filename || file.fileName || file.name || requestFileUrl(file)));
  return KIND_BY_EXTENSION[ext.toLowerCase().replace(/^\./, "")] || "other";
}

export function normalizeRequestFile(input: unknown, source = "file"): RequestMediaFile | null {
  if (!input) return null;
  const base: RequestMediaFile = typeof input === "string" ? { url: input } : { ...(input as RequestMediaFile) };
  const url = requestFileUrl(base);
  if (!url) return null;
  const name = requestFileName(base);
  const ext = cleanFileText(base.ext || fileExtensionFrom(name || url));
  const kind = requestFileKind({ ...base, ext });
  return {
    ...base,
    id: cleanFileText(base.id) || `${source}-${url}`,
    url,
    secureUrl: cleanFileText(base.secureUrl || base.secure_url) || url,
    downloadUrl: cleanFileText(base.downloadUrl) || url,
    originalName: cleanFileText(base.originalName || base.name || base.filename || base.fileName) || name,
    filename: cleanFileText(base.filename || base.fileName || name),
    mimeType: cleanFileText(base.mimeType || base.mimetype),
    mimetype: cleanFileText(base.mimetype || base.mimeType),
    ext,
    kind,
    type: kind,
    source
  };
}

export function normalizeRequestFiles(request: Partial<SupportRequest>): RequestMediaFile[] {
  const raw: Array<{ value: unknown; source: string }> = [];
  (Array.isArray(request.mediaFiles) ? request.mediaFiles : []).forEach(value => raw.push({ value, source: "mediaFiles" }));
  (Array.isArray(request.attachments) ? request.attachments : []).forEach(value => raw.push({ value, source: "attachments" }));
  (Array.isArray(request.files) ? request.files : []).forEach(value => raw.push({ value, source: "files" }));
  if (request.mediaUrl) raw.push({ value: { url: request.mediaUrl, type: request.mediaType }, source: "mediaUrl" });
  if (request.image) raw.push({ value: { url: request.image, type: "image" }, source: "image" });
  (Array.isArray(request.images) ? request.images : []).forEach(value => raw.push({ value: { url: value, type: "image" }, source: "images" }));

  const seen = new Set<string>();
  return raw
    .map(item => normalizeRequestFile(item.value, item.source))
    .filter((item): item is RequestMediaFile => Boolean(item))
    .filter(item => {
      const key = requestFileUrl(item).replace(/^http:\/\//i, "https://").replace(/[?#].*$/, "");
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export function formatRequestFileSize(size?: number) {
  const value = Number(size || 0);
  if (!value) return "";
  if (value >= 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(value >= 10 * 1024 * 1024 ? 0 : 1)}MB`;
  if (value >= 1024) return `${Math.max(1, Math.round(value / 1024))}KB`;
  return `${value}B`;
}

function isKnownKind(value: string): value is RequestFileKind {
  return ["image", "video", "pdf", "document", "spreadsheet", "presentation", "cad", "archive", "other"].includes(value);
}
