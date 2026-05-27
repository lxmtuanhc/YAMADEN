import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QuoteCard } from "../../components/quotes/QuoteCard";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { LoadingState } from "../../components/ui/LoadingState";
import { useTranslation } from "../../hooks/useTranslation";
import { quoteService } from "../../services/quoteService";
import type { Quote } from "../../types";
import { groupQuotesByRequest } from "../../utils/quoteFiles";

export function QuotesPage() {
  const { t, language } = useTranslation();
  const navigate = useNavigate();
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
        if (mounted) setQuotes(groupQuotesByRequest(result));
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
      <div className="page-header">
        <h1>{language === "ja" ? "見積" : "Báo giá"}</h1>
      </div>
      <h2 className="section-title">{language === "ja" ? "見積一覧" : "Danh sách báo giá"}</h2>
      <div className="list-stack">
        {isLoading ? <LoadingState /> : null}
        {!isLoading && error ? <ErrorState message={error} /> : null}
        {!isLoading && !error && quotes.length ? quotes.map(quote => (
          <QuoteCard
            key={quote.requestId || quote.id}
            quote={quote}
            onOpen={item => navigate(`/quotes/${encodeURIComponent(item.requestId || item.quoteCode || item.id)}`)}
          />
        )) : null}
        {!isLoading && !error && !quotes.length ? <EmptyState message={t("quote.empty")} /> : null}
      </div>
    </section>
  );
}
