import { useEffect, useState } from "react";
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

  return (
    <section className="page">
      <div className="page-header"><h1>{t("quote.title")}</h1></div>
      <h2 className="section-title">{t("quote.list")}</h2>
      <div className="list-stack">
        {isLoading ? <LoadingState /> : null}
        {!isLoading && error ? <ErrorState message={error} /> : null}
        {!isLoading && !error && quotes.length ? quotes.map(quote => <QuoteCard key={quote.id} quote={quote} />) : null}
        {!isLoading && !error && !quotes.length ? <EmptyState /> : null}
      </div>
    </section>
  );
}
