import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useNavigate, useParams } from "react-router-dom";
import { ActionConfirmModal } from "../../components/ActionConfirmModal";
import { AppToast } from "../../components/AppToast";
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
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(null);

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

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  if (!id) return <Navigate to="/quotes" replace />;

  async function updateStatus(status: "accepted" | "change_requested" | "rejected") {
    if (!quote) return;
    setActionLoading(status);
    setError("");
    try {
      const updated = status === "accepted"
        ? await quoteService.approveQuote(quote.id)
        : status === "rejected"
          ? await quoteService.rejectQuote(quote.id)
          : await quoteService.requestRevision(quote.id);
      setQuote(updated);
    } catch {
      setError(t("common.empty"));
    } finally {
      setActionLoading("");
    }
  }

  async function confirmDeleteQuote() {
    if (!quote) return;
    try {
      await quoteService.deleteQuote(quote.id);
      setToast({ message: t("quote.deleteSuccess"), tone: "success" });
      window.setTimeout(() => navigate("/quotes"), 360);
    } catch {
      setToast({ message: t("quote.deleteError"), tone: "error" });
    } finally {
      setIsDeleteConfirmOpen(false);
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

  const isFileQuote = Boolean(quote.fileUrl);
  const requestNo = quote.requestNo || quote.requestCode || quote.quoteCode || quote.requestId || quote.id;
  const subtotal = calculateQuoteSubtotal(quote.items);
  const vat = quote.taxAmount ?? calculateQuoteVat(subtotal);
  const total = quote.total ?? subtotal + vat;
  const actionLabel = {
    accepted: language === "ja" ? "承認" : "Đồng ý",
    rejected: language === "ja" ? "却下" : "Từ chối",
    change_requested: language === "ja" ? "修正依頼" : "Yêu cầu chỉnh sửa"
  };

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
        <div className="info-row"><span>{t("quote.id")}</span><strong>{requestNo}</strong></div>
        <div className="info-row"><span>{t("request.project")}</span><strong>{quote.projectName}</strong></div>
        {isFileQuote ? (
          <>
            <div className="info-row"><span>{t("quote.items")}</span><strong>{quote.originalName || quote.fileName || "-"}</strong></div>
            {quote.fileUrl ? <Button variant="outline" onClick={() => window.open(quote.fileUrl, "_blank", "noopener")}>Xem file</Button> : null}
          </>
        ) : (
          <div className="info-row"><span>{t("quote.validUntil")}</span><strong>{quote.validUntil}</strong></div>
        )}
      </Card>
      {!isFileQuote ? <Card>
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
                <td>{formatCurrency(item.amount ?? item.quantity * item.unitPrice - (item.discount || 0))}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="summary-row"><span>{t("quote.subtotal")}</span><strong>{formatCurrency(subtotal)}</strong></div>
        <div className="summary-row"><span>{t("quote.vat")}</span><strong>{formatCurrency(vat)}</strong></div>
        <div className="summary-row total"><span>{t("quote.total")}</span><strong>{formatCurrency(total)}</strong></div>
      </Card> : null}
      {error ? <ErrorState message={error} /> : null}
      <div className="two-actions">
        <Button variant="outline" disabled={!!actionLoading} onClick={() => updateStatus("change_requested")}>
          {actionLoading === "change_requested" ? t("common.loading") : actionLabel.change_requested}
        </Button>
        <Button variant="outline" disabled={!!actionLoading} onClick={() => updateStatus("rejected")}>
          {actionLoading === "rejected" ? t("common.loading") : actionLabel.rejected}
        </Button>
        <Button disabled={!!actionLoading} onClick={() => updateStatus("accepted")}>
          {actionLoading === "accepted" ? t("common.loading") : actionLabel.accepted}
        </Button>
      </div>
      <Button variant="danger" icon={<Trash2 size={18} />} onClick={() => setIsDeleteConfirmOpen(true)}>
        {t("quote.deleteAction")}
      </Button>
      <ActionConfirmModal
        open={isDeleteConfirmOpen}
        title={t("quote.deleteTitle")}
        message={t("quote.deleteConfirmText")}
        confirmLabel={t("common.delete")}
        onCancel={() => setIsDeleteConfirmOpen(false)}
        onConfirm={confirmDeleteQuote}
      />
      {toast ? <AppToast message={toast.message} tone={toast.tone} /> : null}
    </section>
  );
}
