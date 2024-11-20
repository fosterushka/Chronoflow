import { computed, signal } from "@preact/signals";
import type { Card, Column, DraggedCard } from "../types/index.ts";
import { getElapsedTime } from "./timeSignals.ts";

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

// Board State Signals
export const columnsSignal = signal<Column[]>(getInitialColumns());
export const draggedCardSignal = signal<DraggedCard | null>(null);
export const activeColumnSignal = signal<string | null>(null);
export const isLabelsCollapsedSignal = signal(false);
export const showMobileWarningSignal = signal(false);

// Computed Signals
export const activeCards = computed(() => {
  const columns = columnsSignal.value;
  return columns.reduce((acc, col) => acc + col.cards.length, 0);
});

export const trackedCards = computed(() => {
  const columns = columnsSignal.value;
  return columns.reduce(
    (acc, col) => acc + col.cards.filter((card) => card.isTracking).length,
    0,
  );
});

// Update functions
export const updateCardTracking = (
  columnId: string,
  cardId: string,
  isTracking: boolean,
) => {
  columnsSignal.value = columnsSignal.value.map((column) => {
    if (column.id !== columnId) return column;

    return {
      ...column,
      cards: column.cards.map((card) => {
        if (card.id !== cardId) return card;

        return {
          ...card,
          isTracking,
          lastTrackingStart: isTracking ? Date.now() : undefined,
          timeSpent: !isTracking
            ? (card.timeSpent || 0) +
              getElapsedTime(card.lastTrackingStart || 0)
            : card.timeSpent,
          currentElapsedTime: 0,
        };
      }),
    };
  });
};

export const moveCard = (
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
      timeSpent: (card.timeSpent || 0) +
        getElapsedTime(card.lastTrackingStart || 0),
      lastTrackingStart: undefined,
    }
    : card;

  columnsSignal.value = columnsSignal.value.map((column) => {
    if (column.id === sourceColumnId) {
      return {
        ...column,
        cards: column.cards.filter((c) => c.id !== card.id),
      };
    }
    if (column.id === targetColumnId) {
      return {
        ...column,
        cards: [...column.cards, updatedCard],
      };
    }
    return column;
  });
};
