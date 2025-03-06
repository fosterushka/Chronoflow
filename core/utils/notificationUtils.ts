export async function requestNotificationPermission() {
  if (!("Notification" in window)) return false;

  const permission = await Notification.requestPermission();
  return permission === "granted";
}

export function sendNotification(title: string, options?: NotificationOptions) {
  if (!("Notification" in window)) return;

  if (Notification.permission === "granted") {
    new Notification(title, options);
  }
}

export function checkTimeThresholds(
  estimatedTime: number,
  timeSpent: number,
  cardTitle: string,
) {
  const estimatedSeconds = estimatedTime * 60;
  const halfTime = estimatedSeconds / 2;

  if (timeSpent >= estimatedSeconds) {
    sendNotification("Time Exceeded!", {
      body: `Task "${cardTitle}" has exceeded its estimated time.`,
      icon: "/icons/favicon-192x192.png",
      tag: `time-exceeded-${cardTitle}`,
    });
    return "exceeded";
  } else if (timeSpent >= halfTime) {
    sendNotification("Time Warning!", {
      body: `Task "${cardTitle}" has reached 50% of its estimated time.`,
      icon: "/icons/favicon-192x192.png",
      tag: `time-warning-${cardTitle}`,
    });
    return "warning";
  }
  return "normal";
}
