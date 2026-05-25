import type { QuoteStatus, RequestStatus, ScheduleStatus } from "../../types";
import { useTranslation } from "../../hooks/useTranslation";
import type { TranslationKey } from "../../i18n";

type Status = RequestStatus | QuoteStatus | ScheduleStatus;

const requestStatusKeys: Record<RequestStatus, TranslationKey> = {
  submitted: "status.submitted",
  untreated: "status.untreated",
  received: "status.received",
  contacted: "status.received",
  processing: "status.processing",
  estimating: "status.estimating",
  quoted: "status.quoted",
  waiting_customer: "status.waiting_customer",
  ordered: "status.ordered",
  scheduled: "status.scheduled",
  completed: "status.completed",
  lost: "status.lost",
  cancelled: "status.cancelled"
};

const quoteStatusKeys: Record<QuoteStatus, TranslationKey> = {
  draft: "quote.draft",
  pending: "quote.pending",
  pending_approval: "quote.pendingApproval",
  sent_to_customer: "quote.sentToCustomer",
  viewed_by_customer: "quote.viewedByCustomer",
  approved: "quote.approved",
  accepted: "quote.approved",
  revision_requested: "quote.revision_requested",
  change_requested: "quote.revision_requested",
  rejected: "quote.rejected",
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
  const key = status in requestStatusKeys
    ? requestStatusKeys[status as RequestStatus]
    : status in quoteStatusKeys
      ? quoteStatusKeys[status as QuoteStatus]
      : scheduleStatusKeys[status as ScheduleStatus];
  return <span className={`status-badge status-${status}`}>{t(key)}</span>;
}
