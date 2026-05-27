import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QuoteCard, getQuoteDetailId } from "../../components/quotes/QuoteCard";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { LoadingState } from "../../components/ui/LoadingState";
import { useTranslation } from "../../hooks/useTranslation";
import { quoteService } from "../../services/quoteService";
import type { Quote } from "../../types";
import { groupQuotesByRequest } from "../../utils/quoteFiles";

export function QuotesPage() {
  const { language } = useTranslation();
  const navigate = useNavigate();
  const labels = pageLabels(language);
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
        const grouped = groupQuotesByRequest(result);
        if (mounted) setQuotes(grouped);
      })
      .catch(errorValue => {
        console.warn("[CUSTOMER_QUOTES_ERROR]", errorValue);
        if (mounted) setError(labels.loadError);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [language, labels.loadError]);

  return (
    <section className="page customer-quotes-page-v20260528">
      <div className="page-header">
        <h1>{labels.title}</h1>
      </div>
      <h2 className="section-title">{labels.listTitle}</h2>

      {isLoading ? <LoadingState /> : null}
      {!isLoading && error ? <ErrorState message={error} /> : null}
      {!isLoading && !error && (!quotes || quotes.length === 0) ? <EmptyState message={labels.empty} /> : null}
      {!isLoading && !error && quotes?.length ? (
        <div className="customer-quote-list-v20260528">
          {quotes.map(item => (
            <QuoteCard
              key={getQuoteDetailId(item)}
              quote={item}
              onOpen={quote => navigate(`/quotes/${encodeURIComponent(getQuoteDetailId(quote))}`)}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function pageLabels(language: string) {
  if (language === "ja") {
    return {
      title: "\u898b\u7a4d",
      listTitle: "\u898b\u7a4d\u4e00\u89a7",
      empty: "\u898b\u7a4d\u306f\u307e\u3060\u3042\u308a\u307e\u305b\u3093\u3002",
      loadError: "\u898b\u7a4d\u3092\u8aad\u307f\u8fbc\u3081\u307e\u305b\u3093\u3067\u3057\u305f\u3002"
    };
  }
  return {
    title: "B\u00e1o gi\u00e1",
    listTitle: "Danh s\u00e1ch b\u00e1o gi\u00e1",
    empty: "Ch\u01b0a c\u00f3 b\u00e1o gi\u00e1.",
    loadError: "Kh\u00f4ng th\u1ec3 t\u1ea3i danh s\u00e1ch b\u00e1o gi\u00e1."
  };
}
