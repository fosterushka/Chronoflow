import { computed, signal, Signal, ReadonlySignal } from "@preact/signals";
import type { Card, Column, DraggedCard } from "../types/index.ts";
import { getElapsedTime } from "./timeSignals.ts";
import { createAuditEntry, addAuditEntry } from "../utils/auditUtils.ts";

// Types
interface BoardStore {
  columns: Signal<Column[]>;
  draggedCard: Signal<DraggedCard | null>;
  activeColumn: Signal<string | null>;
  isLabelsCollapsed: Signal<boolean>;
  showMobileWarning: Signal<boolean>;
  activeCards: ReadonlySignal<number>;
  trackedCards: ReadonlySignal<number>;
  currentTrackedCard: ReadonlySignal<{ card: Card; columnId: string } | null>;
  updateCardTracking: (columnId: string, cardId: string, isTracking: boolean) => void;
  moveCard: (card: Card, sourceColumnId: string, targetColumnId: string) => void;
  cleanup: () => void;
}

// Helper function to get initial columns
const getInitialColumns = (): Column[] => {
  const COLUMNS: Omit<Column, "cards">[] = [
    { id: "todo", title: "To Do" },
    { id: "inProgress", title: "In Progress" },
    { id: "codeReview", title: "Code Review" },
    { id: "testing", title: "Testing" },
    { id: "done", title: "Done" },
  ];
  const defaultColumns = COLUMNS.map((col) => ({ ...col, cards: [] }));

  if (typeof localStorage === "undefined") {
    return defaultColumns;
  }

  const savedData = localStorage.getItem("chronoflowColumns");
  if (!savedData) {
    return defaultColumns;
  }

  try {
    const parsedData = JSON.parse(savedData);
    return parsedData.map((col: Column) => ({
      ...col,
      cards: col.cards.map((card) => ({
        ...card,
        timeSpent: card.timeSpent || 0,
        isTracking: false,
        lastTrackingStart: undefined,
        currentElapsedTime: 0,
      })),
    }));
  } catch (error) {
    console.error("Error parsing saved columns:", error);
    return defaultColumns;
  }
};

// Create board store
const createBoardStore = (): BoardStore => {
  // Core signals
  const columns = signal<Column[]>(getInitialColumns());
  const draggedCard = signal<DraggedCard | null>(null);
  const activeColumn = signal<string | null>(null);
  const isLabelsCollapsed = signal(false);
  const showMobileWarning = signal(false);

  // Computed signals
  const activeCards = computed(() => {
    return columns.value.reduce((acc, col) => acc + col.cards.length, 0);
  });

  const trackedCards = computed(() => {
    return columns.value.reduce(
      (acc, col) => acc + col.cards.filter((card) => card.isTracking).length,
      0,
    );
  });

  const currentTrackedCard = computed(() => {
    for (const column of columns.value) {
      const trackedCard = column.cards.find((card) => card.isTracking);
      if (trackedCard) {
        return { card: trackedCard, columnId: column.id };
      }
    }
    return null;
  });

  // Update functions
  const updateCardTracking = (
    columnId: string,
    cardId: string,
    isTracking: boolean,
  ) => {
    columns.value = columns.value.map((column) => {
      if (isTracking) {
        return {
          ...column,
          cards: column.cards.map((card) => {
            if (column.id === columnId && card.id === cardId) {
              const updatedCard = {
                ...card,
                isTracking: true,
                lastTrackingStart: Date.now(),
                currentElapsedTime: 0,
              };
              return addAuditEntry(updatedCard, createAuditEntry('status_change', {
                oldValue: 'not_tracking',
                newValue: 'tracking',
                columnId
              }));
            }
            if (card.isTracking) {
              const updatedCard = {
                ...card,
                isTracking: false,
                lastTrackingStart: undefined,
                timeSpent: (card.timeSpent || 0) + getElapsedTime(card.lastTrackingStart || 0),
                currentElapsedTime: 0,
              };
              return addAuditEntry(updatedCard, createAuditEntry('status_change', {
                oldValue: 'tracking',
                newValue: 'not_tracking',
                columnId: column.id
              }));
            }
            return card;
          }),
        };
      }

      if (column.id === columnId) {
        return {
          ...column,
          cards: column.cards.map((card) => {
            if (card.id === cardId) {
              const updatedCard = {
                ...card,
                isTracking: false,
                lastTrackingStart: undefined,
                timeSpent: (card.timeSpent || 0) + getElapsedTime(card.lastTrackingStart || 0),
                currentElapsedTime: 0,
              };
              return addAuditEntry(updatedCard, createAuditEntry('status_change', {
                oldValue: 'tracking',
                newValue: 'not_tracking',
                columnId
              }));
            }
            return card;
          }),
        };
      }
      return column;
    });
  };

  const moveCard = (
    card: Card,
    sourceColumnId: string,
    targetColumnId: string,
  ) => {
    // Stop tracking if card is moved to done or todo
    const shouldStopTrack =
      (targetColumnId === "done" || targetColumnId === "todo") && card.isTracking;

    const updatedCard = shouldStopTrack
      ? {
        ...card,
        isTracking: false,
        lastTrackingStart: undefined,
        timeSpent: (card.timeSpent || 0) + getElapsedTime(card.lastTrackingStart || 0),
        currentElapsedTime: 0,
      }
      : card;

    // Add move audit entry
    const cardWithAudit = addAuditEntry(updatedCard, createAuditEntry('move', {
      oldValue: sourceColumnId,
      newValue: targetColumnId,
      columnId: targetColumnId
    }));

    columns.value = columns.value.map((column) => {
      if (column.id === sourceColumnId) {
        return {
          ...column,
          cards: column.cards.filter((c) => c.id !== card.id),
        };
      }
      if (column.id === targetColumnId) {
        return {
          ...column,
          cards: [...column.cards, cardWithAudit],
        };
      }
      return column;
    });
  };

  // Cleanup function
  const cleanup = () => {
    columns.value = getInitialColumns();
    draggedCard.value = null;
    activeColumn.value = null;
    isLabelsCollapsed.value = false;
    showMobileWarning.value = false;
  };

  return {
    // Expose signals
    columns,
    draggedCard,
    activeColumn,
    isLabelsCollapsed,
    showMobileWarning,
    // Expose computed values
    activeCards,
    trackedCards,
    currentTrackedCard,
    // Expose methods
    updateCardTracking,
    moveCard,
    cleanup,
  };
};

// Create and export store instance
export const boardStore = createBoardStore();

// Export individual signals and computed values for convenience
export const {
  columns: columnsSignal,
  draggedCard: draggedCardSignal,
  activeColumn: activeColumnSignal,
  isLabelsCollapsed: isLabelsCollapsedSignal,
  showMobileWarning: showMobileWarningSignal,
  activeCards,
  trackedCards,
  currentTrackedCard,
  updateCardTracking,
  moveCard,
  cleanup: cleanupBoardStore,
} = boardStore;
