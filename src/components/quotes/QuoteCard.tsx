import { Download, ExternalLink, FileText, ReceiptText, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "../../hooks/useTranslation";
import type { Quote } from "../../types";
import { formatQuoteFileSize, getQuoteFiles, isPreviewableFile, isSpecialSoftwareFile, isValidFileUrl, quoteFileType } from "../../utils/quoteFiles";
import { Card } from "../ui/Card";

export function QuoteCard({ quote, onDelete }: { quote: Quote; onDelete?: (quote: Quote) => void }) {
  const { t, language } = useTranslation();
  const [fileError, setFileError] = useState("");
  const labels = quoteLabels(language);
  const files = getQuoteFiles(quote);
  const sentAt = quote.quoteSentAt || quote.sentAt || files[0]?.displayDate || quote.createdAt || "";

  return (
    <Card className="request-card quote-list-card quote-file-card">
      <div className="list-icon">
        <ReceiptText size={22} />
      </div>
      <div className="list-body">
        <div className="list-row">
          <span className="list-id">{quote.requestId || quote.quoteCode || quote.id}</span>
          <span className="quote-file-status">{labels.received}</span>
        </div>
        <h3>{quote.projectName}</h3>
        <p><span>{labels.sentAt}</span><span>{sentAt ? formatQuoteDate(sentAt, language) : "-"}</span></p>
        <p><span>{labels.fileCount}</span><span>{files.length}</span></p>
        <div className="quote-file-list-compact" aria-label={labels.quoteFiles}>
          <strong>{labels.quoteFiles}</strong>
          {files.length ? files.map((file, index) => (
            <QuoteFileRow key={`${file.displayUrl || file.displayName}-${index}`} file={file} index={index} labels={labels} onError={setFileError} />
          )) : <span className="muted-line">{labels.notFound}</span>}
        </div>
        {onDelete ? (
          <button
            className="inline-danger-action"
            type="button"
            onClick={event => {
              event.stopPropagation();
              onDelete(quote);
            }}
          >
            <Trash2 size={14} />
            <span>{t("quote.deleteAction")}</span>
          </button>
        ) : null}
        {fileError ? <div className="quote-file-error">{fileError}</div> : null}
      </div>
    </Card>
  );
}

type QuoteLabels = ReturnType<typeof quoteLabels>;
type QuoteFile = ReturnType<typeof getQuoteFiles>[number];

function quoteLabels(language: string) {
  if (language === "ja") {
    return {
      received: "見積受信済み",
      quoteFiles: "見積ファイル",
      open: "開く",
      download: "ダウンロード",
      notFound: "ファイルが見つかりません。",
      cannotPreview: "このファイルは直接表示できません。ダウンロードしてください。",
      specialFileNote: "このファイルは専用ソフトが必要です。ダウンロードして開いてください。",
      sentAt: "送信日",
      fileCount: "ファイル数"
    };
  }
  return {
    received: "Đã nhận báo giá",
    quoteFiles: "File báo giá",
    open: "Mở",
    download: "Tải về",
    notFound: "Không tìm thấy file.",
    cannotPreview: "File này không thể xem trực tiếp. Vui lòng tải về.",
    specialFileNote: "File này cần phần mềm chuyên dụng. Vui lòng tải về để mở.",
    sentAt: "Ngày gửi",
    fileCount: "Số file"
  };
}

function QuoteFileRow({ file, index, labels, compact = false, onError }: { file: QuoteFile; index: number; labels: QuoteLabels; compact?: boolean; onError: (message: string) => void }) {
  const validUrl = isValidFileUrl(file.displayUrl);
  const previewable = isPreviewableFile(file);
  const specialFile = isSpecialSoftwareFile(file);
  const openFile = () => {
    if (!validUrl) {
      onError(labels.notFound);
      return;
    }
    if (!previewable) {
      onError(specialFile ? labels.specialFileNote : labels.cannotPreview);
      return;
    }
    window.open(file.displayUrl, "_blank", "noopener,noreferrer");
  };
  const downloadFile = () => {
    if (!validUrl) {
      onError(labels.notFound);
      return;
    }
    const link = document.createElement("a");
    link.href = file.displayUrl;
    link.download = file.displayName;
    link.target = "_blank";
    link.rel = "noreferrer";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };
  return (
    <div className={`quote-file-link-row${compact ? " compact" : ""}`}>
      <span className="quote-file-link-index">{index + 1}.</span>
      <FileText size={16} />
      <div className="quote-file-link-main">
        <strong>{file.displayName}</strong>
        {!compact ? (
          <span>{[quoteFileType(file), formatQuoteFileSize(file.displaySize), file.displayDate ? formatQuoteDate(file.displayDate) : ""].filter(Boolean).join(" · ")}</span>
        ) : null}
        {specialFile ? <em>{labels.specialFileNote}</em> : null}
      </div>
      {validUrl ? (
        <div className="quote-file-link-actions">
          {previewable ? (
            <button type="button" onClick={openFile}>
              <ExternalLink size={14} />
              <span>{labels.open}</span>
            </button>
          ) : null}
          <button type="button" onClick={downloadFile}>
            <Download size={14} />
            <span>{labels.download}</span>
          </button>
        </div>
      ) : (
        <span className="muted-line">{labels.notFound}</span>
      )}
    </div>
  );
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
