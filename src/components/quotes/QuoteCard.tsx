import { ChevronRight, ReceiptText, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { calculateQuoteTotal } from "../../constants/quoteStatus";
import { useTranslation } from "../../hooks/useTranslation";
import type { Quote } from "../../types";
import { formatCurrency } from "../../utils/format";
import { Card } from "../ui/Card";
import { StatusBadge } from "../ui/StatusBadge";

export function QuoteCard({ quote, onDelete }: { quote: Quote; onDelete?: (quote: Quote) => void }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const requestNo = quote.requestNo || quote.requestCode || quote.quoteCode || quote.requestId || quote.id;
  const isFileQuote = Boolean(quote.fileUrl);

  return (
    <Card className="request-card quote-list-card" onClick={() => navigate(`/quotes/${quote.id}`)}>
      <div className="list-icon">
        <ReceiptText size={22} />
      </div>
      <div className="list-body">
        <div className="list-row">
          <span className="list-id">{requestNo}</span>
          <StatusBadge status={quote.status} />
        </div>
        <h3>{quote.projectName}</h3>
        {isFileQuote ? (
          <p><span>{t("quote.id")}</span><span>{quote.originalName || quote.fileName}</span></p>
        ) : (
          <>
            <p>
              <span>{t("quote.amount")}</span>
              <span>{formatCurrency(quote.total ?? calculateQuoteTotal(quote.items))}</span>
            </p>
            <p>
              <span>{t("quote.validUntil")}</span>
              <span>{quote.validUntil}</span>
            </p>
          </>
        )}
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
      </div>
      <ChevronRight className="list-arrow" size={18} />
    </Card>
  );
}
