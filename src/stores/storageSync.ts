import { APP_STORAGE_KEY } from "../constants/storageKeys";
import type { AppStateSnapshot } from "./appStore";
import { useAppStore } from "./appStore";

let isStorageSyncInitialized = false;

function applySnapshot(snapshot?: Partial<AppStateSnapshot>) {
  if (!snapshot) return;
  useAppStore.setState({
    ...(snapshot.language ? { language: snapshot.language } : {}),
    ...(snapshot.user !== undefined ? { user: snapshot.user } : {}),
    ...(Array.isArray(snapshot.users) ? { users: snapshot.users } : {}),
    ...(snapshot.authStatus ? { authStatus: snapshot.authStatus } : {}),
    ...(Array.isArray(snapshot.requests) ? { requests: snapshot.requests } : {}),
    ...(Array.isArray(snapshot.quotes) ? { quotes: snapshot.quotes } : {}),
    ...(Array.isArray(snapshot.schedules) ? { schedules: snapshot.schedules } : {})
  });
}

export function initStorageSync() {
  if (isStorageSyncInitialized || typeof window === "undefined") return;
  isStorageSyncInitialized = true;

  window.addEventListener("storage", event => {
    if (event.key !== APP_STORAGE_KEY || !event.newValue) return;
    try {
      const parsed = JSON.parse(event.newValue) as { state?: Partial<AppStateSnapshot> };
      applySnapshot(parsed.state);
    } catch (error) {
      console.warn("Unable to sync app storage", error);
    }
  });
}
