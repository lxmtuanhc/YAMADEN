import { create } from "zustand";
import { persist } from "zustand/middleware";
import { APP_STORAGE_KEY } from "../constants/storageKeys";
import { initialQuotes, initialRequests, initialSchedules } from "../data/mockData";
import { authService, isAuthRejected } from "../services/authService";
import type { Language, Quote, QuoteStatus, RequestStatus, Schedule, SupportRequest, User, UserStatus } from "../types";
import { getInitialLanguage, saveLanguage } from "../utils/language";

type ProfileInput = Pick<User, "name" | "email" | "phone" | "address" | "projectName" | "accountType" | "companyName" | "contactPerson">;
type ProfileUpdateInput = Partial<Pick<User, "name" | "email" | "address" | "projectName" | "companyName" | "contactPerson" | "companyAddress" | "taxId" | "constructionType" | "note" | "notificationsEnabled">>;

interface AppState {
  language: Language;
  user: User | null;
  users: User[];
  authStatus: UserStatus;
  requests: SupportRequest[];
  quotes: Quote[];
  schedules: Schedule[];
  setLanguage: (language: Language) => void;
  initializeAuth: () => Promise<void>;
  login: (phone: string, pin: string) => Promise<boolean>;
  register: (phone: string, pin: string) => Promise<void>;
  saveProfile: (profile: ProfileInput) => Promise<void>;
  updateUserProfile: (profile: ProfileUpdateInput) => Promise<User>;
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

function authStatusForUser(user: User): UserStatus {
  if (user.status === "active") return "active";
  if (user.status === "pendingApproval") return "pendingApproval";
  if (user.status === "profileIncomplete") return "profileIncomplete";
  return "notLoggedIn";
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      language: getInitialLanguage(),
      user: null,
      users: [],
      authStatus: "notLoggedIn",
      requests: initialRequests,
      quotes: initialQuotes,
      schedules: initialSchedules,
      setLanguage: language => {
        saveLanguage(language);
        set({ language });
      },
      initializeAuth: async () => {
        if (!authService.hasToken()) {
          set({ user: null, authStatus: "notLoggedIn" });
          return;
        }

        try {
          const { user } = await authService.verifySession();
          set({
            user,
            users: upsertUser(get().users || [], user),
            authStatus: authStatusForUser(user)
          });
        } catch (error) {
          if (isAuthRejected(error)) {
            authService.logout();
            set({ user: null, authStatus: "notLoggedIn" });
          }
        }
      },
      login: async (phone, pin) => {
        const { user } = await authService.login(phone.trim(), pin);
        set({ user, users: upsertUser(get().users || [], user), authStatus: authStatusForUser(user) });
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
      updateUserProfile: async profile => {
        const { user } = await authService.updateProfile(profile);
        set({
          user,
          users: upsertUser(get().users || [], user),
          authStatus: user.status === "active" ? "active" : get().authStatus
        });
        return user;
      },
      logout: () => {
        authService.logout();
        set({ user: null, authStatus: "notLoggedIn" });
      },
      updateQuoteStatus: (id, status) => {
        set({ quotes: get().quotes.map(item => (item.id === id ? { ...item, status } : item)) });
      }
    }),
    {
      name: APP_STORAGE_KEY,
      merge: (persisted, current) => {
        const state = (persisted && typeof persisted === "object" ? persisted : {}) as Partial<AppStateSnapshot>;
        return {
          ...current,
          ...state,
          language: getInitialLanguage()
        };
      },
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
