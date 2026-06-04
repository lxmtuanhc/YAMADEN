import type { TranslationKey } from "../i18n";
import type { RequestStatus, ScheduleStatus } from "../types";

export const SCHEDULE_STATUSES: ScheduleStatus[] = ["sent_to_customer", "customer_selected", "confirmed", "completed", "cancelled"];

export const SCHEDULE_STATUS_LABEL_KEYS: Record<ScheduleStatus, TranslationKey> = {
  upcoming: "schedule.statusUpcoming",
  pending: "schedule.statusPending",
  draft: "schedule.statusDraft",
  sent_to_customer: "schedule.statusSentToCustomer",
  customer_selected: "schedule.statusCustomerSelected",
  confirmed: "schedule.statusConfirmed",
  rescheduled: "schedule.statusRescheduled",
  in_progress: "schedule.statusInProgress",
  completed: "schedule.statusCompleted",
  cancelled: "schedule.statusCancelled",
  expired: "schedule.statusExpired"
};

export const SCHEDULE_FILTERS: Array<{ id: ScheduleStatus | "all"; key: TranslationKey }> = [
  { id: "all", key: "status.all" },
  { id: "sent_to_customer", key: "schedule.statusSentToCustomer" },
  { id: "customer_selected", key: "schedule.statusCustomerSelected" },
  { id: "confirmed", key: "schedule.statusConfirmed" },
  { id: "completed", key: "schedule.statusCompleted" },
  { id: "cancelled", key: "schedule.statusCancelled" }
];

export const SCHEDULE_REQUEST_STATUS_BY_STATUS: Record<ScheduleStatus, RequestStatus> = {
  upcoming: "scheduled",
  pending: "scheduled",
  draft: "scheduled",
  sent_to_customer: "scheduled",
  customer_selected: "scheduled",
  confirmed: "scheduled",
  rescheduled: "scheduled",
  expired: "scheduled",
  in_progress: "processing",
  completed: "completed",
  cancelled: "cancelled"
};

export const SCHEDULE_TIMELINE_MESSAGE_KEYS: Record<ScheduleStatus | "created" | "updated", TranslationKey> = {
  created: "request.timelineScheduleCreated",
  updated: "request.timelineScheduleUpdated",
  upcoming: "request.timelineScheduleUpdated",
  pending: "request.timelineScheduleCreated",
  draft: "request.timelineScheduleCreated",
  sent_to_customer: "request.timelineScheduleCreated",
  customer_selected: "request.timelineScheduleUpdated",
  confirmed: "request.timelineScheduleUpdated",
  rescheduled: "request.timelineScheduleUpdated",
  expired: "request.timelineScheduleUpdated",
  in_progress: "request.timelineScheduleInProgress",
  completed: "request.timelineScheduleCompleted",
  cancelled: "request.timelineScheduleCancelled"
};
