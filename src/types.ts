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

export type QuoteStatus =
  | "draft"
  | "pending"
  | "pending_approval"
  | "sent_to_customer"
  | "viewed_by_customer"
  | "approved"
  | "accepted"
  | "revision_requested"
  | "change_requested"
  | "rejected"
  | "expired";

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
  companyAddress?: string;
  taxId?: string;
  constructionType?: string;
  note?: string;
  notificationsEnabled?: boolean;
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
  avatar?: string;
  department?: string;
  areas?: string;
  role?: string;
  position?: string;
  title?: string;
  skills?: string;
  workContent?: string;
  workTags?: string[];
  email?: string;
  phone?: string;
  note?: string;
  introduction?: string;
}

export interface AssigneeRequestHistoryItem {
  id: string;
  requestCode?: string;
  title: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt?: string;
  latestNote?: string;
  issueTags?: string[];
  workTypeIds?: string[];
  departmentCode?: string;
}

export interface StaffProfile {
  id: string;
  name: string;
  avatar?: string;
  department?: string;
  areas?: string;
  role?: string;
  position?: string;
  title?: string;
  workContent?: string;
  skills?: string;
  workTags?: string[];
  email?: string;
  phone?: string;
  note?: string;
  introduction?: string;
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
  workTypeIds?: string[];
  departmentCode?: string;
  autoTags?: string[];
  autoCategory?: string | null;
  autoUrgency?: string | null;
  autoArea?: string | null;
  assignmentCandidates?: unknown[];
  assignmentConfidence?: number | null;
  assignmentReason?: string | null;
  assignedBy?: string | null;
  adminReply?: string;
  quoteRequested?: boolean;
  quoteRequestedAt?: string | null;
  quoteSent?: boolean;
  quoteSentAt?: string | null;
  quoteUpdatedAt?: string | null;
  quoteResponseStatus?: "accepted" | "revision_requested" | null;
  quoteAcceptedAt?: string | null;
  quoteRevisionMessage?: string;
  quoteRevisionRequestedAt?: string | null;
  quoteFiles?: QuoteFile[];
  quotationFiles?: QuoteFile[];
  assigneeId?: string;
  assigneeName?: string;
  assignedStaff?: RequestAssignee | string;
  assignee?: RequestAssignee | string;
  staff?: RequestAssignee | string;
  responsiblePerson?: RequestAssignee | string;
  assignedTo?: RequestAssignee | string;
  isDeleted?: boolean;
  deletedAt?: string | null;
  deletedBy?: string;
  deletedByRole?: string;
  daysLeftBeforePermanentDelete?: number;
}

export type SupportRequest = Request;

export interface QuoteItem {
  id?: string;
  name: string;
  description?: string;
  unit?: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  amount?: number;
}

export interface QuoteFile {
  id?: string;
  quoteId?: string;
  name?: string;
  originalName?: string;
  fileName?: string;
  fileUrl?: string;
  url?: string;
  secureUrl?: string;
  secure_url?: string;
  mimeType?: string;
  fileSize?: number;
  size?: number;
  ext?: string;
  sentAt?: string;
  uploadedAt?: string;
  createdAt?: string;
}

export interface Quote {
  id: string;
  quoteCode?: string;
  requestId: string;
  projectName: string;
  validUntil: string;
  status: QuoteStatus;
  items: QuoteItem[];
  title?: string;
  quoteNo?: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;
  address?: string;
  projectAddress?: string;
  content?: string;
  description?: string;
  assigneeName?: string;
  staffName?: string;
  subtotal?: number;
  discount?: number;
  taxRate?: number;
  taxAmount?: number;
  rounding?: number;
  total?: number;
  paymentTerms?: string;
  customerNote?: string;
  internalNote?: string;
  attachments?: string[];
  fileUrl?: string;
  originalName?: string;
  fileName?: string;
  mimeType?: string;
  fileSize?: number;
  ext?: string;
  quoteFiles?: QuoteFile[];
  quotationFiles?: QuoteFile[];
  quoteSent?: boolean;
  quoteSentAt?: string;
  quoteSentBy?: string;
  quoteFileCount?: number;
  sentAt?: string;
  visibleToCustomer?: boolean;
  sentToCustomerAt?: string;
  viewedByCustomerAt?: string;
  acceptedAt?: string;
  rejectedAt?: string;
  changeRequestedAt?: string;
  changeRequestMessage?: string;
  quoteResponseStatus?: "accepted" | "revision_requested" | null;
  quoteRevisionMessage?: string;
  quoteRevisionRequestedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
  deletedAt?: string | null;
  deletedBy?: string;
  deletedByRole?: string;
  daysLeftBeforePermanentDelete?: number;
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
