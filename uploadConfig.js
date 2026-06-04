const MB = 1024 * 1024;

const uploadConfig = {
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
  ALLOWED_ARCHIVE_EXTENSIONS: [".zip"],
  ALLOWED_QUOTE_EXTENSIONS: [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".csv", ".ppt", ".pptx", ".jpg", ".jpeg", ".png", ".webp", ".jww", ".jwc", ".dxf", ".dwg", ".zip"],
  BLOCKED_EXTENSIONS: [".exe", ".bat", ".cmd", ".js", ".sh", ".php", ".msi", ".com", ".scr", ".ps1", ".vbs", ".jar"]
};

function mb(value) {
  return value * MB;
}

function extensionOf(name) {
  const text = String(name || "").toLowerCase();
  const index = text.lastIndexOf(".");
  return index >= 0 ? text.slice(index) : "";
}

function customerFileKind(file) {
  const ext = extensionOf(file?.name || file?.originalname);
  if (uploadConfig.ALLOWED_IMAGE_EXTENSIONS.includes(ext)) return "image";
  if (uploadConfig.ALLOWED_VIDEO_EXTENSIONS.includes(ext)) return "video";
  if (uploadConfig.ALLOWED_DOCUMENT_EXTENSIONS.includes(ext)) return "document";
  if (uploadConfig.ALLOWED_DRAWING_EXTENSIONS.includes(ext)) return "drawing";
  if (uploadConfig.ALLOWED_ARCHIVE_EXTENSIONS.includes(ext)) return "archive";
  return "";
}

function customerFileLimitBytes(file) {
  const kind = customerFileKind(file);
  if (kind === "video") return mb(uploadConfig.VIDEO_MAX_SIZE_MB);
  if (kind === "image") return mb(uploadConfig.IMAGE_MAX_SIZE_MB);
  if (kind === "document" || kind === "drawing" || kind === "archive") return mb(uploadConfig.DOCUMENT_MAX_SIZE_MB);
  return 0;
}

function isCustomerFileAllowed(file) {
  const ext = extensionOf(file?.name || file?.originalname);
  return Boolean(customerFileKind(file)) && !uploadConfig.BLOCKED_EXTENSIONS.includes(ext);
}

function isQuoteFileAllowed(file) {
  const ext = extensionOf(file?.name || file?.originalname);
  return uploadConfig.ALLOWED_QUOTE_EXTENSIONS.includes(ext) && !uploadConfig.BLOCKED_EXTENSIONS.includes(ext);
}

module.exports = {
  MB,
  uploadConfig,
  mb,
  extensionOf,
  customerFileKind,
  customerFileLimitBytes,
  isCustomerFileAllowed,
  isQuoteFileAllowed
};
