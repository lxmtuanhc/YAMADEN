import { MessageCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { Timeline } from "../../components/Timeline";
import { QuoteCard } from "../../components/quotes/QuoteCard";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { ErrorState } from "../../components/ui/ErrorState";
import { LoadingState } from "../../components/ui/LoadingState";
import { StatusBadge } from "../../components/ui/StatusBadge";
import type { TranslationKey } from "../../i18n";
import { useTranslation } from "../../hooks/useTranslation";
import { REQUEST_UPDATE_ACTIONS } from "../../constants/requestStatus";
import { quoteService } from "../../services/quoteService";
import { requestService } from "../../services/requestService";
import type { Quote, SupportRequest } from "../../types";
import { categoryOptions } from "./requestHelpers";

export function RequestDetailPage() {
  const { id } = useParams();
  const { t, language } = useTranslation();
  const [request, setRequest] = useState<SupportRequest | null>(null);
  const [relatedQuotes, setRelatedQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");

  const timelineSteps = useMemo(
    () => request?.timeline.map(event => t(event.message as TranslationKey)) || [],
    [request, t]
  );

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setError("");
    if (!id) {
      setIsLoading(false);
      setError(t("common.empty"));
      return;
    }
    Promise.all([requestService.getRequestById(id), quoteService.getQuotesByRequestId(id)])
      .then(([result, quotes]) => {
        if (!mounted) return;
        if (result) setRequest(result);
        else setError(t("common.empty"));
        setRelatedQuotes(quotes);
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

  if (!id) return <Navigate to="/requests" replace />;

  async function addEvent(status: SupportRequest["status"]) {
    if (!request) return;
    setActionLoading(status);
    setError("");
    try {
      const updated = await requestService.addTimelineEvent(request.id, { type: status });
      setRequest(updated);
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

  if (!request) {
    return (
      <section className="page">
        <ErrorState message={error || t("common.empty")} />
      </section>
    );
  }

  const categoryLabel = categoryOptions.find(option => option.value === request.category)?.key ?? "request.categoryElectrical";

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h1>{t("request.detail")}</h1>
        </div>
        <StatusBadge status={request.status} />
      </div>

      <Card>
        <h2 className="section-title">{t("request.info")}</h2>
        <div className="info-grid">
          <InfoRow label={t("request.id")} value={request.id} />
          <InfoRow label={t("request.subject")} value={request.title} />
          <InfoRow label={t("request.project")} value={request.projectName || request.address} />
          <InfoRow label={t("request.createdAt")} value={request.createdAt} />
          <InfoRow label={t("request.createdBy")} value={request.createdBy || "-"} />
          <InfoRow label={t("request.category")} value={t(categoryLabel)} />
          <InfoRow label={t("request.address")} value={request.address} />
          <InfoRow label={t("request.datetime")} value={request.datetime || "-"} />
          <InfoRow label={t("request.description")} value={request.description} />
        </div>
      </Card>

      <Card>
        <h2 className="section-title">{t("request.images")}</h2>
        <div className="image-grid">
          {request.images.length
            ? request.images.map(image => (
                <div className="image-tile" key={image}>
                  {image}
                </div>
              ))
            : <div className="muted-line">{t("common.empty")}</div>}
        </div>
      </Card>

      {relatedQuotes.length ? (
        <Card>
          <h2 className="section-title">{t("quote.related")}</h2>
          <div className="list-stack">
            {relatedQuotes.map(quote => (
              <QuoteCard key={quote.id} quote={quote} />
            ))}
          </div>
        </Card>
      ) : null}

      <Card>
        <h2 className="section-title">{t("request.timeline")}</h2>
        <Timeline steps={timelineSteps} activeIndex={timelineSteps.length - 1} />
      </Card>

      <Card>
        {error ? <ErrorState message={error} /> : null}
        <div className="action-grid">
          {REQUEST_UPDATE_ACTIONS.map(action => (
            <Button key={action.status} variant="outline" disabled={!!actionLoading} onClick={() => addEvent(action.status)}>
              {actionLoading === action.status ? t("common.loading") : t(action.labelKey)}
            </Button>
          ))}
        </div>
      </Card>

      <Button icon={<MessageCircle size={18} />}>{t("request.support")}</Button>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="info-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
