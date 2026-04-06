// Push notification service worker
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "Ancrage";
  const options = {
    body: data.body || "Comment tu te sens aujourd'hui ?",
    icon: "/placeholder.svg",
    badge: "/placeholder.svg",
    data: { url: data.url || "/checkin" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/checkin";
  event.waitUntil(clients.openWindow(url));
});
