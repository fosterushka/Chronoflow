import { computed, signal } from "@preact/signals";

export const currentTime = signal(Date.now());

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

export const getElapsedTime = (startTime: number) => {
  return Math.floor((currentTime.value - startTime) / 1000);
};

let timerId: number;

if (typeof window !== "undefined") {
  const updateTime = () => {
    currentTime.value = Date.now();
    timerId = globalThis.setTimeout(updateTime, 1000);
  };

  timerId = globalThis.setTimeout(updateTime, 1000);
}

export const cleanup = () => {
  if (typeof window !== "undefined" && timerId) {
    globalThis.clearTimeout(timerId);
  }
};
