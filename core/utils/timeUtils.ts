/**
 * Format seconds to HH:MM:SS format
 */
export const formatTimeHHMMSS = (seconds: number): string => {
  if (seconds < 0) return "00:00:00";
  if (!Number.isFinite(seconds)) return "Invalid input";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [
    hours.toString().padStart(2, "0"),
    minutes.toString().padStart(2, "0"),
    secs.toString().padStart(2, "0"),
  ];

  return parts.join(":");
};

/**
 * Format seconds to human readable format (Xh Ym Zs)
 */
export const formatTimeHuman = (seconds: number = 0): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return `${hours}h ${minutes}m ${remainingSeconds}s`;
};

/**
 * Format timestamp to relative time
 */
export const formatRelativeTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else if (diffInHours < 48) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  }
};