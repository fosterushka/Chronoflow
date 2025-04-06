import { GitHubContributor } from "./index.ts";

export type ColumnId = string;

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  isChecked: boolean;
  createdAt?: string;
}

export interface Meeting {
  id: string;
  platform: "zoom" | "google" | "teams" | "other";
  url: string;
  title: string;
}

export interface RelatedItem {
  id: string;
  type: "link" | "file";
  title: string;
  url?: string;
  fileType?: string;
  fileSize?: number;
  fileUrl?: string;
  size?: number;
  mimeType?: string;
}

export interface AuditEntry {
  id: string;
  timestamp: number;
  type: "create" | "update" | "move" | "status_change" | "comment";
  field?: string;
  oldValue?: string;
  newValue?: string;
  userId?: string;
  columnId?: string;
}

export interface GitHubData {
  repo: string;
  assignees: string[];
  cachedContributors: GitHubContributor[];
}

export interface Card {
  id?: string;
  title: string;
  description: string;
  labels: string[];

  // Time tracking properties
  dueDate?: string;
  estimatedTime?: number;
  timeSpent?: number;
  isTracking?: boolean;
  lastTrackingStart?: number;
  currentElapsedTime?: number;

  // Card content
  checklist?: ChecklistItem[];
  meetings?: Meeting[];
  relatedItems?: RelatedItem[];
  github?: GitHubData;

  // Audit and metadata
  auditHistory?: AuditEntry[];
  createdAt?: number;
  updatedAt?: number;
  createdBy?: string;
  lastUpdatedBy?: string;
}
