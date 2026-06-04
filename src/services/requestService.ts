import { initialRequests } from "../data/mockData";
import { useAppStore } from "../stores/appStore";
import type { AssigneeRequestHistoryItem, RequestAssignee, RequestMediaFile, RequestStatus, StaffProfile, SupportRequest, TimelineEvent } from "../types";
import { createRequestId, todayLabel } from "../utils/format";
import { REQUEST_TIMELINE_MESSAGE_KEYS } from "../constants/requestStatus";
import { APP_STORAGE_KEY } from "../constants/storageKeys";
import { uploadConfig } from "../constants/uploadConfig";
import { getUserToken } from "./authService";

export interface CreateRequestInput {
  category: string;
  title: string;
  description?: string;
  address: string;
  datetime?: string;
  imageName?: string;
  files?: File[];
  name?: string;
  phone?: string;
  contact?: string;
  issueTags?: string[];
  workTypeIds?: string[];
  departmentCode?: string;
}

export interface WorkMasterDepartment {
  id: string;
  code: string;
  nameVi?: string;
  nameJa?: string;
  active?: boolean;
  sortOrder?: number;
}

export interface WorkMasterGroup {
  id: string;
  departmentCode: string;
  code: string;
  nameVi?: string;
  nameJa?: string;
  active?: boolean;
  sortOrder?: number;
}

export interface WorkMasterType {
  id: string;
  departmentCode: string;
  workGroupCode?: string;
  code: string;
  nameVi?: string;
  nameJa?: string;
  active?: boolean;
  sortOrder?: number;
}

export interface WorkMaster {
  departments: WorkMasterDepartment[];
  workGroups: WorkMasterGroup[];
  workTypes: WorkMasterType[];
}

class BackendRequestError extends Error {
  status: number;
  body: unknown;
  endpoint: string;

  constructor(message: string, status: number, body: unknown, endpoint: string) {
    super(message);
    this.name = "BackendRequestError";
    this.status = status;
    this.body = body;
    this.endpoint = endpoint;
  }
}

export type UpdateRequestInput = Partial<
  Pick<SupportRequest, "category" | "title" | "description" | "address" | "datetime" | "images" | "status">
>;

export interface AddTimelineEventInput {
  type: RequestStatus;
  message?: string;
  createdAt?: string;
}

function delay() {
  return new Promise(resolve => window.setTimeout(resolve, 120));
}

