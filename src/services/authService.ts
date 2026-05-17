import type { User, UserStatus } from "../types";

const USER_TOKEN_KEY = "yamaden-user-token";
const LEGACY_USER_TOKEN_KEY = "userToken";

export function getUserToken() {
  const token = localStorage.getItem(USER_TOKEN_KEY) || localStorage.getItem(LEGACY_USER_TOKEN_KEY) || "";
  if (token && !localStorage.getItem(USER_TOKEN_KEY)) {
    localStorage.setItem(USER_TOKEN_KEY, token);
  }
  return token;
}

export function hasUserToken() {
  return Boolean(getUserToken());
}

type BackendUser = Partial<User> & {
  _id?: string;
  company?: string;
  customerType?: "personal" | "company";
  province?: string;
  contact?: string;
  companyAddress?: string;
  taxId?: string;
  constructionType?: string;
  note?: string;
  notificationsEnabled?: boolean;
  status?: string;
};

type AuthResponse = {
  data?: {
    user?: BackendUser;
    token?: string;
    status?: UserStatus;
  };
  user?: BackendUser;
  token?: string;
  status?: UserStatus;
};

export type AuthRequestError = Error & {
  status?: number;
};

export function isAuthRejected(error: unknown) {
  const status = (error as AuthRequestError | undefined)?.status;
  return status === 401 || status === 403;
}

function authHeaders() {
  const token = getUserToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

function normalizeStatus(status?: string): UserStatus {
  if (status === "pending") return "pendingApproval";
  if (status === "active" || status === "rejected" || status === "profileIncomplete" || status === "pendingApproval") {
    return status;
  }
  return "pendingApproval";
}

function normalizeUser(user: BackendUser): User {
  return {
    id: String(user.id || user._id || ""),
    phone: user.phone || "",
    name: user.name || "",
    email: user.email || "",
    status: normalizeStatus(user.status),
    address: user.address || user.province || "",
    projectName: user.projectName || "",
    accountType: user.accountType || user.customerType || "personal",
    companyName: user.companyName || user.company || "",
    contactPerson: user.contactPerson || user.contact || "",
    companyAddress: user.companyAddress || "",
    taxId: user.taxId || "",
    constructionType: user.constructionType || "",
    note: user.note || "",
    notificationsEnabled: user.notificationsEnabled
  };
}

async function parseAuthResponse(response: Response): Promise<{ user: User; token?: string; status: UserStatus }> {
  const payload = (await response.json().catch(() => ({}))) as AuthResponse;

  if (!response.ok) {
    const error = new Error("Auth request failed") as AuthRequestError;
    error.status = response.status;
    throw error;
  }

  const user = payload.data?.user || payload.user;
  if (!user) {
    throw new Error("Auth response missing user");
  }

  const token = payload.data?.token || payload.token;
  if (token) {
    localStorage.setItem(USER_TOKEN_KEY, token);
    localStorage.setItem(LEGACY_USER_TOKEN_KEY, token);
  }

  const normalizedUser = normalizeUser(user);
  return {
    user: normalizedUser,
    token,
    status: payload.data?.status || payload.status || normalizedUser.status
  };
}

export const authService = {
  hasToken: hasUserToken,

  async register(phone: string, pin: string) {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, pin })
    });
    return parseAuthResponse(response);
  },

  async saveProfile(profile: Pick<User, "name" | "email" | "phone" | "address" | "projectName" | "accountType" | "companyName" | "contactPerson">) {
    const response = await fetch("/api/auth/profile", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        address: profile.address,
        projectName: profile.projectName,
        companyType: profile.accountType,
        companyName: profile.companyName,
        contactPerson: profile.contactPerson
      })
    });
    return parseAuthResponse(response);
  },

  async login(phone: string, pin: string) {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, pin })
    });
    return parseAuthResponse(response);
  },

  async updateProfile(profile: Partial<Pick<User,
    "name" | "email" | "companyName" | "contactPerson" | "companyAddress" | "taxId" |
    "projectName" | "address" | "constructionType" | "note" | "notificationsEnabled"
  >>) {
    const response = await fetch("/api/users/profile", {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({
        name: profile.name,
        email: profile.email,
        companyName: profile.companyName,
        personInCharge: profile.contactPerson,
        contactPerson: profile.contactPerson,
        companyAddress: profile.companyAddress,
        taxId: profile.taxId,
        projectName: profile.projectName,
        siteAddress: profile.address,
        address: profile.address,
        constructionType: profile.constructionType,
        notes: profile.note,
        note: profile.note,
        notificationsEnabled: profile.notificationsEnabled
      })
    });
    return parseAuthResponse(response);
  },

  async verifySession() {
    const response = await fetch("/api/auth/me", {
      method: "GET",
      headers: authHeaders(),
      cache: "no-store"
    });
    if (response.status === 404 || response.status === 405) {
      const legacyResponse = await fetch("/user/me", {
        method: "GET",
        headers: authHeaders(),
        cache: "no-store"
      });
      return parseAuthResponse(legacyResponse);
    }
    return parseAuthResponse(response);
  },

  logout() {
    localStorage.removeItem(USER_TOKEN_KEY);
    localStorage.removeItem(LEGACY_USER_TOKEN_KEY);
    localStorage.removeItem("userProfile");
  }
};
