import type { RequestStatus } from "../types";
import type { TranslationKey } from "../i18n";

export const REQUEST_STATUS_FLOW: RequestStatus[] = [
  "submitted",
  "untreated",
  "processing",
  "estimating",
  "quoted",
  "ordered",
  "completed",
  "lost"
];

export const REQUEST_STATUS_LABEL_KEYS: Record<RequestStatus, TranslationKey> = {
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

export const REQUEST_TIMELINE_MESSAGE_KEYS: Record<RequestStatus, TranslationKey> = {
  submitted: "request.timelineSubmitted",
  untreated: "request.timelineUntreated",
  received: "request.timelineReceived",
  contacted: "request.timelineReceived",
  processing: "request.timelineProcessing",
  estimating: "request.timelineEstimating",
  quoted: "request.timelineQuoted",
  waiting_customer: "request.timelineWaiting",
  ordered: "request.timelineOrdered",
  scheduled: "request.timelineScheduled",
  completed: "request.timelineCompleted",
  lost: "request.timelineLost",
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
