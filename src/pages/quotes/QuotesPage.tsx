import { useEffect, useState } from "react";
import { ActionConfirmModal } from "../../components/ActionConfirmModal";
import { AppToast } from "../../components/AppToast";
import { QuoteCard } from "../../components/quotes/QuoteCard";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { LoadingState } from "../../components/ui/LoadingState";
import { useTranslation } from "../../hooks/useTranslation";
import { quoteService } from "../../services/quoteService";
import type { Quote } from "../../types";

export function QuotesPage() {
  const { t, language } = useTranslation();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Quote | null>(null);
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(null);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setError("");
    quoteService
      .getQuotes()
      .then(result => {
        if (mounted) setQuotes(result);
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
  }, [language, t]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await quoteService.deleteQuote(deleteTarget.id);
      setQuotes(current => current.filter(quote => quote.id !== deleteTarget.id && quote.quoteCode !== deleteTarget.quoteCode));
      setToast({ message: t("quote.deleteSuccess"), tone: "success" });
    } catch {
      setToast({ message: t("quote.deleteError"), tone: "error" });
    } finally {
      setDeleteTarget(null);
    }
  }

  return (
    <section className="page">
      <div className="page-header"><h1>{t("quote.title")}</h1></div>
      <h2 className="section-title">{t("quote.list")}</h2>
      <div className="list-stack">
        {isLoading ? <LoadingState /> : null}
        {!isLoading && error ? <ErrorState message={error} /> : null}
        {!isLoading && !error && quotes.length ? quotes.map(quote => <QuoteCard key={quote.id} quote={quote} onDelete={setDeleteTarget} />) : null}
        {!isLoading && !error && !quotes.length ? <EmptyState message={t("quote.empty")} /> : null}
      </div>
      <ActionConfirmModal
        open={Boolean(deleteTarget)}
        title={t("quote.deleteTitle")}
        message={t("quote.deleteConfirmText")}
        confirmLabel={t("common.delete")}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
      {toast ? <AppToast message={toast.message} tone={toast.tone} /> : null}
    </section>
  );
}
