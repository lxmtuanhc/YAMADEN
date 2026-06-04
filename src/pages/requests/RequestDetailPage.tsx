import { ChevronRight, Download, ExternalLink, MessageCircle, RefreshCw, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { ActionConfirmModal } from "../../components/ActionConfirmModal";
import { AppToast } from "../../components/AppToast";
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
import type { AssigneeRequestHistoryItem, Quote, RequestAssignee, RequestMediaFile, Schedule, StaffProfile, SupportRequest, TimelineEvent } from "../../types";
import { groupQuotesByRequest } from "../../utils/quoteFiles";
import { formatRequestFileSize, normalizeRequestFiles, requestFileKind, requestFileName, requestFileUrl } from "../../utils/requestFiles";
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
  const [isAssigneeModalOpen, setIsAssigneeModalOpen] = useState(false);
  const [assigneeHistory, setAssigneeHistory] = useState<AssigneeRequestHistoryItem[]>([]);
  const [assigneeProfile, setAssigneeProfile] = useState<StaffProfile | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(null);

  const timelineItems = useMemo(() => request ? requestTimelineItems(request) : [], [request]);
  const assignee = useMemo(() => request ? requestAssignee(request, assigneeProfile) : null, [request, assigneeProfile]);

  useEffect(() => {
    if (!isAssigneeModalOpen) return undefined;
    document.body.classList.add("modal-open");
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [isAssigneeModalOpen]);

  const fetchRequestDetail = useCallback(async () => {
    if (!id) return null;
    const result = await requestService.getRequestById(id);
    const quoteKeys = [id, result?.requestCode, result?.id].filter(Boolean) as string[];
    const [quoteGroups, schedules] = await Promise.all([
      Promise.all([...new Set(quoteKeys)].map(key => quoteService.getQuotesByRequestId(key))),
      scheduleService.getSchedulesByRequestId(id)
    ]);
    const quotes = groupQuotesByRequest(quoteGroups.flat().filter((quote, index, list) => list.findIndex(item => item.id === quote.id) === index));
    const [profile, history] = result
      ? await Promise.all([
          requestService.getAssigneeProfile(result),
          requestService.getAssigneeHistory(result)
        ])
      : [null, []];
    return { result, quotes, schedules, profile, history };
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
        setAssigneeProfile(payload.profile);
        setAssigneeHistory(payload.history);
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
      setAssigneeProfile(payload.profile);
      setAssigneeHistory(payload.history);
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

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  async function confirmDeleteRequest() {
    if (!request) return;
    try {
      await requestService.deleteRequest(request.id);
      setToast({ message: t("request.deleteSuccess"), tone: "success" });
      window.setTimeout(() => navigate("/requests"), 360);
    } catch {
      setToast({ message: t("request.deleteError"), tone: "error" });
    } finally {
      setIsDeleteConfirmOpen(false);
    }
  }

  async function requestQuote() {
    if (!request) return;
    try {
      const updated = await requestService.requestQuote(request.id);
      setRequest(updated);
      setToast({
        message: language === "ja" ? "見積依頼を送信しました" : "Đã gửi yêu cầu báo giá",
        tone: "success"
      });
    } catch {
      setToast({
        message: language === "ja" ? "見積依頼を送信できませんでした" : "Không thể gửi yêu cầu báo giá.",
        tone: "error"
      });
    }
  }

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
  const storedQuoteFiles = [...(request.quotationFiles || []), ...(request.quoteFiles || [])];
  const hasSentQuote = request.quoteSent === true || storedQuoteFiles.length > 0 || relatedQuotes.length > 0;
  const canRequestQuote = !hasSentQuote && request.quoteRequested !== true;

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
          <InfoRow label={t("request.description")} value={request.description || (language === "vi" ? "Chưa có mô tả" : "未入力")} />
        </div>
        {!hasSentQuote ? <div className="quote-response-actions">
          <button
            type="button"
            className="media-picker-button"
            disabled={!canRequestQuote}
            onClick={requestQuote}
          >
            {request.quoteRequested ? (language === "ja" ? "見積依頼を送信しました" : "Đã gửi yêu cầu báo giá") : (language === "ja" ? "見積を依頼する" : "Muốn báo giá")}
          </button>
        </div> : null}
      </Card>

      <Card className={`assignee-card${assignee?.name ? " assignee-card-clickable" : ""}`}>
        <button className="assignee-summary" type="button" onClick={assignee?.name ? () => setIsAssigneeModalOpen(true) : undefined} disabled={!assignee?.name}>
          <div className="assignee-summary-avatar" aria-hidden="true">
            {assignee?.avatar ? <img src={assignee.avatar} alt="" /> : assignee?.name ? assignee.name.slice(0, 1).toUpperCase() : "?"}
          </div>
          <div className="assignee-summary-text">
            <span>{t("request.assigneeTitle")}</span>
            {assignee?.name ? (
              <>
                <strong>{assignee.name}</strong>
                {assignee.department ? <em>{assignee.department}</em> : null}
                {assignee.workContents.length ? <small>{assignee.workContents.slice(0, 2).join(", ")}</small> : null}
              </>
            ) : (
              <strong className="assignee-empty">{t("request.assigneeEmpty")}</strong>
            )}
          </div>
          {assignee?.name ? <ChevronRight size={18} /> : null}
        </button>
      </Card>

      <Card>
        <h2 className="section-title">{t("request.attachments")}</h2>
        <div className="request-media-grid">
          {mediaItems.length
            ? mediaItems.map(media => (
                <div className="request-media-item" key={media.url}>
                  {isVideoMedia(media) ? (
                    <video className="request-media-video" src={media.url} controls playsInline preload="metadata" />
                  ) : isImageMedia(media) ? (
                    <img className="request-media-thumb" src={media.url} alt={media.name} />
                  ) : (
                    <div className="request-file-preview">
                      <strong>{media.name}</strong>
                      <span>{language === "vi" ? "File này không thể xem trực tiếp trong app. Vui lòng tải về hoặc mở bằng ứng dụng phù hợp." : "このファイルはアプリ内で直接表示できません。ダウンロードして対応アプリで開いてください。"}</span>
                      <a href={media.url} target="_blank" rel="noreferrer">{language === "vi" ? "Mở / tải file" : "開く / ダウンロード"}</a>
                    </div>
                  )}
                  <div className="request-media-name">{media.name}</div>
                  <div className="request-file-meta">{requestFileMeta(media, language)}</div>
                  <div className="request-file-actions">
                    <a href={media.url} target="_blank" rel="noreferrer">
                      <ExternalLink size={15} />
                      {t("request.openFile")}
                    </a>
                    <a href={media.downloadUrl || media.url} download={media.name}>
                      <Download size={15} />
                      {t("request.downloadFile")}
                    </a>
                  </div>
                </div>
              ))
            : <div className="muted-line">{t("request.mediaEmpty")}</div>}
        </div>
      </Card>

      <Card>
        <h2 className="section-title">{language === "ja" ? "関連見積" : "Báo giá liên quan"}</h2>
        <div className="list-stack">
          {relatedQuotes.length ? relatedQuotes.map(quote => (
            <QuoteCard key={quote.requestId || quote.id} quote={quote} />
          )) : <div className="muted-line">{language === "ja" ? "見積はまだありません" : "Chưa có báo giá"}</div>}
        </div>
      </Card>

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
            const note = visibleTimelineNote(item, statusLabel, language);
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
          {localizedAdminReply(request.adminReply || "", timelineItems, language) || t("request.adminReplyEmpty")}
        </div>
      </Card>

      {error ? <ErrorState message={error} /> : null}

      <div className="two-actions">
        <Button variant="outline" icon={<MessageCircle size={18} />}>{t("request.support")}</Button>
        <Button variant="danger" icon={<Trash2 size={18} />} onClick={() => setIsDeleteConfirmOpen(true)}>{t("request.deleteAction")}</Button>
      </div>

      {isAssigneeModalOpen ? (
        <AssigneeModal
          assignee={assignee}
          historyItems={assigneeHistory}
          language={language}
          t={t}
          onClose={() => setIsAssigneeModalOpen(false)}
        />
      ) : null}
      <ActionConfirmModal
        open={isDeleteConfirmOpen}
        title={t("request.deleteTitle")}
        message={t("request.deleteConfirmText")}
        confirmLabel={t("common.delete")}
        onCancel={() => setIsDeleteConfirmOpen(false)}
        onConfirm={confirmDeleteRequest}
      />
      {toast ? <AppToast message={toast.message} tone={toast.tone} /> : null}
    </section>
  );
}

type DetailMedia = RequestMediaFile & { url: string; name: string };
type DetailTimelineItem = {
  id: string;
  labelKey: TranslationKey;
  createdAt: string;
  note: string;
  actorName: string;
  message: string;
  staffName: string;
};

type SafeAssignee = {
  id: string;
  name: string;
  avatar: string;
  department: string;
  role: string;
  workContents: string[];
  contact: string;
  email: string;
  phone: string;
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
        labelKey: timelineLabelKey(event.message, status),
        createdAt: event.createdAt || request.createdAt,
        note: event.note || "",
        actorName: timelineActorName(event),
        message: event.message || "",
        staffName: event.staffName || ""
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
      labelKey: timelineLabelKey("", currentStatus),
      createdAt: request.createdAt,
      note: "",
      actorName: "",
      message: "",
      staffName: ""
    });
  }

  return Array.from(byStatus.values()).sort((left, right) => dateValue(left.createdAt) - dateValue(right.createdAt));
}

