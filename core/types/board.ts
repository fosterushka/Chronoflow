import type { Card, ColumnId } from "./index.ts";

export interface DeleteCardState {
  card: Card;
  columnId: ColumnId;
}

export interface BoardProps {
  initialColumns?: Column[];
}

export interface Column {
  id: string;
  title: string;
  cards: Card[];
}

export interface DragState {
  isDragging: boolean;
  draggedCard: Card | null;
  sourceColumnId: string | null;
  targetColumnId: string | null;
}

export interface BoardStore {
  columns: Column[];
  dragState: DragState;
  isLabelsCollapsed: boolean;
  showMobileWarning: boolean;
}
