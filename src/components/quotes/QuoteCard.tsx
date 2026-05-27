import { ChevronRight, ReceiptText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../../hooks/useTranslation";
import type { Quote } from "../../types";
import { getQuoteFiles } from "../../utils/quoteFiles";
import { Card } from "../ui/Card";

export function QuoteCard({ quote, onOpen }: { quote: Quote; onOpen?: (quote: Quote) => void }) {
  const { language } = useTranslation();
  const navigate = useNavigate();
  const labels = quoteLabels(language);
  const files = getQuoteFiles(quote);
  const sentAt = quote.quoteSentAt || quote.sentAt || files[0]?.displayDate || quote.createdAt || "";
  const status = quoteResponseStatus(quote, labels);

  function openDetail() {
    if (onOpen) onOpen(quote);
    else navigate(`/quotes/${encodeURIComponent(quote.requestId || quote.quoteCode || quote.id)}`);
  }

  return (
    <Card className="request-card quote-list-card quote-summary-card">
      <button className="quote-summary-button" type="button" onClick={openDetail}>
        <div className="list-icon">
          <ReceiptText size={22} />
        </div>
        <div className="list-body">
          <div className="list-row">
            <span className="list-id">{quote.requestId || quote.quoteCode || quote.id}</span>
            <span className={`quote-file-status ${status.tone}`}>{status.label}</span>
          </div>
          <h3>{quote.projectName || quote.title || "-"}</h3>
          <p><span>{labels.sentAt}</span><span>{sentAt ? formatQuoteDate(sentAt, language) : "-"}</span></p>
          <p><span>{labels.fileCount}</span><span>{files.length}</span></p>
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
      sentAt: "送信日",
      fileCount: "ファイル数"
    };
  }
  return {
    received: "Đã nhận báo giá",
    accepted: "Đã chấp nhận báo giá",
    revisionRequested: "Đã yêu cầu chỉnh sửa",
    sentAt: "Ngày gửi",
    fileCount: "Số file"
  };
}

function quoteResponseStatus(quote: Quote, labels: ReturnType<typeof quoteLabels>) {
  if (quote.quoteResponseStatus === "accepted" || quote.status === "accepted") {
    return { label: labels.accepted, tone: "success" };
  }
  if (quote.quoteResponseStatus === "revision_requested" || quote.status === "revision_requested" || quote.status === "change_requested") {
    return { label: labels.revisionRequested, tone: "warning" };
  }
  return { label: labels.received, tone: "" };
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