function timelineLabelKey(message: string | undefined, status: string): TranslationKey {
  const key = String(message || "").trim();
  if (key === "request.timelineQuoteApproved" || key === "request.timelineQuoteRevision") {
    return key;
  }
  return REQUEST_TIMELINE_MESSAGE_KEYS[status as keyof typeof REQUEST_TIMELINE_MESSAGE_KEYS] || REQUEST_STATUS_LABEL_KEYS[status as keyof typeof REQUEST_STATUS_LABEL_KEYS];
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

function visibleTimelineNote(item: DetailTimelineItem, statusLabel: string, language: "vi" | "ja") {
  const assignment = assignmentNameFromTimeline(item);
  if (assignment) return assignmentMessage(assignment, language);
  const value = item.note.trim();
  if (!value) return "";
  const normalizedNote = value.toLowerCase();
  const normalizedStatus = statusLabel.trim().toLowerCase();
  if (normalizedNote === normalizedStatus) return "";
  const localized = localizedLegacyTimelineMessage(value, language);
  if (localized) return localized;
  return value;
}

function localizedAdminReply(reply: string, timelineItems: DetailTimelineItem[], language: "vi" | "ja") {
  const assignment = assignmentNameFromLegacyText(reply) || timelineItems.map(assignmentNameFromTimeline).find(Boolean);
  if (assignment) return assignmentMessage(assignment, language);
  return localizedLegacyTimelineMessage(reply, language) || reply.trim();
}

function assignmentNameFromTimeline(item: DetailTimelineItem) {
  return assignmentNameFromLegacyText(item.note) || assignmentNameFromLegacyText(item.message) || cleanText(item.staffName);
}

function assignmentNameFromLegacyText(value: string) {
  const text = cleanText(value);
  if (!text) return "";
  const patterns = [
    /^Phân công phụ trách\s*:\s*(.+)$/i,
    /^Phân công phụ trách\s+(.+)$/i,
    /^担当者を割り当てました[:：]\s*(.+)$/i,
    /^assignment\.assigned[:：]?\s*(.*)$/i
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return cleanText(match[1]);
  }
  return "";
}

function assignmentMessage(staffName: string, language: "vi" | "ja") {
  return language === "ja"
    ? `担当者を割り当てました：${staffName}`
    : `Phân công phụ trách: ${staffName}`;
}

function localizedLegacyTimelineMessage(value: string, language: "vi" | "ja") {
  const text = cleanText(value);
  if (!text) return "";
  const normalized = text.toLowerCase();
  const messages: Record<string, { vi: string; ja: string }> = {
    "đã gửi yêu cầu": { vi: "Đã gửi yêu cầu", ja: "依頼送信済み" },
    "request.timelinesubmitted": { vi: "Đã gửi yêu cầu", ja: "依頼送信済み" },
    "đã tiếp nhận": { vi: "Đã tiếp nhận", ja: "受付済み" },
    "request.timelinereceived": { vi: "Đã tiếp nhận", ja: "受付済み" },
    "chưa xử lý": { vi: "Chưa xử lý", ja: "未対応" },
    "request.timelineuntreated": { vi: "Chưa xử lý", ja: "未対応" },
    "đã gửi báo giá": { vi: "Đã gửi báo giá", ja: "見積送信済み" },
    "request.timelinequoted": { vi: "Đã gửi báo giá", ja: "見積送信済み" },
    "đã hoàn thành": { vi: "Đã hoàn thành", ja: "対応完了" },
    "request.timelinecompleted": { vi: "Đã hoàn thành", ja: "対応完了" },
    "khách yêu cầu chỉnh sửa báo giá": { vi: "Khách yêu cầu chỉnh sửa báo giá", ja: "見積修正依頼" },
    "request.timelinequoterevision": { vi: "Khách yêu cầu chỉnh sửa báo giá", ja: "見積修正依頼" },
    "khách đã chấp nhận báo giá": { vi: "Khách đã chấp nhận báo giá", ja: "見積承認済み" },
    "request.timelinequoteapproved": { vi: "Khách đã chấp nhận báo giá", ja: "見積承認済み" }
  };
  return messages[normalized]?.[language] || "";
}

function requestAssignee(request: SupportRequest, profile?: StaffProfile | null): SafeAssignee | null {
  if (profile?.name) {
    return safeAssigneeFromProfile(profile);
  }
  const candidates = [
    request.assignedStaff,
    request.assignee,
    request.staff,
    request.responsiblePerson,
    request.assignedTo
  ];
  const requestProfile = candidates.map(safeAssigneeFromValue).find(item => item?.name) || null;
  if (requestProfile) return requestProfile;
  const fallbackName = cleanText(request.assigneeName);
  if (!fallbackName) return null;
  return {
    id: cleanText(request.assigneeId),
    name: fallbackName,
    avatar: "",
    department: "",
    role: "",
    workContents: [],
    contact: "",
    email: "",
    phone: "",
    note: ""
  };
}

function safeAssigneeFromProfile(profile: StaffProfile): SafeAssignee {
  const email = cleanText(profile.email);
  const phone = cleanText(profile.phone);
  const workContents = normalizeTextList(profile.workTags?.length ? profile.workTags : profile.workContent);
  return {
    id: cleanText(profile.id),
    name: cleanText(profile.name),
    avatar: cleanText(profile.avatar),
    department: cleanText(profile.department || profile.areas),
    role: cleanText(profile.role || profile.position || profile.title),
    workContents,
    contact: [email, phone].filter(Boolean).join(" / "),
    email,
    phone,
    note: cleanText(profile.note || profile.introduction)
  };
}

function safeAssigneeFromValue(value: RequestAssignee | string | undefined): SafeAssignee | null {
  if (!value) return null;
  if (typeof value === "string") {
    const name = cleanText(value);
    return name ? {
      id: "",
      name,
      avatar: "",
      department: "",
      role: "",
      workContents: [],
      contact: "",
      email: "",
      phone: "",
      note: ""
    } : null;
  }
  const name = cleanText(value.name);
  if (!name) return null;
  const workContents = normalizeTextList(value.workTags?.length ? value.workTags : value.workContent);
  return {
    id: cleanText(value.id || value._id || value.staffId),
    name,
    avatar: cleanText(value.avatar),
    department: cleanText(value.department || value.areas),
    role: cleanText(value.role || value.position || value.title),
    workContents,
    contact: [value.email, value.phone].map(cleanText).filter(Boolean).join(" / "),
    email: cleanText(value.email),
    phone: cleanText(value.phone),
    note: cleanText(value.note || value.introduction)
  };
}

function cleanText(value: unknown) {
  return String(value || "").trim();
}

function normalizeTextList(value: unknown) {
  const source = Array.isArray(value) ? value : cleanText(value).split(/[,;、；\n\r]+/);
  const seen = new Set<string>();
  const items: string[] = [];

  source
    .flatMap(item => Array.isArray(item) ? item : String(item || "").split(/[,;、；\n\r]+/))
    .map(item => item.trim())
    .filter(Boolean)
    .forEach(item => {
      const key = normalizedListKey(item);
      if (seen.has(key)) return;
      seen.add(key);
      items.push(item);
    });

  return items;
}

function normalizedListKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\u3040-\u30ff\u3400-\u9fff]+/g, "");
}