function createTimelineEvent(type: RequestStatus, message?: string, createdAt = todayLabel()): TimelineEvent {
  return {
    id: `tl-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    type,
    message: message || REQUEST_TIMELINE_MESSAGE_KEYS[type],
    createdAt
  };
}

function stableRequestCode(value?: string) {
  const source = String(value || createRequestId());
  if (/^YMD-\d{6}$/.test(source)) return source;
  let hash = 0;
  for (let index = 0; index < source.length; index += 1) {
    hash = (hash * 31 + source.charCodeAt(index)) % 1000000;
  }
  return `YMD-${String(hash).padStart(6, "0")}`;
}

function normalizeRequest(request: SupportRequest): SupportRequest {
  const requestCode = request.requestCode || stableRequestCode(request.id);
  const fallbackTimeline =
    request.timeline && request.timeline.length
      ? request.timeline
      : [createTimelineEvent(request.status || "submitted", REQUEST_TIMELINE_MESSAGE_KEYS[request.status || "submitted"], request.createdAt)];

  return {
    ...request,
    requestCode,
    images: request.images || [],
    mediaFiles: request.mediaFiles || [],
    timeline: fallbackTimeline,
    isDeleted: Boolean(request.isDeleted),
    deletedAt: request.deletedAt || null,
    deletedBy: request.deletedBy || "",
    deletedByRole: request.deletedByRole || "",
    daysLeftBeforePermanentDelete: request.daysLeftBeforePermanentDelete
  };
}

function readRequests(): SupportRequest[] {
  const storeRequests = useAppStore.getState().requests;
  if (storeRequests.length) return storeRequests.map(normalizeRequest);

  try {
    const raw = JSON.parse(localStorage.getItem(APP_STORAGE_KEY) || "null");
    const saved = raw?.state?.requests;
    if (Array.isArray(saved)) return saved.map(normalizeRequest);
  } catch (error) {
    console.warn("Unable to read request cache", error);
  }

  return initialRequests.map(normalizeRequest);
}

function commitRequests(requests: SupportRequest[]) {
  useAppStore.setState({ requests });
}

function sameRequest(left: SupportRequest, right: SupportRequest) {
  return Boolean(
    (left.id && right.id && left.id === right.id) ||
    (left.requestCode && right.requestCode && left.requestCode === right.requestCode)
  );
}

function upsertRequest(request: SupportRequest, requests: SupportRequest[]) {
  const normalized = normalizeRequest(request);
  const exists = requests.some(item => sameRequest(item, normalized));
  if (!exists) return [normalized, ...requests];
  return requests.map(item => sameRequest(item, normalized) ? normalized : item);
}

function normalizeBackendStatus(status?: string): RequestStatus {
  if (status === "pending" || status === "new" || status === "unhandled") return "untreated";
  if (status === "contacted") return "received";
  if (status === "site_done") return "processing";
  if (status === "quote" || status === "estimate") return "quoted";
  if (status === "quoting" || status === "estimate_pending") return "estimating";
  if (status === "order" || status === "accepted") return "ordered";
  if (status === "failed") return "lost";
  if (
    status === "submitted" ||
    status === "untreated" ||
    status === "received" ||
    status === "contacted" ||
    status === "processing" ||
    status === "estimating" ||
    status === "quoted" ||
    status === "waiting_customer" ||
    status === "ordered" ||
    status === "scheduled" ||
    status === "completed" ||
    status === "lost" ||
    status === "cancelled"
  ) {
    return status;
  }
  return "untreated";
}

function timelineMessageForStatus(status: RequestStatus): TranslationKey {
  return REQUEST_TIMELINE_MESSAGE_KEYS[status] || REQUEST_TIMELINE_MESSAGE_KEYS.submitted;
}

function backendTimeline(item: any, status: RequestStatus, createdAt: string): TimelineEvent[] {
  const addCurrentStatusIfMissing = (events: TimelineEvent[]) => {
    const normalized = [...events].sort((a, b) => (
      new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
    ));
    if (!normalized.some(event => normalizeBackendStatus(event.type) === status)) {
      normalized.push(createTimelineEvent(status, timelineMessageForStatus(status), createdAt));
    }
    return normalized.sort((a, b) => (
      new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
    ));
  };

  if (Array.isArray(item.timeline) && item.timeline.length) {
    return addCurrentStatusIfMissing(item.timeline.map((event: any, index: number) => {
      if (typeof event === "string") {
        return {
          id: `tl-string-${index}-${Date.now()}`,
          type: status,
          status,
          message: event || timelineMessageForStatus(status),
          note: "",
          actor: "",
          actorName: "",
          staffName: "",
          createdAt
        };
      }

      const rawEventStatus = normalizeBackendStatus(event?.type || event?.status);
      const eventStatus = rawEventStatus === "waiting_customer" && (status === "estimating" || status === "quoted")
        ? status
        : rawEventStatus;
      return {
        id: String(event?.id || `tl-${eventStatus}-${event?.createdAt || Date.now()}`),
        type: eventStatus as TimelineEvent["type"],
        status: eventStatus as TimelineEvent["type"],
        message: event?.message || timelineMessageForStatus(eventStatus),
        note: event?.note || "",
        actor: event?.actor || "",
        actorName: event?.actorName || "",
        staffName: event?.staffName || event?.assigneeName || "",
        createdAt: event?.createdAt ? new Date(event.createdAt).toLocaleString() : createdAt
      };
    }));
  }

  const events: TimelineEvent[] = [
    createTimelineEvent("submitted", REQUEST_TIMELINE_MESSAGE_KEYS.submitted, item.createdAt ? new Date(item.createdAt).toLocaleString() : createdAt)
  ];
  const timestampMap: Array<[keyof typeof REQUEST_TIMELINE_MESSAGE_KEYS, string | undefined]> = [
    ["received", item.contactedAt || item.firstResponseAt],
    ["processing", item.siteVisitedAt],
    ["estimating", item.firstResponseAt],
    ["quoted", item.quotedAt],
    ["ordered", item.orderedAt],
    ["completed", item.completedAt],
    ["lost", item.lostAt]
  ];
  timestampMap.forEach(([type, value]) => {
    if (value) events.push(createTimelineEvent(type, REQUEST_TIMELINE_MESSAGE_KEYS[type], new Date(value).toLocaleString()));
  });
  if (events.length === 1 && status !== "submitted") {
    events.push(createTimelineEvent(status, REQUEST_TIMELINE_MESSAGE_KEYS[status], createdAt));
  }
  return addCurrentStatusIfMissing(events);
}

function backendRequestToSupportRequest(item: any, input?: CreateRequestInput): SupportRequest {
  const status = normalizeBackendStatus(item.status);
  const createdAt = item.createdAt ? new Date(item.createdAt).toLocaleString() : todayLabel();
  const backendMediaFiles = Array.isArray(item.mediaFiles) ? item.mediaFiles : [];
  const mediaFiles: RequestMediaFile[] = backendMediaFiles
    .map((file: any) => typeof file === "string" ? { url: file, type: "image" } : {
      url: file?.secureUrl || file?.url || "",
      secureUrl: file?.secureUrl,
      publicId: file?.publicId,
      resourceType: file?.resourceType,
      format: file?.format,
      originalName: file?.originalName,
      mimetype: file?.mimetype,
      size: file?.size,
      type: file?.type || file?.resourceType
    })
    .filter(file => file.url || file.secureUrl);

  if (!mediaFiles.length && item.mediaUrl) {
    mediaFiles.push({
      url: item.mediaUrl,
      type: item.mediaType || (/(\.mp4|\.mov|\.webm|\.m4v)(\?|$)/i.test(item.mediaUrl) ? "video" : "image")
    });
  } else if (!mediaFiles.length && item.image) {
    mediaFiles.push({ url: item.image, type: "image" });
  }

  const mediaUrls = mediaFiles
    .map(file => file.secureUrl || file.url)
    .filter(Boolean);
  const fallbackImages = input?.files?.length ? input.files.map(file => file.name) : input?.imageName ? [input.imageName] : [];
  return normalizeRequest({
    id: String(item.id || item.requestCode || item.requestId || item._id || createRequestId()),
    requestCode: item.requestCode || item.requestId || stableRequestCode(String(item.id || item._id || "")),
    title: input?.title || item.title || item.content || item.category || "",
    category: input?.category || item.category || input?.issueTags?.[0] || "",
    description: input?.description || item.description || item.content || "",
    address: item.address || input?.address || "",
    status,
    createdAt,
    images: mediaUrls.length ? mediaUrls : item.image ? [item.image] : fallbackImages,
    image: item.image || "",
    mediaUrl: item.mediaUrl || "",
    mediaType: item.mediaType || "",
    mediaFiles,
    timeline: backendTimeline(item, status, createdAt),
    datetime: input?.datetime || item.datetime || "",
    projectName: useAppStore.getState().user?.projectName || input?.address || item.address || "",
    createdBy: item.name || input?.name || useAppStore.getState().user?.name || useAppStore.getState().user?.phone || "Customer",
    phone: item.phone || input?.phone || "",
    contact: item.contact || input?.contact || "",
    issueTags: Array.isArray(item.issueTags) ? item.issueTags : input?.issueTags || [],
    workTypeIds: Array.isArray(item.workTypeIds) ? item.workTypeIds : input?.workTypeIds || [],
    departmentCode: item.departmentCode || input?.departmentCode || "",
    autoTags: Array.isArray(item.autoTags) ? item.autoTags : [],
    autoCategory: item.autoCategory || null,
    autoUrgency: item.autoUrgency || null,
    autoArea: item.autoArea || null,
    assignmentCandidates: Array.isArray(item.assignmentCandidates) ? item.assignmentCandidates : [],
    assignmentConfidence: item.assignmentConfidence ?? null,
    assignmentReason: item.assignmentReason || null,
    assignedBy: item.assignedBy || null,
    adminReply: item.adminReply || item.adminResponse || item.response || item.feedback || item.note || latestTimelineNote(item.timeline) || "",
    quoteRequested: item.quoteRequested === true,
    quoteRequestedAt: item.quoteRequestedAt || null,
    quoteSent: item.quoteSent === true || Boolean(item.quotationFiles?.length) || Boolean(item.quoteFiles?.length),
    quoteSentAt: item.quoteSentAt || null,
    quoteUpdatedAt: item.quoteUpdatedAt || null,
    quoteResponseStatus: item.quoteResponseStatus || null,
    quoteAcceptedAt: item.quoteAcceptedAt || null,
    quoteRevisionMessage: item.quoteRevisionMessage || "",
    quoteRevisionRequestedAt: item.quoteRevisionRequestedAt || null,
    quoteFiles: Array.isArray(item.quoteFiles) ? item.quoteFiles : [],
    quotationFiles: Array.isArray(item.quotationFiles) ? item.quotationFiles : [],
    assigneeId: item.assigneeId || "",
    assigneeName: item.assigneeName || "",
    assignedStaff: item.assignedStaff,
    assignee: item.assignee,
    staff: item.staff,
    responsiblePerson: item.responsiblePerson,
    assignedTo: item.assignedTo,
    isDeleted: Boolean(item.isDeleted),
    deletedAt: item.deletedAt || null,
    deletedBy: item.deletedBy || "",
    deletedByRole: item.deletedByRole || "",
    daysLeftBeforePermanentDelete: item.daysLeftBeforePermanentDelete
  });
}

function latestTimelineNote(timeline: unknown) {
  if (!Array.isArray(timeline)) return "";
  return [...timeline].reverse().find(event => event && typeof event === "object" && String((event as { note?: string }).note || "").trim())?.note || "";
}

function latestTimelineDate(timeline: unknown) {
  if (!Array.isArray(timeline)) return "";
  const dates = timeline
    .map(event => event && typeof event === "object" ? String((event as { createdAt?: string }).createdAt || "") : "")
    .filter(Boolean)
    .map(value => new Date(value).getTime())
    .filter(value => !Number.isNaN(value));
  if (!dates.length) return "";
  return new Date(Math.max(...dates)).toLocaleString();
}

function cleanText(value: unknown) {
  return String(value || "").trim();
}

function assigneeIdentityFromValue(value: RequestAssignee | string | undefined) {
  if (!value) return { id: "", name: "" };
  if (typeof value === "string") return { id: "", name: cleanText(value) };
  return {
    id: cleanText(value.id || value._id || value.staffId),
    name: cleanText(value.name)
  };
}

function requestAssigneeIdentity(request: SupportRequest) {
  const candidates = [
    request.assignedStaff,
    request.assignedTo,
    request.assignee,
    request.staff,
    request.responsiblePerson
  ];
  const fromProfile = candidates.map(assigneeIdentityFromValue).find(item => item.id || item.name);
  return {
    id: fromProfile?.id || cleanText(request.assigneeId),
    name: fromProfile?.name || cleanText(request.assigneeName)
  };
}

function sameAssignee(left: SupportRequest, right: SupportRequest) {
  const leftIdentity = requestAssigneeIdentity(left);
  const rightIdentity = requestAssigneeIdentity(right);
  if (leftIdentity.id && rightIdentity.id) return leftIdentity.id === rightIdentity.id;
  return Boolean(leftIdentity.name && rightIdentity.name && leftIdentity.name === rightIdentity.name);
}

function requestHistoryItem(request: SupportRequest): AssigneeRequestHistoryItem {
  return {
    id: request.id,
    requestCode: request.requestCode,
    title: request.title,
    status: request.status,
    createdAt: request.createdAt,
    updatedAt: latestTimelineDate(request.timeline),
    latestNote: latestTimelineNote(request.timeline),
    issueTags: request.issueTags || []
  };
}

function localAssigneeHistory(request: SupportRequest): AssigneeRequestHistoryItem[] {
  const identity = requestAssigneeIdentity(request);
  if (!identity.id && !identity.name) return [];
  return readRequests()
    .filter(item => sameAssignee(request, item))
    .map(requestHistoryItem)
    .sort((left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime());
}

async function fetchBackendRequestById(id: string): Promise<SupportRequest | null> {
  const token = getUserToken();
  const response = await fetch(`/request/${encodeURIComponent(id)}`, {
    cache: "no-store",
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Request load failed");
  const payload = await response.json();
  return backendRequestToSupportRequest(payload.data || payload);
}

async function fetchBackendRequests(): Promise<SupportRequest[] | null> {
  const token = getUserToken();
  if (!token) return null;
  const response = await fetch("/user/requests", {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) throw new Error("Requests load failed");
  const payload = await response.json();
  const items = Array.isArray(payload.data) ? payload.data : Array.isArray(payload) ? payload : [];
  return items.map(item => backendRequestToSupportRequest(item));
}

async function fetchDeletedBackendRequests(): Promise<SupportRequest[] | null> {
  const token = getUserToken();
  if (!token) return null;
  const response = await fetch("/api/customer/requests/deleted", {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) throw new Error("Deleted requests load failed");
  const payload = await response.json();
  const items = Array.isArray(payload.data) ? payload.data : Array.isArray(payload) ? payload : [];
  return items.map(item => backendRequestToSupportRequest(item));
}

async function deleteBackendRequest(id: string): Promise<SupportRequest | null> {
  const token = getUserToken();
  if (!token) return null;
  const response = await fetch(`/api/customer/requests/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) throw new Error("Request delete failed");
  const payload = await response.json();
  return backendRequestToSupportRequest(payload.data || payload);
}

