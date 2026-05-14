import type { RequestStatus } from "../../types";
import type { TranslationKey } from "../../i18n";
import { getRequestTimelineIndex } from "../../constants/requestStatus";

export const requestFilters: Array<{ id: RequestStatus | "all"; key: TranslationKey }> = [
  { id: "all", key: "status.all" },
  { id: "submitted", key: "status.submitted" },
  { id: "received", key: "status.received" },
  { id: "processing", key: "status.processing" },
  { id: "waiting_customer", key: "status.waiting_customer" },
  { id: "scheduled", key: "status.scheduled" },
  { id: "completed", key: "status.completed" },
  { id: "cancelled", key: "status.cancelled" }
];

export const categoryOptions: Array<{ value: string; key: TranslationKey }> = [
  { value: "electrical", key: "request.categoryElectrical" },
  { value: "installation", key: "request.categoryInstallation" },
  { value: "maintenance", key: "request.categoryMaintenance" },
  { value: "quote", key: "request.categoryQuote" }
];

export function timelineIndex(status: RequestStatus): number {
  return getRequestTimelineIndex(status);
}
