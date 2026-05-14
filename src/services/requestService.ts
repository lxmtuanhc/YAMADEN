import { initialRequests } from "../data/mockData";
import { useAppStore } from "../stores/appStore";
import type { RequestStatus, SupportRequest, TimelineEvent } from "../types";
import { createRequestId, todayLabel } from "../utils/format";
import { REQUEST_TIMELINE_MESSAGE_KEYS } from "../constants/requestStatus";
import { APP_STORAGE_KEY } from "../constants/storageKeys";
import { getUserToken } from "./authService";

export interface CreateRequestInput {
  category: string;
  title: string;
  description: string;
  address: string;
  datetime?: string;
  imageName?: string;
  name?: string;
  phone?: string;
  contact?: string;
  issueTags?: string[];
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

function normalizeRequest(request: SupportRequest): SupportRequest {
  const fallbackTimeline =
    request.timeline && request.timeline.length
      ? request.timeline
      : [createTimelineEvent(request.status || "submitted", REQUEST_TIMELINE_MESSAGE_KEYS[request.status || "submitted"], request.createdAt)];

  return {
    ...request,
    images: request.images || [],
    timeline: fallbackTimeline
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

function normalizeBackendStatus(status?: string): RequestStatus {
  if (status === "untreated") return "submitted";
  if (status === "contacted") return "received";
  if (status === "site_done") return "processing";
  if (status === "quoted") return "waiting_customer";
  if (status === "ordered") return "scheduled";
  if (status === "lost") return "cancelled";
  if (
    status === "submitted" ||
    status === "received" ||
    status === "processing" ||
    status === "waiting_customer" ||
    status === "scheduled" ||
    status === "completed" ||
    status === "cancelled"
  ) {
    return status;
  }
  return "submitted";
}

function backendRequestToSupportRequest(item: any, input?: CreateRequestInput): SupportRequest {
  const status = normalizeBackendStatus(item.status);
  const createdAt = item.createdAt ? new Date(item.createdAt).toLocaleString() : todayLabel();
  return normalizeRequest({
    id: String(item.id || item._id || createRequestId()),
    title: input?.title || item.title || item.category || item.content || "",
    category: input?.category || item.category || input?.issueTags?.[0] || "",
    description: input?.description || item.description || item.content || "",
    address: item.address || input?.address || "",
    status,
    createdAt,
    images: input?.imageName ? [input.imageName] : item.image ? [item.image] : [],
    timeline: [createTimelineEvent(status, REQUEST_TIMELINE_MESSAGE_KEYS[status], createdAt)],
    datetime: input?.datetime || item.datetime || "",
    projectName: useAppStore.getState().user?.projectName || input?.address || item.address || "",
    createdBy: item.name || input?.name || useAppStore.getState().user?.name || useAppStore.getState().user?.phone || "Customer",
    phone: item.phone || input?.phone || "",
    contact: item.contact || input?.contact || "",
    issueTags: Array.isArray(item.issueTags) ? item.issueTags : input?.issueTags || []
  });
}

async function createBackendRequest(input: CreateRequestInput): Promise<SupportRequest | null> {
  const token = getUserToken();
  if (!token) return null;

  const response = await fetch("/request", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      name: input.name,
      phone: input.phone,
      contact: input.contact,
      address: input.address,
      content: input.description,
      issueTags: input.issueTags || [],
      quoteRequested: false
    })
  });

  if (!response.ok) {
    throw new Error("Request create failed");
  }

  const payload = await response.json();
  return backendRequestToSupportRequest(payload.data || payload, input);
}

export const requestService = {
  async getRequests(): Promise<SupportRequest[]> {
    await delay();
    const requests = readRequests();
    commitRequests(requests);
    return requests;
  },

  async getRequestById(id: string): Promise<SupportRequest | null> {
    await delay();
    return readRequests().find(request => request.id === id) || null;
  },

  async createRequest(input: CreateRequestInput): Promise<SupportRequest> {
    await delay();
    const user = useAppStore.getState().user;
    const backendRequest = await createBackendRequest(input);
    if (backendRequest) {
      commitRequests([backendRequest, ...readRequests()]);
      return backendRequest;
    }

    const createdAt = todayLabel();
    const request: SupportRequest = {
      id: createRequestId(),
      title: input.title,
      category: input.category,
      description: input.description,
      address: input.address,
      status: "submitted",
      createdAt,
      images: input.imageName ? [input.imageName] : [],
      timeline: [createTimelineEvent("submitted", REQUEST_TIMELINE_MESSAGE_KEYS.submitted, createdAt)],
      datetime: input.datetime,
      projectName: user?.projectName || input.address,
      createdBy: input.name || user?.name || user?.phone || "Customer",
      phone: input.phone || user?.phone || "",
      contact: input.contact || user?.contactPerson || user?.email || "",
      issueTags: input.issueTags || []
    };
    commitRequests([request, ...readRequests()]);
    return request;
  },

  async getIssueOptions(): Promise<string[]> {
    const token = getUserToken();
    const response = await fetch("/api/work-options", {
      cache: "no-store",
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    if (!response.ok) return [];
    const payload = await response.json();
    const options = Array.isArray(payload.data) ? payload.data : [];
    return options.map((item: unknown) => String(item || "").trim()).filter(Boolean);
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
