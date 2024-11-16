export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  isChecked: boolean;
}

export interface Card {
  id: string;
  title: string;
  description: string;
  labels: string[];
  dueDate?: string;
  estimatedTime?: number;
  timeSpent: number;
  isTracking: boolean;
  lastTrackingStart?: number;
  currentElapsedTime?: number;
  checklist: ChecklistItem[];
}

export interface Column {
  id: string;
  title: string;
  cards: Card[];
}

export interface Statistics {
  totalTasks: number;
  completedTasks: number;
  totalEstimatedTime: number;
  totalTimeSpent: number;
}

export interface DraggedCard {
  card: Card;
  columnId: string;
}

export interface EditingCard {
  card: Card;
  columnId: string;
}
