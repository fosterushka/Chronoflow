import type { Meeting } from "../types/ICardModal.ts";

export const validateUrl = (url: string): boolean => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

export const getMeetingPlatform = (url: string): Meeting["platform"] => {
    if (url.includes("zoom")) return "zoom";
    if (url.includes("meet.google")) return "google";
    if (url.includes("teams")) return "teams";
    return "other";
};

export const formatFileSize = (bytes: number): string => {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};
