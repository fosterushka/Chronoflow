import { Card, Column } from "../types/index.ts";
import { TaskStateTypes } from "../types/TaskStateTypes.ts";
import { getElapsedTime } from "../signals/timeSignals.ts";
import { columnsSignal, updateCardTracking } from "../signals/boardSignals.ts";
import { dispatchBoardUpdate } from "../utils/boardUtils.ts";

export const formatTime = (seconds: number = 0) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return `${hours}h ${minutes}m ${remainingSeconds}s`;
};

export const hasExceededEstimatedTime = (card: Card) => {
  if (!card.estimatedTime) return false;
  const estimatedTimeInSeconds = card.estimatedTime * 60;
  return card.timeSpent > estimatedTimeInSeconds;
};

export const isHalfwayThroughEstimatedTime = (card: Card) => {
  if (!card.estimatedTime) return false;
  const estimatedTimeInSeconds = card.estimatedTime * 60;
  const halfTime = estimatedTimeInSeconds / 2;
  return card.timeSpent >= halfTime && card.timeSpent <= estimatedTimeInSeconds;
};

export const getTimeBasedColor = (card: Card) => {
  if (card.isTracking) {
    const estimatedTimeInSeconds = card.estimatedTime
      ? card.estimatedTime * 60
      : 0;
    const currentElapsedTime = getElapsedTime(card.lastTrackingStart || 0);
    const totalTime = card.timeSpent + currentElapsedTime;

    if (estimatedTimeInSeconds && totalTime > estimatedTimeInSeconds) {
      return `bg-red-100/90 dark:bg-red-900/90`;
    }
    if (estimatedTimeInSeconds && totalTime >= estimatedTimeInSeconds / 2) {
      return `bg-amber-100/90 dark:bg-amber-900/90`;
    }
    return `bg-emerald-100/90 dark:bg-emerald-900/90`;
  }

  if (hasExceededEstimatedTime(card)) {
    return `bg-red-50/90 dark:bg-red-900/20`;
  }
  if (isHalfwayThroughEstimatedTime(card)) {
    return `bg-amber-50/90 dark:bg-amber-900/20`;
  }
  return `bg-white/90 dark:bg-gray-800/90`;
};

export const getBoardStatistics = (columns: Column[]) => {
  const totalTasks = columns.reduce(
    (acc, col) => acc + col.cards.length,
    0,
  );
  const completedTasks =
    columns.find((col) => col.id === TaskStateTypes.DONE)?.cards.length || 0;
  const totalEstimatedTime = columns.reduce(
    (acc, col) =>
      acc + col.cards.reduce((sum, card) => sum + (card.estimatedTime || 0), 0),
    0,
  );
  const totalTimeSpent = columns.reduce(
    (acc, col) =>
      acc + col.cards.reduce((sum, card) => sum + (card.timeSpent || 0), 0),
    0,
  );

  return {
    totalTasks,
    completedTasks,
    totalEstimatedTime: totalEstimatedTime || 0,
    totalTimeSpent: totalTimeSpent || 0,
  };
};

export const syncWithLocalStorage = () => {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(
      "chronoflowColumns",
      JSON.stringify(columnsSignal.value),
    );
    dispatchBoardUpdate(columnsSignal.value);
  }
};

export const handleCardTracking = (columnId: string, cardId: string) => {
  const column = columnsSignal.value.find((col) => col.id === columnId);
  const card = column?.cards.find((c) => c.id === cardId);

  if (!card) return;

  const isTracking = !card.isTracking;
  updateCardTracking(columnId, cardId, isTracking);
  syncWithLocalStorage();
};

export const shouldStopTracking = (targetColumnId: string, card: Card) => {
  return (targetColumnId === TaskStateTypes.TODO ||
    targetColumnId === TaskStateTypes.DONE) && card.isTracking;
};