function timelineActorName(event: TimelineEvent) {
  return cleanText(event.actorName || event.staffName || event.actor);
}

function AssigneeModal({
  assignee,
  historyItems,
  language,
  t,
  onClose
}: {
  assignee: SafeAssignee | null;
  historyItems: AssigneeRequestHistoryItem[];
  language: "vi" | "ja";
  t: (key: TranslationKey) => string;
  onClose: () => void;
}) {
  const fields = assignee
    ? [
        [t("request.assigneeName"), assignee.name],
        [t("request.assigneeDepartment"), assignee.department],
        [t("request.assigneeRole"), assignee.role],
        [t("request.assigneeContact"), assignee.contact],
        [t("request.assigneeNote"), assignee.note]
      ].filter(([, value]) => cleanText(value))
    : [];

  return (
    <div className="assignee-modal-overlay assignee-modal-backdrop" role="presentation" onClick={onClose}>
      <div className="assignee-modal" role="dialog" aria-modal="true" aria-labelledby="assignee-modal-title" onClick={event => event.stopPropagation()}>
        <div className="assignee-modal-header">
          <h2 id="assignee-modal-title">{t("request.assigneeInfoTitle")}</h2>
          <button type="button" className="assignee-modal-close" aria-label={t("common.close")} onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="assignee-modal-body">
          {assignee ? (
            <div className="assignee-profile">
              <div className="assignee-avatar" aria-hidden="true">
                {assignee.avatar ? <img src={assignee.avatar} alt="" /> : assignee.name.slice(0, 1).toUpperCase()}
              </div>
              <div>
                <span>{t("request.staffProfile")}</span>
                <strong>{assignee.name}</strong>
                {assignee.department ? <em>{assignee.department}</em> : null}
              </div>
            </div>
          ) : (
            <div className="assignee-modal-empty">{t("request.assigneeEmpty")}</div>
          )}
          {fields.length ? (
            <div className="assignee-info-grid">
              {fields.map(([label, value]) => (
                <InfoRow key={label} label={label} value={value} />
              ))}
            </div>
          ) : null}
          {assignee ? (
            <>
              <AssigneeChipSection
                title={t("request.assigneeWorkContent")}
                items={assignee.workContents}
                emptyLabel={t("request.assigneeWorkEmpty")}
                moreLabel={t("request.assigneeMoreWork")}
              />
            </>
          ) : null}
          <div className="assignee-history">
            <h3>{t("request.assigneeHistoryTitle")}</h3>
            <div className="assignee-history-list">
              {assignee && historyItems.length ? historyItems.map(item => {
                return (
                  <div className="assignee-history-item" key={`assignee-history-${item.id || item.requestCode}`}>
                    <div className="assignee-history-top">
                      <StatusBadge status={item.status} />
                    </div>
                    <div className="assignee-history-main">
                      <strong>{item.requestCode || item.id}</strong>
                      <span>{item.title || "-"}</span>
                    </div>
                  <div className="assignee-history-meta">
                    {item.createdAt ? <span>{t("request.createdAt")}: {formatTimelineDate(item.createdAt, language)}</span> : null}
                    {item.updatedAt ? <span>{t("request.historyUpdatedAt")}: {formatTimelineDate(item.updatedAt, language)}</span> : null}
                  </div>
                    {item.issueTags?.length ? <div className="assignee-history-tags">{item.issueTags.slice(0, 3).map(tag => <span key={tag}>{tag}</span>)}</div> : null}
                    {item.latestNote ? <em>{t("request.historyLatestNote")}: {item.latestNote}</em> : null}
                  </div>
                );
              }) : <div className="assignee-history-empty">{assignee ? t("request.assigneeHistoryEmpty") : t("request.assigneeEmpty")}</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AssigneeChipSection({
  title,
  items,
  emptyLabel,
  moreLabel
}: {
  title: string;
  items: string[];
  emptyLabel?: string;
  moreLabel: string;
}) {
  const visibleItems = items.slice(0, 10);
  const hiddenCount = Math.max(0, items.length - visibleItems.length);
  if (!items.length && !emptyLabel) return null;

  return (
    <div className="assignee-chip-section">
      <h3>{title}</h3>
      {items.length ? (
        <div className="assignee-chip-list">
          {visibleItems.map(item => <span className="assignee-chip" key={item}>{item}</span>)}
          {hiddenCount ? <span className="assignee-chip-more">{moreLabel.replace("{count}", String(hiddenCount))}</span> : null}
        </div>
      ) : (
        <div className="assignee-chip-empty">{emptyLabel}</div>
      )}
    </div>
  );
}

function requestMediaItems(request: SupportRequest): DetailMedia[] {
  return normalizeRequestFiles(request)
    .map(item => {
      const url = requestFileUrl(item);
      if (!url) return null;
      return {
        ...item,
        url,
        name: requestFileName(item)
      };
    })
    .filter((item): item is DetailMedia => Boolean(item));
}

function isVideoMedia(media: RequestMediaFile) {
  return requestFileKind(media) === "video";
}

function isImageMedia(media: RequestMediaFile) {
  return requestFileKind(media) === "image";
}

function requestFileMeta(media: RequestMediaFile, language: "vi" | "ja") {
  const labels = {
    vi: {
      image: "Hình ảnh",
      video: "Video",
      pdf: "PDF",
      document: "Word/Tài liệu",
      spreadsheet: "Excel/Bảng tính",
      presentation: "PowerPoint",
      cad: "CAD/JWW",
      archive: "ZIP",
      other: "Tệp"
    },
    ja: {
      image: "画像",
      video: "動画",
      pdf: "PDF",
      document: "Word/文書",
      spreadsheet: "Excel/表計算",
      presentation: "PowerPoint",
      cad: "CAD/JWW",
      archive: "ZIP",
      other: "ファイル"
    }
  };
  const kind = requestFileKind(media);
  return [labels[language][kind] || labels[language].other, formatRequestFileSize(media.size)].filter(Boolean).join(" · ");
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="info-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
