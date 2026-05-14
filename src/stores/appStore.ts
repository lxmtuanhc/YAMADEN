import { create } from "zustand";
import { persist } from "zustand/middleware";
import { APP_STORAGE_KEY } from "../constants/storageKeys";
import { defaultUser, initialQuotes, initialRequests, initialSchedules } from "../data/mockData";
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
  login: (phone: string, pin: string) => boolean;
  register: (phone: string, pin: string) => void;
  saveProfile: (profile: ProfileInput) => void;
  approvePendingUser: () => void;
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
      user: defaultUser,
      users: [defaultUser],
      authStatus: "active",
      requests: initialRequests,
      quotes: initialQuotes,
      schedules: initialSchedules,
      setLanguage: language => set({ language }),
      login: (phone, pin) => {
        const normalizedPhone = phone.trim();
        const users = get().users || [];
        const user = users.find(item => item.phone === normalizedPhone && item.pin === pin && item.status === "active");
        if (user) {
          set({ user, users: upsertUser(users, user), authStatus: "active" });
          return true;
        }
        return false;
      },
      register: (phone, pin) => {
        const newUser: User = {
          ...defaultUser,
          id: `user-${Date.now()}`,
          phone,
          pin,
          name: "",
          email: "",
          address: "",
          projectName: "",
          accountType: "personal",
          companyName: "",
          contactPerson: "",
          status: "profileIncomplete"
        };
        set({
          user: newUser,
          users: upsertUser(get().users || [], newUser),
          authStatus: "profileIncomplete"
        });
      },
      saveProfile: profile => {
        const user = get().user;
        if (!user) return;
        const nextUser: User = { ...user, ...profile, status: "pendingApproval" };
        set({
          user: nextUser,
          users: upsertUser(get().users || [], nextUser),
          authStatus: "pendingApproval"
        });
      },
      approvePendingUser: () => {
        const user = get().user;
        if (!user) return;
        const nextUser: User = { ...user, status: "active" };
        set({
          user: nextUser,
          users: upsertUser(get().users || [], nextUser),
          authStatus: "notLoggedIn"
        });
      },
      logout: () => set({ authStatus: "notLoggedIn" }),
      updateQuoteStatus: (id, status) => {
        set({ quotes: get().quotes.map(item => (item.id === id ? { ...item, status } : item)) });
      }
    }),
    {
      name: APP_STORAGE_KEY
    }
  )
);
