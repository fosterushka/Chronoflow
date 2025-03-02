import type { AuditEntry, Card } from "../types/ICardModal.ts";

export const createAuditEntry = (
  type: AuditEntry["type"],
  options: {
    field?: string;
    oldValue?: string;
    newValue?: string;
    userId?: string;
    columnId?: string;
  } = {},
): AuditEntry => ({
  id: crypto.randomUUID(),
  timestamp: Date.now(),
  type,
  ...options,
});

export const addAuditEntry = (card: Card, entry: AuditEntry): Card => ({
  ...card,
  auditHistory: [...(card.auditHistory || []), entry],
  updatedAt: Date.now(),
});
