import { Card, Label } from "./shared.ts";

// Re-export all types from shared.ts
export type {
  AuditEntry,
  Card,
  ChecklistItem,
  GitHubData,
  Label,
  Meeting,
  RelatedItem,
} from "./shared.ts";

export interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (card: Card) => void;
  labels: Label[];
  card?: Card | null;
  mode: "add" | "edit";
}

export type TabType = "task" | "github" | "context" | "audit";
