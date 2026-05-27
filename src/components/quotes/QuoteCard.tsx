import { Download, ExternalLink, FileText, ReceiptText, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "../../hooks/useTranslation";
import type { Quote } from "../../types";
import { formatQuoteFileSize, getQuoteFiles, isValidFileUrl, quoteFileType } from "../../utils/quoteFiles";
import { Card } from "../ui/Card";

export function QuoteCard({ quote, onDelete }: { quote: Quote; onDelete?: (quote: Quote) => void }) {
  const { t, language } = useTranslation();
  const [isFileListOpen, setIsFileListOpen] = useState(false);
  const [fileError, setFileError] = useState("");
  const labels = quoteLabels(language);
  const files = getQuoteFiles(quote);
  const previewFiles = files.slice(0, 3);
  const sentAt = quote.quoteSentAt || quote.sentAt || files[0]?.displayDate || quote.createdAt || "";

  useEffect(() => {
    document.body.classList.toggle("modal-open", isFileListOpen);
    return () => document.body.classList.remove("modal-open");
  }, [isFileListOpen]);

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
          {previewFiles.length ? previewFiles.map((file, index) => (
            <QuoteFileRow key={`${file.displayUrl || file.displayName}-${index}`} file={file} index={index} labels={labels} compact onError={setFileError} />
          )) : <span className="muted-line">{labels.notFound}</span>}
        </div>
        {files.length > 3 ? (
          <button className="quote-file-list-button" type="button" onClick={() => setIsFileListOpen(true)}>
            {labels.viewAllFiles} ({files.length})
          </button>
        ) : files.length ? (
          <button className="quote-file-list-button" type="button" onClick={() => setIsFileListOpen(true)}>
            {labels.viewFileList}
          </button>
        ) : null}
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
      {isFileListOpen ? (
        <div className="quote-file-modal-overlay" role="presentation" onClick={() => setIsFileListOpen(false)}>
          <div className="quote-file-modal" role="dialog" aria-modal="true" aria-labelledby="quote-file-modal-title" onClick={event => event.stopPropagation()}>
            <div className="quote-file-modal-header">
              <div>
                <h2 id="quote-file-modal-title">{labels.quoteFiles}</h2>
                <p>{labels.fileListDescription}</p>
              </div>
              <button className="quote-file-modal-close" type="button" aria-label={labels.close} onClick={() => setIsFileListOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="quote-file-modal-body">
              {files.length ? files.map((file, index) => (
                <QuoteFileRow key={`${file.displayUrl || file.displayName}-${index}`} file={file} index={index} labels={labels} onError={setFileError} />
              )) : <div className="muted-line">{labels.notFound}</div>}
            </div>
            <button className="button button-secondary quote-file-modal-footer" type="button" onClick={() => setIsFileListOpen(false)}>
              {labels.close}
            </button>
          </div>
        </div>
      ) : null}
    </Card>
  );
}

type QuoteLabels = ReturnType<typeof quoteLabels>;
type QuoteFile = ReturnType<typeof getQuoteFiles>[number];

function quoteLabels(language: string) {
  if (language === "ja") {
    return {
      related: "関連見積",
      received: "見積受信済み",
      quoteFiles: "見積ファイル",
      viewFileList: "ファイル一覧を見る",
      viewAllFiles: "すべてのファイルを見る",
      open: "開く",
      download: "ダウンロード",
      close: "閉じる",
      back: "戻る",
      notFound: "ファイルが見つかりません",
      cannotPreview: "このファイルは直接表示できません。ダウンロードしてください。",
      empty: "見積はまだありません",
      sentAt: "送信日",
      fileCount: "ファイル数",
      fileListDescription: "管理者から送信された見積ファイルの一覧です。"
    };
  }
  return {
    related: "Báo giá liên quan",
    received: "Đã nhận báo giá",
    quoteFiles: "File báo giá",
    viewFileList: "Xem danh sách file",
    viewAllFiles: "Xem tất cả file",
    open: "Mở",
    download: "Tải về",
    close: "Đóng",
    back: "Quay lại",
    notFound: "Không tìm thấy file",
    cannotPreview: "File này không thể xem trực tiếp. Vui lòng tải về.",
    empty: "Chưa có báo giá",
    sentAt: "Ngày gửi",
    fileCount: "Số file",
    fileListDescription: "Danh sách file báo giá admin đã gửi."
  };
}

function QuoteFileRow({ file, index, labels, compact = false, onError }: { file: QuoteFile; index: number; labels: QuoteLabels; compact?: boolean; onError: (message: string) => void }) {
  const validUrl = isValidFileUrl(file.displayUrl);
  const openFile = () => {
    if (!validUrl) {
      onError(labels.notFound);
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
      </div>
      {validUrl ? (
        <div className="quote-file-link-actions">
          <button type="button" onClick={openFile}>
            <ExternalLink size={14} />
            <span>{labels.open}</span>
          </button>
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
