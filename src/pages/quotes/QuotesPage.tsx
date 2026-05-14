import { useNavigate } from "react-router-dom";
import { Card } from "../../components/ui/Card";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { useTranslation } from "../../hooks/useTranslation";
import { useAppStore } from "../../stores/appStore";
import { formatCurrency } from "../../utils/format";

export function QuotesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const quotes = useAppStore(state => state.quotes);

  return (
    <section className="page">
      <div className="page-header"><h1>{t("quote.title")}</h1></div>
      <h2 className="section-title">{t("quote.list")}</h2>
      <div className="list-stack">
        {quotes.map(quote => {
          const total = quote.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0) * 1.1;
          return (
            <Card className="quote-card" key={quote.id} onClick={() => navigate(`/quotes/${quote.id}`)}>
              <div className="list-row">
                <span className="list-id">{quote.id}</span>
                <StatusBadge status={quote.status} />
              </div>
              <h3>{quote.projectName}</h3>
              <p>{formatCurrency(Math.round(total))}</p>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