async function restoreBackendRequest(id: string): Promise<SupportRequest | null> {
  const token = getUserToken();
  if (!token) return null;
  const response = await fetch(`/api/customer/requests/${encodeURIComponent(id)}/restore`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) throw new Error("Request restore failed");
  const payload = await response.json();
  return backendRequestToSupportRequest(payload.data || payload);
}

async function permanentDeleteBackendRequest(id: string): Promise<boolean | null> {
  const token = getUserToken();
  if (!token) return null;
  const response = await fetch(`/api/customer/requests/${encodeURIComponent(id)}/permanent`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) throw new Error("Request permanent delete failed");
  return true;
}

async function fetchBackendAssigneeHistory(staffId: string): Promise<AssigneeRequestHistoryItem[]> {
  const token = getUserToken();
  const response = await fetch(`/api/requests/staff/${encodeURIComponent(staffId)}/history`, {
    cache: "no-store",
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  if (!response.ok) throw new Error("Assignee history load failed");
  const payload = await response.json();
  const items = Array.isArray(payload.data) ? payload.data : [];
  return items.map((item: any) => ({
    id: String(item.id || item.requestCode || item.requestId || item._id || ""),
    requestCode: item.requestCode || item.requestId || "",
    title: item.title || item.content || item.category || "",
    status: normalizeBackendStatus(item.status),
    createdAt: item.createdAt ? new Date(item.createdAt).toLocaleString() : "",
    updatedAt: item.completedAt ? new Date(item.completedAt).toLocaleString() : item.updatedAt ? new Date(item.updatedAt).toLocaleString() : "",
    latestNote: cleanText(item.latestNote),
    issueTags: Array.isArray(item.issueTags) ? item.issueTags.map((tag: unknown) => cleanText(tag)).filter(Boolean) : []
  })).filter(item => item.id || item.requestCode || item.title);
}

async function fetchBackendStaffProfile(staffId: string): Promise<StaffProfile | null> {
  const token = getUserToken();
  const response = await fetch(`/api/staff/${encodeURIComponent(staffId)}/profile`, {
    cache: "no-store",
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Staff profile load failed");
  const payload = await response.json();
  const item = payload.data || payload;
  return {
    id: cleanText(item.id || item._id || staffId),
    name: cleanText(item.name),
    avatar: cleanText(item.avatar),
    department: cleanText(item.department || item.areas),
    areas: cleanText(item.areas),
    role: cleanText(item.role || item.position || item.title),
    position: cleanText(item.position),
    title: cleanText(item.title),
    workContent: cleanText(item.workContent),
    skills: cleanText(item.skills),
    workTags: Array.isArray(item.workTags) ? item.workTags.map((tag: unknown) => cleanText(tag)).filter(Boolean) : [],
    email: cleanText(item.email),
    phone: cleanText(item.phone),
    note: cleanText(item.note || item.introduction),
    introduction: cleanText(item.introduction)
  };
}

async function createBackendRequest(input: CreateRequestInput): Promise<SupportRequest | null> {
  const token = getUserToken();
  if (!token) return null;

  const hasFiles = Boolean(input.files?.length);
  const body = hasFiles ? new FormData() : JSON.stringify({
    name: input.name,
    phone: input.phone,
    contact: input.contact,
    category: input.category,
    title: input.title,
    address: input.address,
    content: input.description || "",
    issueTags: input.issueTags || [],
    workTypeIds: input.workTypeIds || [],
    departmentCode: input.departmentCode || "",
    quoteRequested: false
  });

  if (hasFiles && body instanceof FormData) {
    const uploadFiles = input.files?.slice(0, uploadConfig.CUSTOMER_MAX_FILES) || [];
    console.log("[request:create] selected media files", {
      count: uploadFiles.length,
      files: uploadFiles.map(file => ({
        name: file.name,
        type: file.type,
        size: file.size
      }))
    });
    body.append("name", input.name || "");
    body.append("phone", input.phone || "");
    body.append("contact", input.contact || "");
    body.append("category", input.category);
    body.append("title", input.title);
    body.append("address", input.address);
    body.append("content", input.description || "");
    body.append("departmentCode", input.departmentCode || "");
    body.append("quoteRequested", "false");
    (input.issueTags || []).forEach(tag => body.append("issueTags", tag));
    (input.workTypeIds || []).forEach(id => body.append("workTypeIds", id));
    uploadFiles.forEach(file => body.append("image", file));
    const debugEntries = Array.from(body.entries()).map(([field, value]) => (
      value instanceof File
        ? { field, name: value.name, type: value.type, size: value.size }
        : { field, value }
    ));
    console.log("[request:create] FormData debug", {
      endpoint: "/request",
      imageFieldCount: debugEntries.filter(entry => entry.field === "image").length,
      entries: debugEntries
    });
  }

  const endpoint = "/request";
  const response = await fetch(endpoint, {
    method: "POST",
    headers: hasFiles ? { Authorization: `Bearer ${token}` } : {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body
  });

  if (!response.ok) {
    let responseBody: unknown = "";
    let message = "Request create failed";
    try {
      const rawBody = await response.text();
      responseBody = rawBody;
      if (rawBody) {
        try {
          responseBody = JSON.parse(rawBody);
        } catch {}
      }
      if (responseBody && typeof responseBody === "object") {
        const payload = responseBody as { message?: string; error?: string; code?: string };
        message = payload.message || payload.error || payload.code || message;
      }
    } catch {}
    console.error("[request:create] backend response failed", {
      endpoint,
      status: response.status,
      body: responseBody,
      code: responseBody && typeof responseBody === "object"
        ? (responseBody as { code?: string }).code
        : undefined
    });
    throw new BackendRequestError(message, response.status, responseBody, endpoint);
  }

  const payload = await response.json();
  return backendRequestToSupportRequest(payload.data || payload, input);
}

export const requestService = {
  async getRequests(): Promise<SupportRequest[]> {
    await delay();
    try {
      const backendRequests = await fetchBackendRequests();
      if (backendRequests) {
        const deletedLocal = readRequests().filter(request => request.isDeleted);
        const requests = [...backendRequests, ...deletedLocal.filter(deleted => !backendRequests.some(item => sameRequest(item, deleted)))];
        commitRequests(requests);
        return backendRequests.filter(request => !request.isDeleted);
      }
    } catch (error) {
      console.warn("Unable to load requests from backend", error);
    }
    const requests = readRequests();
    commitRequests(requests);
    return requests.filter(request => !request.isDeleted);
  },

  async getRequestById(id: string): Promise<SupportRequest | null> {
    await delay();
    try {
      const backendRequest = await fetchBackendRequestById(id);
      if (backendRequest) {
        const current = readRequests();
        const exists = current.some(request => request.id === backendRequest.id || request.requestCode === backendRequest.requestCode);
        commitRequests(exists
          ? current.map(request => (request.id === backendRequest.id || request.requestCode === backendRequest.requestCode ? backendRequest : request))
          : [backendRequest, ...current]);
        return backendRequest;
      }
    } catch (error) {
      console.warn("Unable to load request from backend", error);
    }
    return readRequests().find(request => request.id === id || request.requestCode === id) || null;
  },

  async getAssigneeHistory(request: SupportRequest): Promise<AssigneeRequestHistoryItem[]> {
    await delay();
    const identity = requestAssigneeIdentity(request);
    if (!identity.id && !identity.name) return [];
    try {
      if (identity.id) {
        const backendHistory = await fetchBackendAssigneeHistory(identity.id);
        if (backendHistory.length) return backendHistory;
      }
    } catch (error) {
      console.warn("Unable to load assignee history from backend", error);
    }
    return localAssigneeHistory(request);
  },

  async getAssigneeProfile(request: SupportRequest): Promise<StaffProfile | null> {
    await delay();
    const identity = requestAssigneeIdentity(request);
    if (!identity.id) return null;
    try {
      return await fetchBackendStaffProfile(identity.id);
    } catch (error) {
      console.warn("Unable to load assignee profile from backend", error);
      return null;
    }
  },

  async createRequest(input: CreateRequestInput): Promise<SupportRequest> {
    await delay();
    const user = useAppStore.getState().user;
    const backendRequest = await createBackendRequest(input);
    if (backendRequest) {
      commitRequests(upsertRequest(backendRequest, readRequests()));
      return backendRequest;
    }

    const createdAt = todayLabel();
    const request: SupportRequest = {
      id: createRequestId(),
      requestCode: stableRequestCode(`${Date.now()}-${input.title}`),
      title: input.title,
      category: input.category,
      description: input.description || "",
      address: input.address,
      status: "submitted",
      createdAt,
      images: input.files?.length ? input.files.map(file => file.name) : input.imageName ? [input.imageName] : [],
      timeline: [createTimelineEvent("submitted", REQUEST_TIMELINE_MESSAGE_KEYS.submitted, createdAt)],
      datetime: input.datetime,
      projectName: user?.projectName || input.address,
      createdBy: input.name || user?.name || user?.phone || "Customer",
      phone: input.phone || user?.phone || "",
      contact: input.contact || user?.contactPerson || user?.email || "",
      issueTags: input.issueTags || [],
      workTypeIds: input.workTypeIds || [],
      departmentCode: input.departmentCode || "",
      autoTags: [],
      autoCategory: null,
      autoUrgency: null,
      autoArea: null,
      assignmentCandidates: [],
      assignmentConfidence: null,
      assignmentReason: null,
      assignedBy: null
    };
    commitRequests([request, ...readRequests()]);
    return request;
  },

  async getIssueOptions(): Promise<string[]> {
    const master = await this.getWorkMaster();
    const locale = localStorage.getItem("language") === "vi" ? "vi" : "ja";
    return master.workTypes
      .map(item => locale === "vi" ? item.nameVi || item.nameJa || item.code : item.nameJa || item.nameVi || item.code)
      .map(item => String(item || "").trim())
      .filter(Boolean);
  },

  async getWorkMaster(): Promise<WorkMaster> {
    const response = await fetch("/api/work-master", { cache: "no-store" });
    if (!response.ok) return { departments: [], workGroups: [], workTypes: [] };
    const payload = await response.json();
    return {
      departments: Array.isArray(payload.departments) ? payload.departments : [],
      workGroups: Array.isArray(payload.workGroups) ? payload.workGroups : [],
      workTypes: Array.isArray(payload.workTypes) ? payload.workTypes : []
    };
  },

  async updateRequest(id: string, input: UpdateRequestInput): Promise<SupportRequest> {
    await delay();
    const requests = readRequests();
    const existing = requests.find(request => request.id === id);
    if (!existing) throw new Error("Request not found");

    const updated: SupportRequest = normalizeRequest({ ...existing, ...input });
    commitRequests(requests.map(request => (request.id === id ? updated : request)));
    return updated;
  },

  async deleteRequest(id: string): Promise<SupportRequest> {
    await delay();
    try {
      const deleted = await deleteBackendRequest(id);
      if (deleted) {
        const current = readRequests();
        commitRequests(current.map(request => (request.id === id || request.requestCode === id ? deleted : request)));
        return deleted;
      }
    } catch (error) {
      console.warn("Unable to delete request in backend", error);
    }

    const requests = readRequests();
    const existing = requests.find(request => request.id === id || request.requestCode === id);
    if (!existing) throw new Error("Request not found");
    const deleted = normalizeRequest({
      ...existing,
      isDeleted: true,
      deletedAt: new Date().toISOString(),
      deletedBy: useAppStore.getState().user?.id || "",
      deletedByRole: "user",
      daysLeftBeforePermanentDelete: 30
    });
    commitRequests(requests.map(request => (sameRequest(request, deleted) ? deleted : request)));
    return deleted;
  },

  async requestQuote(id: string): Promise<SupportRequest> {
    await delay();
    const token = getUserToken();
    if (!token) throw new Error("User login required");
    const response = await fetch(`/api/customer/requests/${encodeURIComponent(id)}/quote-request`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.message || "Quote request failed");
    }
    const payload = await response.json();
    const updated = backendRequestToSupportRequest(payload.data || payload);
    commitRequests(upsertRequest(updated, readRequests()));
    return updated;
  },

  async getDeletedRequests(): Promise<SupportRequest[]> {
    await delay();
    try {
      const deleted = await fetchDeletedBackendRequests();
      if (deleted) {
        const activeLocal = readRequests().filter(request => !request.isDeleted);
        commitRequests([...activeLocal, ...deleted]);
        return deleted;
      }
    } catch (error) {
      console.warn("Unable to load deleted requests from backend", error);
    }
    return readRequests()
      .filter(request => request.isDeleted)
      .sort((left, right) => new Date(right.deletedAt || 0).getTime() - new Date(left.deletedAt || 0).getTime());
  },

  async restoreRequest(id: string): Promise<SupportRequest> {
    await delay();
    try {
      const restored = await restoreBackendRequest(id);
      if (restored) {
        const current = readRequests();
        commitRequests(current.map(request => (request.id === id || request.requestCode === id ? restored : request)));
        return restored;
      }
    } catch (error) {
      console.warn("Unable to restore request in backend", error);
    }

    const requests = readRequests();
    const existing = requests.find(request => request.id === id || request.requestCode === id);
    if (!existing) throw new Error("Request not found");
    const restored = normalizeRequest({ ...existing, isDeleted: false, deletedAt: null, deletedBy: "", deletedByRole: "" });
    commitRequests(requests.map(request => (sameRequest(request, restored) ? restored : request)));
    return restored;
  },

  async permanentDeleteRequest(id: string): Promise<void> {
    await delay();
    try {
      const deleted = await permanentDeleteBackendRequest(id);
      if (deleted) {
        commitRequests(readRequests().filter(request => request.id !== id && request.requestCode !== id));
        return;
      }
    } catch (error) {
      console.warn("Unable to permanently delete request in backend", error);
    }
    commitRequests(readRequests().filter(request => request.id !== id && request.requestCode !== id));
  },

  async addTimelineEvent(id: string, input: AddTimelineEventInput): Promise<SupportRequest> {
    await delay();
    const requests = readRequests();
    const existing = requests.find(request => request.id === id);
    if (!existing) throw new Error("Request not found");

    const event = createTimelineEvent(input.type, input.message, input.createdAt);
    const updated: SupportRequest = {
      ...normalizeRequest(existing),
      status: input.type,
      timeline: [...normalizeRequest(existing).timeline, event]
    };

    commitRequests(requests.map(request => (request.id === id ? updated : request)));
    return updated;
  }
};
