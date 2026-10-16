// Service Worker Unregistration & Cache Buster for Freshioz
// Ensures clients always receive 100% live code without being trapped by stale service worker caches
export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().then(() => {
          console.log('[PWA] Unregistered legacy worker:', registration.scope);
        });
      }
    });

    if ('caches' in window) {
      caches.keys().then((keys) => {
        keys.forEach((key) => {
          caches.delete(key);
        });
      });
    }
  }
}
