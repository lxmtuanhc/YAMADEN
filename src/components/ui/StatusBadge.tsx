import type { QuoteStatus, RequestStatus, ScheduleStatus } from "../../types";
import { useTranslation } from "../../hooks/useTranslation";
import type { TranslationKey } from "../../i18n";

type Status = RequestStatus | QuoteStatus | ScheduleStatus;

const requestStatusKeys: Record<RequestStatus, TranslationKey> = {
  submitted: "status.submitted",
  received: "status.received",
  processing: "status.processing",
  waiting_customer: "status.waiting_customer",
  scheduled: "status.scheduled",
  completed: "status.completed",
  cancelled: "status.cancelled"
};

const quoteStatusKeys: Record<QuoteStatus, TranslationKey> = {
  pending: "quote.pending",
  approved: "quote.approved",
  revision_requested: "quote.revision_requested",
  expired: "quote.expired"
};

const scheduleStatusKeys: Record<ScheduleStatus, TranslationKey> = {
  upcoming: "schedule.statusUpcoming",
  in_progress: "schedule.statusInProgress",
  completed: "schedule.statusCompleted",
  cancelled: "schedule.statusCancelled"
};

export function StatusBadge({ status }: { status: Status }) {
  const { t } = useTranslation();
  const key = ({ ...requestStatusKeys, ...quoteStatusKeys, ...scheduleStatusKeys } as Record<Status, TranslationKey>)[status];
  return <span className={`status-badge status-${status}`}>{t(key)}</span>;
}
