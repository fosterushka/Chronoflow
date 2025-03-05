import { Card as SharedCard } from "./shared.ts";

export interface GitHubContributor {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  url: string;
  html_url: string;
  starred_url: string;
  repos_url: string;
  type: string;
  contributions: number;
}

// Re-export shared types
export type {
  AuditEntry,
  Card,
  ChecklistItem,
  ColumnId,
  GitHubData,
  Label,
  Meeting,
  RelatedItem,
} from "./shared.ts";

// Board-specific types
export interface Column {
  id: string;
  title: string;
  cards: SharedCard[];
}

export interface Statistics {
  totalTasks: number;
  completedTasks: number;
  totalEstimatedTime: number;
  totalTimeSpent: number;
}

export interface DraggedCard {
  card: SharedCard;
  sourceColumnId: string;
}

export interface EditingCard {
  card: SharedCard | null;
  columnId: string;
}
