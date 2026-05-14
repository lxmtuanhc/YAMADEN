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

function stripSecretFields<T>(value: T): T {
  if (Array.isArray(value)) return value.map(item => stripSecretFields(item)) as T;
  if (!value || typeof value !== "object") return value;
  const source = value as Record<string, unknown>;
  const sanitized: Record<string, unknown> = {};
  Object.keys(source).forEach(key => {
    const lowerKey = key.toLowerCase();
    if (lowerKey === "pin" || lowerKey === "password" || lowerKey === "passcode") return;
    sanitized[key] = stripSecretFields(source[key]);
  });
  return sanitized as T;
}

function cleanupPersistedSecrets() {
  const secretKeys = new Set(["pin", "password", "passcode", "userpassword", "accountpin", "accountpassword"]);
  try {
    [localStorage, sessionStorage].forEach(storage => {
      Array.from({ length: storage.length }, (_, index) => storage.key(index))
        .filter((key): key is string => Boolean(key))
        .forEach(key => {
          if (secretKeys.has(key.toLowerCase())) {
            storage.removeItem(key);
            return;
          }
          const raw = storage.getItem(key);
          if (!raw) return;
          try {
            const parsed = JSON.parse(raw);
            const sanitized = stripSecretFields(parsed);
            if (JSON.stringify(parsed) !== JSON.stringify(sanitized)) {
              storage.setItem(key, JSON.stringify(sanitized));
            }
          } catch {
            // Plain values such as tokens and language are not JSON state.
          }
        });
    });
  } catch (error) {
    console.warn("Unable to cleanup persisted auth secrets", error);
  }
}

cleanupPersistedSecrets();

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
      name: APP_STORAGE_KEY,
      partialize: state => stripSecretFields({
        language: state.language,
        user: state.user,
        users: state.users,
        authStatus: state.authStatus,
        requests: state.requests,
        quotes: state.quotes,
        schedules: state.schedules
      })
    }
  )
);
