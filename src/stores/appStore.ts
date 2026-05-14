import { create } from "zustand";
import { persist } from "zustand/middleware";
import { defaultUser, initialQuotes, initialRequests, initialSchedules } from "../data/mockData";
import type { Language, Quote, QuoteStatus, RequestStatus, Schedule, SupportRequest, User, UserStatus } from "../types";

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
      updateQuoteStatus: (id, status) => {
        set({ quotes: get().quotes.map(item => (item.id === id ? { ...item, status } : item)) });
      }
    }),
    {
      name: "yamaden-mobile-spa"
    }
  )
);
