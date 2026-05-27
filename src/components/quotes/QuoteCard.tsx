import { ChevronRight, ReceiptText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../../hooks/useTranslation";
import type { Quote, QuoteFile } from "../../types";
import { getQuoteFiles } from "../../utils/quoteFiles";
import { Card } from "../ui/Card";

type QuoteCardLabels = ReturnType<typeof quoteLabels>;

export function QuoteCard({ quote, onOpen }: { quote: Quote; onOpen?: (quote: Quote) => void }) {
  const { language } = useTranslation();
  const navigate = useNavigate();
  const labels = quoteLabels(language);
  const files = getQuoteFiles(quote);
  const requestCode = getRequestCode(quote, labels);
  const title = getRequestTitle(quote, labels);
  const quoteDate = getQuoteDate(quote, files, labels, language);
  const status = getQuoteStatus(quote, files, labels);
  const detailId = getDetailId(quote);

  function openDetail() {
    if (onOpen) onOpen(quote);
    else navigate(`/quotes/${encodeURIComponent(detailId)}`);
  }

  return (
    <Card className="request-card quote-list-card quote-summary-card">
      <button className="quote-summary-button" type="button" onClick={openDetail} aria-label={`${labels.openDetail}: ${requestCode}`}>
        <div className="list-icon">
          <ReceiptText size={22} />
        </div>
        <div className="list-body">
          <div className="list-row">
            <span className="list-id">{requestCode}</span>
            <span className={`quote-file-status ${status.tone}`}>{status.label}</span>
          </div>
          <h3>{title}</h3>
          <p>
            <span>{labels.sentAt}</span>
            <span>{quoteDate}</span>
          </p>
          <p>
            <span>{labels.fileCount}</span>
            <span>{files.length}</span>
          </p>
        </div>
        <ChevronRight size={18} className="quote-summary-chevron" />
      </button>
    </Card>
  );
}

function quoteLabels(language: string) {
  if (language === "ja") {
    return {
      received: "見積受信済み",
      accepted: "見積承認済み",
      revisionRequested: "修正依頼送信済み",
      none: "見積はまだありません",
      sentAt: "送信日",
      fileCount: "ファイル数",
      noCode: "YMD-未設定",
      noTitle: "タイトル未設定",
      noDate: "送信日未設定",
      openDetail: "見積詳細を開く"
    };
  }
  return {
    received: "Đã nhận báo giá",
    accepted: "Đã chấp nhận báo giá",
    revisionRequested: "Đã yêu cầu chỉnh sửa",
    none: "Chưa có báo giá",
    sentAt: "Ngày gửi",
    fileCount: "Số file",
    noCode: "Không có mã",
    noTitle: "Không có tiêu đề",
    noDate: "Chưa có ngày gửi",
    openDetail: "Mở chi tiết báo giá"
  };
}

function getRequestCode(quote: Quote, labels: QuoteCardLabels) {
  const item = quote as Quote & Record<string, unknown>;
  return safeText(item.requestCode || item.code || item.requestNo || item.displayId || quote.requestId || quote.quoteCode || quote.id, labels.noCode);
}

function getRequestTitle(quote: Quote, labels: QuoteCardLabels) {
  const item = quote as Quote & Record<string, unknown>;
  return safeText(quote.title || item.requestTitle || item.subject || quote.projectName || quote.content || quote.description, labels.noTitle);
}

function getQuoteDate(quote: Quote, files: QuoteFile[], labels: QuoteCardLabels, language: string) {
  const item = quote as Quote & Record<string, unknown>;
  const value = safeText(
    quote.quoteSentAt || item.quoteUpdatedAt || quote.sentAt || quote.sentToCustomerAt || files[0]?.sentAt || files[0]?.uploadedAt || files[0]?.createdAt || quote.updatedAt || quote.createdAt,
    ""
  );
  return value ? formatQuoteDate(value, language) : labels.noDate;
}

function getQuoteStatus(quote: Quote, files: QuoteFile[], labels: QuoteCardLabels) {
  if (quote.quoteResponseStatus === "accepted" || quote.status === "accepted") {
    return { label: labels.accepted, tone: "success" };
  }
  if (quote.quoteResponseStatus === "revision_requested" || quote.status === "revision_requested" || quote.status === "change_requested") {
    return { label: labels.revisionRequested, tone: "warning" };
  }
  if (quote.quoteSent === true || files.length > 0) {
    return { label: labels.received, tone: "" };
  }
  return { label: labels.none, tone: "muted" };
}

function getDetailId(quote: Quote) {
  const item = quote as Quote & Record<string, unknown>;
  return safeText(quote.requestId || quote.quoteCode || quote.id || item.requestCode || item.code || item.requestNo, "unknown");
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
