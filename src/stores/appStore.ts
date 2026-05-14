import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createRequestId, todayLabel } from "../utils/format";
import { defaultUser, initialQuotes, initialRequests, initialSchedules } from "../data/mockData";
import type { Language, Quote, QuoteStatus, RequestStatus, Schedule, SupportRequest, User, UserStatus } from "../types";

interface NewRequestInput {
  category: string;
  title: string;
  description: string;
  address: string;
  datetime: string;
  imageName?: string;
}

interface AppState {
  language: Language;
  user: User | null;
  authStatus: UserStatus;
  requests: SupportRequest[];
  quotes: Quote[];
  schedules: Schedule[];
  setLanguage: (language: Language) => void;
  login: (phone: string, pin: string) => boolean;
  register: (phone: string, pin: string) => void;
  saveProfile: (profile: Omit<User, "id" | "phone" | "pin" | "status">) => void;
  approvePendingUser: () => void;
  logout: () => void;
  createRequest: (input: NewRequestInput) => SupportRequest;
  updateRequestStatus: (id: string, status: RequestStatus) => void;
  updateQuoteStatus: (id: string, status: QuoteStatus) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      language: "vi",
      user: defaultUser,
      authStatus: "active",
      requests: initialRequests,
      quotes: initialQuotes,
      schedules: initialSchedules,
      setLanguage: language => set({ language }),
      login: (phone, pin) => {
        const user = get().user;
        if (user && user.phone === phone && user.pin === pin && user.status === "active") {
          set({ authStatus: "active" });
          return true;
        }
        return false;
      },
      register: (phone, pin) => {
        set({
          user: {
            ...defaultUser,
            id: `user-${Date.now()}`,
            phone,
            pin,
            name: "",
            email: "",
            address: "",
            projectName: "",
            companyType: "",
            status: "profileIncomplete"
          },
          authStatus: "profileIncomplete"
        });
      },
      saveProfile: profile => {
        const user = get().user;
        if (!user) return;
        set({
          user: { ...user, ...profile, status: "pendingApproval" },
          authStatus: "pendingApproval"
        });
      },
      approvePendingUser: () => {
        const user = get().user;
        if (!user) return;
        set({
          user: { ...user, status: "active" },
          authStatus: "notLoggedIn"
        });
      },
      logout: () => set({ authStatus: "notLoggedIn" }),
      createRequest: input => {
        const user = get().user;
        const request: SupportRequest = {
          id: createRequestId(),
          category: input.category,
          title: input.title,
          description: input.description,
          address: input.address,
          datetime: input.datetime,
          projectName: user?.projectName || input.address,
          createdAt: todayLabel(),
          createdBy: user?.name || user?.phone || "Customer",
          status: "submitted",
          images: input.imageName ? [input.imageName] : []
        };
        set({ requests: [request, ...get().requests] });
        return request;
      },
      updateRequestStatus: (id, status) => {
        set({ requests: get().requests.map(item => (item.id === id ? { ...item, status } : item)) });
      },
      updateQuoteStatus: (id, status) => {
        set({ quotes: get().quotes.map(item => (item.id === id ? { ...item, status } : item)) });
      }
    }),
    {
      name: "yamaden-mobile-spa"
    }
  )
);
