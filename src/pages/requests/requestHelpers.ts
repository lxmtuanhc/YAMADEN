import type { RequestStatus } from "../../types";
import type { TranslationKey } from "../../i18n";

export const requestFilters: Array<{ id: RequestStatus | "all"; key: TranslationKey }> = [
  { id: "all", key: "status.all" },
  { id: "processing", key: "status.processing" },
  { id: "waiting_customer", key: "status.waiting_customer" },
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
  const order: Record<RequestStatus, number> = {
    submitted: 0,
    received: 1,
    processing: 2,
    waiting_customer: 3,
    scheduled: 4,
    completed: 5,
    cancelled: 0
  };
  return order[status];
}
