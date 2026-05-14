import { useParams } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { useTranslation } from "../../hooks/useTranslation";
import { useAppStore } from "../../stores/appStore";
import { formatCurrency } from "../../utils/format";

export function QuoteDetailPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const quote = useAppStore(state => state.quotes.find(item => item.id === id));
  const updateQuoteStatus = useAppStore(state => state.updateQuoteStatus);

  if (!quote) return null;
  const subtotal = quote.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const vat = Math.round(subtotal * 0.1);

  return (
    <section className="page">
      <div className="page-header">
        <h1>{t("quote.detail")}</h1>
        <StatusBadge status={quote.status} />
      </div>
      <Card>
        <div className="info-row"><span>{t("quote.id")}</span><strong>{quote.id}</strong></div>
        <div className="info-row"><span>{t("request.project")}</span><strong>{quote.projectName}</strong></div>
      </Card>
      <Card>
        <h2 className="section-title">{t("quote.items")}</h2>
        <table className="quote-table">
          <tbody>
            {quote.items.map(item => (
              <tr key={item.name}>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>{formatCurrency(item.unitPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="summary-row"><span>{t("quote.subtotal")}</span><strong>{formatCurrency(subtotal)}</strong></div>
        <div className="summary-row"><span>{t("quote.vat")}</span><strong>{formatCurrency(vat)}</strong></div>
        <div className="summary-row total"><span>{t("quote.total")}</span><strong>{formatCurrency(subtotal + vat)}</strong></div>
      </Card>
      <div className="two-actions">
        <Button variant="outline" onClick={() => updateQuoteStatus(quote.id, "revision_requested")}>{t("quote.revision")}</Button>
        <Button onClick={() => updateQuoteStatus(quote.id, "approved")}>{t("quote.approve")}</Button>
      </div>
    </section>
  );
}
