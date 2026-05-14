import { initialRequests } from "../data/mockData";
import { useAppStore } from "../stores/appStore";
import type { RequestStatus, SupportRequest, TimelineEvent } from "../types";
import { createRequestId, todayLabel } from "../utils/format";
import { REQUEST_TIMELINE_MESSAGE_KEYS } from "../constants/requestStatus";

const STORAGE_KEY = "yamaden-mobile-spa";

export interface CreateRequestInput {
  category: string;
  title: string;
  description: string;
  address: string;
  datetime?: string;
  imageName?: string;
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
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
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
      createdBy: user?.name || user?.phone || "Customer"
    };
    commitRequests([request, ...readRequests()]);
    return request;
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
