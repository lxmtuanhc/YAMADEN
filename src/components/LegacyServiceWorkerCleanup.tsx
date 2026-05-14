import { useEffect } from "react";

const LEGACY_CACHE_PREFIX = "yamaden-support";

export function LegacyServiceWorkerCleanup() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations()
        .then(registrations => Promise.all(registrations.map(registration => registration.unregister())))
        .catch(() => undefined);
    }

    if ("caches" in window) {
      caches.keys()
        .then(keys => Promise.all(keys.filter(key => key.startsWith(LEGACY_CACHE_PREFIX)).map(key => caches.delete(key))))
        .catch(() => undefined);
    }
  }, []);

  return null;
}
