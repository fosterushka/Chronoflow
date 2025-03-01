const APP_VERSION = "0.0.4";
const CACHE_NAME = "chronoflow-cache-v1";

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "GET_VERSION") {
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: "VERSION",
          version: APP_VERSION,
        });
      });
    });
  }
});

const updateOnlineStatus = (isOnline) => {
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: "CONNECTION_STATUS",
        isOnline: isOnline,
      });
    });
  });
};

self.addEventListener("online", () => updateOnlineStatus(true));
self.addEventListener("offline", () => updateOnlineStatus(false));
const urlsToCache = [
  "/",
  "/styles.css",
  "/logo.svg",
  "/favicon.ico",
  "/manifest.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log("Cache opened");
        return cache.addAll(urlsToCache);
      }),
  );
});

self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        }),
      );
    }).then(() => {
      return self.clients.claim();
    }).then(() => {
      updateOnlineStatus(navigator.onLine);

      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: "VERSION",
            version: APP_VERSION,
          });
        });
      });
    }),
  );
});

self.addEventListener("fetch", (event) => {
  if (!event.request.url.startsWith("http")) {
    return;
  }

  const isFreshAsset = event.request.url.includes("/_frsh/");

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          if (!navigator.onLine) {
            updateOnlineStatus(false);
          }
          return response;
        }

        updateOnlineStatus(true);

        return fetch(event.request).then((response) => {
          if (!response || response.status !== 200) {
            return response;
          }

          if (response.type === "basic" || isFreshAsset) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
          }

          return response;
        }).catch((error) => {
          updateOnlineStatus(false);

          if (isFreshAsset) {
            console.warn("Failed to fetch Fresh.js asset:", event.request.url);
          }

          throw error;
        });
      }),
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "CHECK_FOR_UPDATES") {
    const currentVersion = APP_VERSION;
    const storedVersion = event.data.currentVersion;

    if (storedVersion && currentVersion !== storedVersion) {
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: "UPDATE_AVAILABLE",
            newVersion: currentVersion,
          });
        });
      });
    }
  }
});
