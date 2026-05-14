import { ChevronRight, ReceiptText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { calculateQuoteTotal } from "../../constants/quoteStatus";
import { useTranslation } from "../../hooks/useTranslation";
import type { Quote } from "../../types";
import { formatCurrency } from "../../utils/format";
import { Card } from "../ui/Card";
import { StatusBadge } from "../ui/StatusBadge";

export function QuoteCard({ quote }: { quote: Quote }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Card className="request-card quote-list-card" onClick={() => navigate(`/quotes/${quote.id}`)}>
      <div className="list-icon">
        <ReceiptText size={22} />
      </div>
      <div className="list-body">
        <div className="list-row">
          <span className="list-id">{quote.id}</span>
          <StatusBadge status={quote.status} />
        </div>
        <h3>{quote.projectName}</h3>
        <p>
          <span>{t("quote.amount")}</span>
          <span>{formatCurrency(calculateQuoteTotal(quote.items))}</span>
        </p>
        <p>
          <span>{t("quote.validUntil")}</span>
          <span>{quote.validUntil}</span>
        </p>
      </div>
      <ChevronRight className="list-arrow" size={18} />
    </Card>
  );
}
