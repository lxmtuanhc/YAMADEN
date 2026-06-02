const MB = 1024 * 1024;

export const uploadConfig = {
  CUSTOMER_MAX_FILES: 12,
  CUSTOMER_MAX_TOTAL_SIZE_MB: 200,
  IMAGE_MAX_SIZE_MB: 10,
  DOCUMENT_MAX_SIZE_MB: 25,
  VIDEO_MAX_SIZE_MB: 100,
  QUOTE_MAX_FILES: 5,
  QUOTE_MAX_FILE_SIZE_MB: 25,
  ALLOWED_IMAGE_EXTENSIONS: [".jpg", ".jpeg", ".png", ".webp"],
  ALLOWED_VIDEO_EXTENSIONS: [".mp4", ".mov"],
  ALLOWED_DOCUMENT_EXTENSIONS: [".pdf", ".xlsx", ".xls", ".csv", ".docx", ".doc", ".ppt", ".pptx"],
  ALLOWED_DRAWING_EXTENSIONS: [".jww", ".jwc", ".dxf", ".dwg"],
  ALLOWED_QUOTE_EXTENSIONS: [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".csv", ".ppt", ".pptx", ".jpg", ".jpeg", ".png", ".webp", ".jww", ".jwc", ".dxf", ".dwg", ".zip"],
  BLOCKED_EXTENSIONS: [".exe", ".bat", ".cmd", ".js", ".sh", ".php", ".msi", ".com", ".scr", ".ps1", ".vbs", ".jar"]
} as const;

export function mb(value: number) {
  return value * MB;
}

export function extensionOf(name: string) {
  const text = String(name || "").toLowerCase();
  const index = text.lastIndexOf(".");
  return index >= 0 ? text.slice(index) : "";
}

export function customerFileKind(file: File) {
  const ext = extensionOf(file.name);
  if ((uploadConfig.ALLOWED_IMAGE_EXTENSIONS as readonly string[]).includes(ext)) return "image";
  if ((uploadConfig.ALLOWED_VIDEO_EXTENSIONS as readonly string[]).includes(ext)) return "video";
  if ((uploadConfig.ALLOWED_DOCUMENT_EXTENSIONS as readonly string[]).includes(ext)) return "document";
  if ((uploadConfig.ALLOWED_DRAWING_EXTENSIONS as readonly string[]).includes(ext)) return "drawing";
  return "";
}

export function customerFileLimitBytes(file: File) {
  const kind = customerFileKind(file);
  if (kind === "video") return mb(uploadConfig.VIDEO_MAX_SIZE_MB);
  if (kind === "image") return mb(uploadConfig.IMAGE_MAX_SIZE_MB);
  if (kind === "document" || kind === "drawing") return mb(uploadConfig.DOCUMENT_MAX_SIZE_MB);
  return 0;
}

export function isCustomerFileAllowed(file: File) {
  const ext = extensionOf(file.name);
  return Boolean(customerFileKind(file)) && !(uploadConfig.BLOCKED_EXTENSIONS as readonly string[]).includes(ext);
}
