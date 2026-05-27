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

  const pageTitle = language === "ja" ? "見積" : "Báo giá";
  const listTitle = language === "ja" ? "見積一覧" : "Danh sách báo giá";
  const emptyMessage = language === "ja" ? "見積はまだありません。" : "Chưa có báo giá.";

  return (
    <section className="page">
      <div className="page-header">
        <h1>{pageTitle}</h1>
      </div>
      <h2 className="section-title">{listTitle}</h2>
      <div className="list-stack">
        {isLoading ? <LoadingState /> : null}
        {!isLoading && error ? <ErrorState message={error} /> : null}
        {!isLoading && !error && quotes.length ? quotes.map(quote => (
          <QuoteCard
            key={getQuoteDetailId(quote)}
            quote={quote}
            onOpen={item => navigate(`/quotes/${encodeURIComponent(getQuoteDetailId(item))}`)}
          />
        )) : null}
        {!isLoading && !error && !quotes.length ? <EmptyState message={t("quote.empty") || emptyMessage} /> : null}
      </div>
    </section>
  );
}

function getQuoteDetailId(quote: Quote) {
  const item = quote as Quote & Record<string, unknown>;
  return String(quote.requestId || quote.quoteCode || quote.id || item.requestCode || item.code || item.requestNo || "unknown");
}
