import { signal } from "@preact/signals";
import type { Card, Column, DraggedCard, EditingCard } from "../types/index.ts";
import { COLUMNS } from "../utils/boardUtils.ts";

// Initialize default columns
const defaultColumns = COLUMNS.map((col) => ({ ...col, cards: [] }));

// Initialize columns from localStorage if available
const getInitialColumns = () => {
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
        lastTrackingStart: Date.now(),
        currentElapsedTime: 0,
      })),
    }));
  } catch (error) {
    console.error("Error parsing saved columns:", error);
    return defaultColumns;
  }
};

// Create signals for global state
export const columnsSignal = signal<Column[]>(getInitialColumns());
export const draggedCardSignal = signal<DraggedCard | null>(null);
export const isCardModalOpenSignal = signal<boolean>(false);
export const activeColumnSignal = signal<string | null>(null);
export const editingCardSignal = signal<EditingCard | null>(null);
export const deletingCardSignal = signal<
  { card: Card; columnId: string } | null
>(null);
export const isDeleteModalOpenSignal = signal<boolean>(false);
export const isLabelsCollapsedSignal = signal<boolean>(false);
export const showMobileWarningSignal = signal<boolean>(false);

// Create setter functions
export const setColumns = (
  value: Column[] | ((prev: Column[]) => Column[]),
) => {
  columnsSignal.value = typeof value === "function"
    ? value(columnsSignal.value)
    : value;
};

export const setDraggedCard = (value: DraggedCard | null) => {
  draggedCardSignal.value = value;
};

export const setIsCardModalOpen = (value: boolean) => {
  isCardModalOpenSignal.value = value;
};

export const setActiveColumn = (value: string | null) => {
  activeColumnSignal.value = value;
};

export const setEditingCard = (value: EditingCard | null) => {
  editingCardSignal.value = value;
};

export const setDeletingCard = (
  value: { card: Card; columnId: string } | null,
) => {
  deletingCardSignal.value = value;
};

export const setIsDeleteModalOpen = (value: boolean) => {
  isDeleteModalOpenSignal.value = value;
};

export const setIsLabelsCollapsed = (value: boolean) => {
  isLabelsCollapsedSignal.value = value;
};

export const setShowMobileWarning = (value: boolean) => {
  showMobileWarningSignal.value = value;
};

// Hook for components that need access to board state
export function useBoardState() {
  return {
    columns: columnsSignal.value,
    draggedCard: draggedCardSignal.value,
    isCardModalOpen: isCardModalOpenSignal.value,
    activeColumn: activeColumnSignal.value,
    editingCard: editingCardSignal.value,
    deletingCard: deletingCardSignal.value,
    isDeleteModalOpen: isDeleteModalOpenSignal.value,
    isLabelsCollapsed: isLabelsCollapsedSignal.value,
    showMobileWarning: showMobileWarningSignal.value,
    setColumns,
    setDraggedCard,
    setIsCardModalOpen,
    setActiveColumn,
    setEditingCard,
    setDeletingCard,
    setIsDeleteModalOpen,
    setIsLabelsCollapsed,
    setShowMobileWarning,
  };
}
