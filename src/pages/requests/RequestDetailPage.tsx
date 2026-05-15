import { MessageCircle, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { QuoteCard } from "../../components/quotes/QuoteCard";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { ErrorState } from "../../components/ui/ErrorState";
import { LoadingState } from "../../components/ui/LoadingState";
import { StatusBadge } from "../../components/ui/StatusBadge";
import type { TranslationKey } from "../../i18n";
import { useTranslation } from "../../hooks/useTranslation";
import { quoteService } from "../../services/quoteService";
import { requestService } from "../../services/requestService";
import { scheduleService } from "../../services/scheduleService";
import type { Quote, RequestMediaFile, Schedule, SupportRequest } from "../../types";
import { categoryOptions } from "./requestHelpers";
import { REQUEST_STATUS_LABEL_KEYS, REQUEST_TIMELINE_MESSAGE_KEYS } from "../../constants/requestStatus";

export function RequestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const [request, setRequest] = useState<SupportRequest | null>(null);
  const [relatedQuotes, setRelatedQuotes] = useState<Quote[]>([]);
  const [relatedSchedules, setRelatedSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [refreshMessage, setRefreshMessage] = useState("");

  const timelineItems = useMemo(() => request ? requestTimelineItems(request) : [], [request]);

  const fetchRequestDetail = useCallback(async () => {
    if (!id) return null;
    const [result, quotes, schedules] = await Promise.all([
      requestService.getRequestById(id),
      quoteService.getQuotesByRequestId(id),
      scheduleService.getSchedulesByRequestId(id)
    ]);
    return { result, quotes, schedules };
  }, [id]);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError("");
    fetchRequestDetail()
      .then(payload => {
        if (!active) return;
        if (!payload?.result) {
          setError(t("common.empty"));
          return;
        }
        setRequest(payload.result);
        setRelatedQuotes(payload.quotes);
        setRelatedSchedules(payload.schedules);
      })
      .catch(() => {
        if (active) setError(t("common.empty"));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [fetchRequestDetail, t]);

  async function refreshRequestDetail() {
    setRefreshMessage(t("request.refreshing"));
    setIsRefreshing(true);
    try {
      const payload = await fetchRequestDetail();
      if (!payload?.result) {
        setRefreshMessage(t("request.refreshFailed"));
        return;
      }
      setRequest(payload.result);
      setRelatedQuotes(payload.quotes);
      setRelatedSchedules(payload.schedules);
      setRefreshMessage(t("request.refreshSuccess"));
    } catch {
      setRefreshMessage(t("request.refreshFailed"));
    } finally {
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    if (!refreshMessage || refreshMessage === t("request.refreshing")) return;
    const timeout = window.setTimeout(() => setRefreshMessage(""), 2600);
    return () => window.clearTimeout(timeout);
  }, [refreshMessage, t]);

  if (!id) return <Navigate to="/requests" replace />;

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
  const mediaItems = requestMediaItems(request);

  return (
    <section className="page request-detail-page">
      <div className="page-header">
        <div>
          <h1>{t("request.detail")}</h1>
        </div>
        <div className="request-detail-actions">
          <StatusBadge status={request.status} />
          <button
            className="request-refresh-button"
            type="button"
            aria-label={t("request.refresh")}
            title={isRefreshing ? t("request.refreshing") : t("request.refresh")}
            disabled={isRefreshing}
            onClick={refreshRequestDetail}
          >
            <RefreshCw size={18} className={isRefreshing ? "spin" : ""} />
          </button>
        </div>
      </div>
      {refreshMessage ? <div className="refresh-message">{refreshMessage}</div> : null}

      <Card>
        <h2 className="section-title">{t("request.info")}</h2>
        <div className="info-grid">
          <InfoRow label={t("request.id")} value={request.requestCode || request.id} />
          <InfoRow label={t("request.subject")} value={request.title} />
          <InfoRow label={t("request.project")} value={request.projectName || request.address} />
          <InfoRow label={t("request.createdAt")} value={request.createdAt} />
          <InfoRow label={t("request.createdBy")} value={request.createdBy || "-"} />
          <InfoRow label={t("request.category")} value={t(categoryLabel)} />
          <InfoRow label={t("request.issue")} value={request.issueTags?.join(", ") || "-"} />
          <InfoRow label={t("request.address")} value={request.address} />
          <InfoRow label={t("request.datetime")} value={request.datetime || "-"} />
          <InfoRow label={t("request.description")} value={request.description} />
        </div>
      </Card>

      <Card>
        <h2 className="section-title">{t("request.images")}</h2>
        <div className="request-media-grid">
          {mediaItems.length
            ? mediaItems.map(media => (
                <div className="request-media-item" key={media.url}>
                  {isVideoMedia(media) ? (
                    <video className="request-media-video" src={media.url} controls playsInline preload="metadata" />
                  ) : (
                    <img className="request-media-thumb" src={media.url} alt={media.name} />
                  )}
                  <div className="request-media-name">{media.name}</div>
                </div>
              ))
            : <div className="muted-line">{t("request.mediaEmpty")}</div>}
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
        <div className="list-row">
          <h2 className="section-title">{t("schedule.related")}</h2>
          <Button variant="outline" onClick={() => navigate(`/schedule?requestId=${request.id}`)}>
            {t("schedule.create")}
          </Button>
        </div>
        <div className="list-stack">
          {relatedSchedules.length ? (
            relatedSchedules.map(schedule => (
              <div className="info-grid" key={schedule.id}>
                <div className="list-row">
                  <span className="list-id">{schedule.id}</span>
                  <StatusBadge status={schedule.status} />
                </div>
                <InfoRow label={t("schedule.date")} value={schedule.date} />
                <InfoRow label={t("schedule.time")} value={schedule.time} />
                <InfoRow label={t("schedule.technician")} value={schedule.technician} />
              </div>
            ))
          ) : (
            <div className="muted-line">{t("common.empty")}</div>
          )}
        </div>
      </Card>

      <Card>
        <h2 className="section-title">{t("request.timeline")}</h2>
        <div className="timeline request-timeline-list">
          {timelineItems.map(item => {
            const statusLabel = t(item.labelKey);
            const note = visibleTimelineNote(item.note, statusLabel);
            return (
              <div className="timeline-item done request-timeline-item" key={item.id}>
                <div className="timeline-dot request-timeline-dot">{null}</div>
                <div className="timeline-text request-timeline-content">
                  <strong className="request-timeline-status">{statusLabel}</strong>
                  {item.createdAt ? <span className="request-timeline-time">{formatTimelineDate(item.createdAt, language)}</span> : null}
                  {note ? <em className="request-timeline-note">{note}</em> : null}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <h2 className="section-title">{t("request.adminReplyTitle")}</h2>
        <div className="admin-reply-box">
          {request.adminReply?.trim() || t("request.adminReplyEmpty")}
        </div>
      </Card>

      {error ? <ErrorState message={error} /> : null}

      <Button icon={<MessageCircle size={18} />}>{t("request.support")}</Button>
    </section>
  );
}

type DetailMedia = RequestMediaFile & { url: string; name: string };
type DetailTimelineItem = {
  id: string;
  labelKey: TranslationKey;
  createdAt: string;
  note: string;
};

function requestTimelineItems(request: SupportRequest): DetailTimelineItem[] {
  const source = Array.isArray(request.timeline) && request.timeline.length
    ? request.timeline
    : [{
        id: `status-${request.status}`,
        type: request.status,
        message: REQUEST_TIMELINE_MESSAGE_KEYS[request.status],
        createdAt: request.createdAt
      }];
  const byStatus = new Map<string, DetailTimelineItem>();

  source
    .map(event => {
      const status = normalizeTimelineStatus(event.type || event.status || request.status, request.status);
      return {
        id: event.id || `tl-${status}-${event.createdAt || request.createdAt}`,
        status,
        labelKey: REQUEST_TIMELINE_MESSAGE_KEYS[status] || REQUEST_STATUS_LABEL_KEYS[status],
        createdAt: event.createdAt || request.createdAt,
        note: event.note || ""
      };
    })
    .sort((left, right) => dateValue(left.createdAt) - dateValue(right.createdAt))
    .forEach(item => {
      const previous = byStatus.get(item.status);
      if (!previous || dateValue(item.createdAt) >= dateValue(previous.createdAt)) {
        byStatus.set(item.status, item);
      }
    });

  const currentStatus = normalizeTimelineStatus(request.status, request.status);
  if (!byStatus.has(currentStatus)) {
    byStatus.set(currentStatus, {
      id: `status-${currentStatus}`,
      labelKey: REQUEST_TIMELINE_MESSAGE_KEYS[currentStatus] || REQUEST_STATUS_LABEL_KEYS[currentStatus],
      createdAt: request.createdAt,
      note: ""
    });
  }

  return Array.from(byStatus.values()).sort((left, right) => dateValue(left.createdAt) - dateValue(right.createdAt));
}

function normalizeTimelineStatus(status: string, currentStatus?: string) {
  if (status === "waiting_customer" && (currentStatus === "estimating" || currentStatus === "quoted")) {
    return currentStatus;
  }
  if (status === "pending" || status === "new" || status === "unhandled") return "untreated";
  if (status === "contacted") return "received";
  if (status === "quote" || status === "estimate") return "quoted";
  if (status === "quoting" || status === "estimate_pending") return "estimating";
  if (status === "order" || status === "accepted") return "ordered";
  if (status === "failed") return "lost";
  if (status in REQUEST_TIMELINE_MESSAGE_KEYS) return status as keyof typeof REQUEST_TIMELINE_MESSAGE_KEYS;
  return "untreated";
}

function dateValue(value: string) {
  const timestamp = parseTimelineDate(value)?.getTime() ?? 0;
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function parseTimelineDate(value: string) {
  if (!value) return null;
  const direct = new Date(value);
  if (!Number.isNaN(direct.getTime())) return direct;

  const match = value.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})(?:,\s*|\s+)?(\d{1,2})?:?(\d{2})?:?(\d{2})?/);
  if (!match) return null;

  const first = Number(match[1]);
  const second = Number(match[2]);
  const year = Number(match[3]);
  const day = first > 12 ? first : second;
  const month = first > 12 ? second : first;
  const hour = Number(match[4] || 0);
  const minute = Number(match[5] || 0);
  const secondValue = Number(match[6] || 0);
  return new Date(year, month - 1, day, hour, minute, secondValue);
}

function formatTimelineDate(value: string, language: "vi" | "ja") {
  const date = parseTimelineDate(value);
  if (!date) return value;
  const pad = (number: number) => String(number).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());
  const second = pad(date.getSeconds());
  return language === "ja"
    ? `${year}/${month}/${day} ${hour}:${minute}`
    : `${hour}:${minute}:${second} ${day}/${month}/${year}`;
}

function visibleTimelineNote(note: string, statusLabel: string) {
  const value = note.trim();
  if (!value) return "";
  const normalizedNote = value.toLowerCase();
  const normalizedStatus = statusLabel.trim().toLowerCase();
  if (normalizedNote === normalizedStatus) return "";
  return value;
}

function requestMediaItems(request: SupportRequest): DetailMedia[] {
  const source = request.mediaFiles?.length
    ? request.mediaFiles
    : request.mediaUrl
      ? [{ url: request.mediaUrl, type: request.mediaType }]
      : request.image
        ? [{ url: request.image, type: "image" }]
        : request.images.map(url => ({ url, type: mediaTypeFromUrl(url) }));

  return source
    .map(item => {
      const url = item.secureUrl || item.url || "";
      if (!url) return null;
      return {
        ...item,
        url,
        name: item.originalName || mediaNameFromUrl(url)
      };
    })
    .filter((item): item is DetailMedia => Boolean(item));
}

function isVideoMedia(media: RequestMediaFile) {
  const value = `${media.resourceType || ""} ${media.type || ""} ${media.mimetype || ""} ${media.url || ""}`;
  return /video|\.mp4|\.mov|\.webm|\.m4v/i.test(value);
}

function mediaTypeFromUrl(url: string) {
  return /(\.mp4|\.mov|\.webm|\.m4v)(\?|$)/i.test(url) ? "video" : "image";
}

function mediaNameFromUrl(url: string) {
  try {
    const pathname = new URL(url).pathname;
    return decodeURIComponent(pathname.split("/").pop() || "media");
  } catch {
    return url.split("/").pop() || "media";
  }
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="info-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
