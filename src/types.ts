export type Language = "vi" | "ja";

export type UserStatus =
  | "notLoggedIn"
  | "profileIncomplete"
  | "pendingApproval"
  | "active"
  | "rejected";

export type RequestStatus =
  | "submitted"
  | "untreated"
  | "received"
  | "contacted"
  | "processing"
  | "estimating"
  | "quoted"
  | "waiting_customer"
  | "ordered"
  | "scheduled"
  | "completed"
  | "lost"
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
  | "untreated"
  | "received"
  | "contacted"
  | "processing"
  | "estimating"
  | "quoted"
  | "waiting_customer"
  | "ordered"
  | "scheduled"
  | "completed"
  | "lost"
  | "cancelled";

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  status?: TimelineEventType;
  message: string;
  createdAt: string;
  note?: string;
  actor?: string;
  actorName?: string;
  staffName?: string;
}

export interface RequestAssignee {
  id?: string;
  _id?: string;
  staffId?: string;
  name?: string;
  department?: string;
  areas?: string;
  skills?: string;
  workContent?: string;
  email?: string;
  phone?: string;
  note?: string;
}

export interface AssigneeRequestHistoryItem {
  id: string;
  requestCode?: string;
  title: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt?: string;
  latestNote?: string;
}

export interface RequestMediaFile {
  url?: string;
  secureUrl?: string;
  publicId?: string;
  resourceType?: string;
  format?: string;
  originalName?: string;
  mimetype?: string;
  size?: number;
  type?: string;
}

export interface Request {
  id: string;
  requestCode?: string;
  title: string;
  category: string;
  description: string;
  address: string;
  status: RequestStatus;
  createdAt: string;
  images: string[];
  image?: string;
  mediaUrl?: string;
  mediaType?: string;
  mediaFiles?: RequestMediaFile[];
  timeline: TimelineEvent[];
  datetime?: string;
  projectName?: string;
  createdBy?: string;
  phone?: string;
  contact?: string;
  issueTags?: string[];
  adminReply?: string;
  assigneeId?: string;
  assigneeName?: string;
  assignedStaff?: RequestAssignee | string;
  assignee?: RequestAssignee | string;
  staff?: RequestAssignee | string;
  responsiblePerson?: RequestAssignee | string;
  assignedTo?: RequestAssignee | string;
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
