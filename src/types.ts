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

export type ScheduleStatus = "upcoming" | "in_progress" | "completed" | "cancelled";

export interface User {
  id: string;
  phone: string;
  name: string;
  email: string;
  status: UserStatus;
  pin?: string;
  address?: string;
  projectName?: string;
  accountType?: "personal" | "company";
  companyName?: string;
  contactPerson?: string;
}

export type TimelineEventType =
  | "submitted"
  | "received"
  | "processing"
  | "waiting_customer"
  | "scheduled"
  | "completed"
  | "cancelled";

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  message: string;
  createdAt: string;
}

export interface Request {
  id: string;
  title: string;
  category: string;
  description: string;
  address: string;
  status: RequestStatus;
  createdAt: string;
  images: string[];
  timeline: TimelineEvent[];
  datetime?: string;
  projectName?: string;
  createdBy?: string;
  phone?: string;
  contact?: string;
  issueTags?: string[];
}

export type SupportRequest = Request;

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
