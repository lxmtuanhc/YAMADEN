import { create } from "zustand";
import { persist } from "zustand/middleware";
import { APP_STORAGE_KEY } from "../constants/storageKeys";
import { initialQuotes, initialRequests, initialSchedules } from "../data/mockData";
import { authService } from "../services/authService";
import type { Language, Quote, QuoteStatus, RequestStatus, Schedule, SupportRequest, User, UserStatus } from "../types";

type ProfileInput = Pick<User, "name" | "email" | "phone" | "address" | "projectName" | "accountType" | "companyName" | "contactPerson">;

interface AppState {
  language: Language;
  user: User | null;
  users: User[];
  authStatus: UserStatus;
  requests: SupportRequest[];
  quotes: Quote[];
  schedules: Schedule[];
  setLanguage: (language: Language) => void;
  login: (phone: string, pin: string) => Promise<boolean>;
  register: (phone: string, pin: string) => Promise<void>;
  saveProfile: (profile: ProfileInput) => Promise<void>;
  logout: () => void;
  updateQuoteStatus: (id: string, status: QuoteStatus) => void;
}

export type AppStateSnapshot = Pick<AppState, "language" | "user" | "users" | "authStatus" | "requests" | "quotes" | "schedules">;

function upsertUser(users: User[], user: User) {
  const existing = users.some(item => item.id === user.id || item.phone === user.phone);
  if (existing) {
    return users.map(item => (item.id === user.id || item.phone === user.phone ? user : item));
  }
  return [user, ...users];
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      language: "vi",
      user: null,
      users: [],
      authStatus: "notLoggedIn",
      requests: initialRequests,
      quotes: initialQuotes,
      schedules: initialSchedules,
      setLanguage: language => set({ language }),
      login: async (phone, pin) => {
        const { user } = await authService.login(phone.trim(), pin);
        const authStatus = user.status === "active" ? "active" : user.status === "pendingApproval" ? "pendingApproval" : "notLoggedIn";
        set({ user, users: upsertUser(get().users || [], user), authStatus });
        return user.status === "active";
      },
      register: async (phone, pin) => {
        const { user } = await authService.register(phone.trim(), pin);
        set({
          user,
          users: upsertUser(get().users || [], user),
          authStatus: "profileIncomplete"
        });
      },
      saveProfile: async profile => {
        const { user } = await authService.saveProfile(profile);
        set({
          user,
          users: upsertUser(get().users || [], user),
          authStatus: user.status === "active" ? "active" : "pendingApproval"
        });
      },
      logout: () => {
        authService.logout();
        set({ authStatus: "notLoggedIn" });
      },
      updateQuoteStatus: (id, status) => {
        set({ quotes: get().quotes.map(item => (item.id === id ? { ...item, status } : item)) });
      }
    }),
    {
      name: APP_STORAGE_KEY
    }
  )
);
