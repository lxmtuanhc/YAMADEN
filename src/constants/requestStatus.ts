import type { RequestStatus } from "../types";
import type { TranslationKey } from "../i18n";

export const REQUEST_STATUS_FLOW: RequestStatus[] = [
  "submitted",
  "received",
  "processing",
  "waiting_customer",
  "scheduled",
  "completed"
];

export const REQUEST_STATUS_LABEL_KEYS: Record<RequestStatus, TranslationKey> = {
  submitted: "status.submitted",
  received: "status.received",
  processing: "status.processing",
  waiting_customer: "status.waiting_customer",
  scheduled: "status.scheduled",
  completed: "status.completed",
  cancelled: "status.cancelled"
};

export const REQUEST_TIMELINE_MESSAGE_KEYS: Record<RequestStatus, TranslationKey> = {
  submitted: "request.timelineSubmitted",
  received: "request.timelineReceived",
  processing: "request.timelineProcessing",
  waiting_customer: "request.timelineWaiting",
  scheduled: "request.timelineScheduled",
  completed: "request.timelineCompleted",
  cancelled: "status.cancelled"
};

export const REQUEST_UPDATE_ACTIONS: Array<{
  status: RequestStatus;
  labelKey: TranslationKey;
}> = [
  { status: "received", labelKey: "request.markReceived" },
  { status: "processing", labelKey: "request.markProcessing" },
  { status: "waiting_customer", labelKey: "request.markWaiting" },
  { status: "completed", labelKey: "request.markCompleted" }
];

export function getRequestTimelineIndex(status: RequestStatus): number {
  return REQUEST_STATUS_FLOW.indexOf(status);
}
