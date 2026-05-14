import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { ErrorState } from "../../components/ui/ErrorState";
import { LoadingState } from "../../components/ui/LoadingState";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { calculateQuoteSubtotal, calculateQuoteVat } from "../../constants/quoteStatus";
import { useTranslation } from "../../hooks/useTranslation";
import { quoteService } from "../../services/quoteService";
import type { Quote } from "../../types";
import { formatCurrency } from "../../utils/format";

export function QuoteDetailPage() {
  const { id } = useParams();
  const { t, language } = useTranslation();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setError("");
    if (!id) {
      setIsLoading(false);
      setError(t("common.empty"));
      return;
    }
    quoteService
      .getQuoteById(id)
      .then(result => {
        if (!mounted) return;
        if (result) setQuote(result);
        else setError(t("common.empty"));
      })
      .catch(() => {
        if (mounted) setError(t("common.empty"));
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [id, language, t]);

  if (!id) return <Navigate to="/quotes" replace />;

  async function updateStatus(status: Quote["status"]) {
    if (!quote) return;
    setActionLoading(status);
    setError("");
    try {
      const updated = await quoteService.updateQuoteStatus(quote.id, status);
      setQuote(updated);
    } catch {
      setError(t("common.empty"));
    } finally {
      setActionLoading("");
    }
  }

  if (isLoading) {
    return (
      <section className="page">
        <LoadingState />
      </section>
    );
  }

  if (!quote) {
    return (
      <section className="page">
        <ErrorState message={error || t("common.empty")} />
      </section>
    );
  }

  const subtotal = calculateQuoteSubtotal(quote.items);
  const vat = calculateQuoteVat(subtotal);

  return (
    <section className="page">
      <div className="page-header">
        <h1>{t("quote.detail")}</h1>
        <StatusBadge status={quote.status} />
      </div>
      <Card>
        <h2 className="section-title">{t("quote.company")}</h2>
        <div className="info-row"><span>{t("brand.jp")}</span><strong>{t("brand.en")}</strong></div>
      </Card>
      <Card>
        <div className="info-row"><span>{t("quote.id")}</span><strong>{quote.id}</strong></div>
        <div className="info-row"><span>{t("request.project")}</span><strong>{quote.projectName}</strong></div>
        <div className="info-row"><span>{t("quote.validUntil")}</span><strong>{quote.validUntil}</strong></div>
      </Card>
      <Card>
        <h2 className="section-title">{t("quote.items")}</h2>
        <table className="quote-table">
          <thead>
            <tr>
              <th>{t("quote.items")}</th>
              <th>{t("quote.quantity")}</th>
              <th>{t("quote.unitPrice")}</th>
              <th>{t("quote.lineTotal")}</th>
            </tr>
          </thead>
          <tbody>
            {quote.items.map(item => (
              <tr key={item.name}>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>{formatCurrency(item.unitPrice)}</td>
                <td>{formatCurrency(item.quantity * item.unitPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="summary-row"><span>{t("quote.subtotal")}</span><strong>{formatCurrency(subtotal)}</strong></div>
        <div className="summary-row"><span>{t("quote.vat")}</span><strong>{formatCurrency(vat)}</strong></div>
        <div className="summary-row total"><span>{t("quote.total")}</span><strong>{formatCurrency(subtotal + vat)}</strong></div>
      </Card>
      {error ? <ErrorState message={error} /> : null}
      <div className="two-actions">
        <Button variant="outline" disabled={!!actionLoading} onClick={() => updateStatus("revision_requested")}>
          {actionLoading === "revision_requested" ? t("common.loading") : t("quote.revision")}
        </Button>
        <Button disabled={!!actionLoading} onClick={() => updateStatus("approved")}>
          {actionLoading === "approved" ? t("common.loading") : t("quote.approve")}
        </Button>
      </div>
    </section>
  );
}
