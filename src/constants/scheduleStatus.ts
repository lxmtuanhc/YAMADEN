import type { TranslationKey } from "../i18n";
import type { RequestStatus, ScheduleStatus } from "../types";

export const SCHEDULE_STATUSES: ScheduleStatus[] = ["upcoming", "in_progress", "completed", "cancelled"];

export const SCHEDULE_STATUS_LABEL_KEYS: Record<ScheduleStatus, TranslationKey> = {
  upcoming: "schedule.statusUpcoming",
  in_progress: "schedule.statusInProgress",
  completed: "schedule.statusCompleted",
  cancelled: "schedule.statusCancelled"
};

export const SCHEDULE_FILTERS: Array<{ id: ScheduleStatus | "all"; key: TranslationKey }> = [
  { id: "all", key: "status.all" },
  { id: "upcoming", key: "schedule.statusUpcoming" },
  { id: "in_progress", key: "schedule.statusInProgress" },
  { id: "completed", key: "schedule.statusCompleted" },
  { id: "cancelled", key: "schedule.statusCancelled" }
];

export const SCHEDULE_REQUEST_STATUS_BY_STATUS: Record<ScheduleStatus, RequestStatus> = {
  upcoming: "scheduled",
  in_progress: "processing",
  completed: "completed",
  cancelled: "cancelled"
};

export const SCHEDULE_TIMELINE_MESSAGE_KEYS: Record<ScheduleStatus | "created" | "updated", TranslationKey> = {
  created: "request.timelineScheduleCreated",
  updated: "request.timelineScheduleUpdated",
  upcoming: "request.timelineScheduleUpdated",
  in_progress: "request.timelineScheduleInProgress",
  completed: "request.timelineScheduleCompleted",
  cancelled: "request.timelineScheduleCancelled"
};
