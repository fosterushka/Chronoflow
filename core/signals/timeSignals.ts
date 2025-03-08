import { computed, signal } from "@preact/signals";
import type { Card } from "../types/index.ts";
import { addNotification } from "./notificationSignals.ts";

/** Current timestamp signal */
export const currentTime = signal(Date.now());

/** Track which warnings have been shown for each task */
const shownWarnings = new Map<string, Set<"warning" | "exceeded">>();

/** Time warning signal */
export const timeWarningSignal = signal<{
  type: "normal" | "warning" | "exceeded";
  cardId: string | null;
}>({
  type: "normal",
  cardId: null,
});

/** Computed signal for formatted time */
export const formattedTime = computed(() => {
  const time = currentTime.value;
  const hours = Math.floor(time / 3600000);
  const minutes = Math.floor((time % 3600000) / 60000);
  const seconds = Math.floor((time % 60000) / 1000);

  return {
    hours,
    minutes,
    seconds,
    formatted: `${String(hours).padStart(2, "0")}:${
      String(minutes).padStart(2, "0")
    }:${String(seconds).padStart(2, "0")}`,
  };
});

/** Calculate elapsed time in seconds */
export const getElapsedTime = (startTime: number) => {
  return Math.floor((currentTime.value - startTime) / 1000);
};

let timerId: number;

/** Initialize notifications and request permission */
export async function initializeNotifications() {
  if (typeof window === "undefined") return;

  if ("Notification" in window) {
    try {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }
  return false;
}

/** Check time thresholds and update warning signal */
export function checkTimeThresholds(card: Card) {
  if (!card.isTracking || !card.estimatedTime) return;

  const currentElapsed = getElapsedTime(card.lastTrackingStart || Date.now());
  const totalTime = (card.timeSpent || 0) + currentElapsed;
  const estimatedSeconds = card.estimatedTime * 60;

  // Get or initialize the set of shown warnings for this card
  if (card.id && !shownWarnings.has(card.id)) {
    shownWarnings.set(card.id, new Set());
  }
  const cardWarnings = shownWarnings.get(card.id)!;

  // Only show exceeded warning if we haven't shown it before
  if (totalTime >= estimatedSeconds && !cardWarnings.has("exceeded")) {
    timeWarningSignal.value = {
      type: "exceeded",
      cardId: card.id ?? null,
    };
    cardWarnings.add("exceeded");

    // Add floating notification
    addNotification({
      title: "Time Exceeded!",
      message: `Task "${card.title}" has exceeded its estimated time.`,
      type: "exceeded",
      cardId: card.id,
    });

    // Send browser notification
    sendNotification("Time Exceeded!", card.title);
  } // Only show warning if we haven't shown it or exceeded warning before
  else if (
    totalTime >= estimatedSeconds / 2 &&
    !cardWarnings.has("warning") &&
    !cardWarnings.has("exceeded")
  ) {
    timeWarningSignal.value = {
      type: "warning",
      cardId: card.id ?? null,
    };
    cardWarnings.add("warning");

    // Add floating notification
    addNotification({
      title: "Time Warning!",
      message: `Task "${card.title}" has reached 50% of its estimated time.`,
      type: "warning",
      cardId: card.id,
    });

    // Send browser notification
    sendNotification("Time Warning!", card.title);
  }
}

/** Send browser notification */
function sendNotification(type: string, cardTitle: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return;

  if (Notification.permission === "granted") {
    new Notification(`${type} - ${cardTitle}`, {
      body: type === "Time Exceeded!"
        ? `Task "${cardTitle}" has exceeded its estimated time.`
        : `Task "${cardTitle}" has reached 50% of its estimated time.`,
      icon: "/icons/favicon-192x192.png",
      tag: `time-${type}-${cardTitle}`,
    });
  }
}

if (typeof window !== "undefined") {
  const updateTime = () => {
    currentTime.value = Date.now();
    timerId = globalThis.setTimeout(updateTime, 1000);
  };

  timerId = globalThis.setTimeout(updateTime, 1000);
}

/** Cleanup function to clear the timer */
export const cleanup = () => {
  if (typeof window !== "undefined" && timerId) {
    globalThis.clearTimeout(timerId);
  }
};

/** Reset warnings for a specific card - only call this when actually resetting the card */
export function resetCardWarnings(cardId: string) {
  shownWarnings.delete(cardId);
}

/** Reset all warnings */
export function resetAllWarnings() {
  shownWarnings.clear();
}
