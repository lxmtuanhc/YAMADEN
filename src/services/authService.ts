import type { User, UserStatus } from "../types";

const USER_TOKEN_KEY = "yamaden-user-token";

export function getUserToken() {
  return localStorage.getItem(USER_TOKEN_KEY) || "";
}

type BackendUser = Partial<User> & {
  _id?: string;
  company?: string;
  customerType?: "personal" | "company";
  province?: string;
  contact?: string;
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
    contactPerson: user.contactPerson || user.contact || ""
  };
}

async function parseAuthResponse(response: Response): Promise<{ user: User; token?: string; status: UserStatus }> {
  const payload = (await response.json()) as AuthResponse;

  if (!response.ok) {
    throw new Error("Auth request failed");
  }

  const user = payload.data?.user || payload.user;
  if (!user) {
    throw new Error("Auth response missing user");
  }

  const token = payload.data?.token || payload.token;
  if (token) {
    localStorage.setItem(USER_TOKEN_KEY, token);
  }

  const normalizedUser = normalizeUser(user);
  return {
    user: normalizedUser,
    token,
    status: payload.data?.status || payload.status || normalizedUser.status
  };
}

export const authService = {
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

  logout() {
    localStorage.removeItem(USER_TOKEN_KEY);
  }
};
