export type Language = "vi" | "ja";

export type UserStatus =
  | "notLoggedIn"
  | "profileIncomplete"
  | "pendingApproval"
  | "active"
  | "rejected";

export type RequestStatus =
  | "submitted"
  | "received"
  | "processing"
  | "waiting_customer"
  | "scheduled"
  | "completed"
  | "cancelled";

export type QuoteStatus = "pending" | "approved" | "revision_requested" | "expired";

export type ScheduleStatus = "upcoming" | "confirmed" | "on_the_way" | "completed";

export interface User {
  id: string;
  phone: string;
  pin: string;
  name: string;
  email: string;
  address: string;
  projectName: string;
  companyType: string;
  status: UserStatus;
}

export interface SupportRequest {
  id: string;
  category: string;
  title: string;
  description: string;
  address: string;
  datetime: string;
  projectName: string;
  createdAt: string;
  createdBy: string;
  status: RequestStatus;
  images: string[];
}

export interface QuoteItem {
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface Quote {
  id: string;
  requestId: string;
  projectName: string;
  validUntil: string;
  status: QuoteStatus;
  items: QuoteItem[];
}

export interface Schedule {
  id: string;
  requestId: string;
  date: string;
  time: string;
  technician: string;
  projectName: string;
  status: ScheduleStatus;
}
