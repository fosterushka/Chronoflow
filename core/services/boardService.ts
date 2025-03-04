import { Card, Column } from "../types/index.ts";
import { TaskStateTypes } from "../types/TaskStateTypes.ts";
import { getElapsedTime } from "../signals/timeSignals.ts";
import { columnsSignal, updateCardTracking } from "../signals/boardSignals.ts";
import { dispatchBoardUpdate } from "../utils/boardUtils.ts";

/**
 * Format time in seconds to a human-readable string
 */
export const formatTime = (seconds: number = 0) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return `${hours}h ${minutes}m ${remainingSeconds}s`;
};

/**
 * Check if a card has exceeded its estimated time
 */
export const hasExceededEstimatedTime = (card: Card) => {
  if (!card.estimatedTime) return false;
  if (!card.timeSpent) return false;
  const estimatedTimeInSeconds = card.estimatedTime * 60;
  return card.timeSpent > estimatedTimeInSeconds;
};

/**
 * Check if a card is halfway through its estimated time
 */
export const isHalfwayThroughEstimatedTime = (card: Card) => {
  if (!card.estimatedTime) return false;
  if (!card.timeSpent) return false;
  const estimatedTimeInSeconds = card.estimatedTime * 60;
  const halfTime = estimatedTimeInSeconds / 2;
  return card.timeSpent >= halfTime && card.timeSpent <= estimatedTimeInSeconds;
};

/**
 * Get the appropriate color class based on a card's time status
 */
export const getTimeBasedColor = (card: Card) => {
  if (card.isTracking) {
    const estimatedTimeInSeconds = card.estimatedTime
      ? card.estimatedTime * 60
      : 0;
    const currentElapsedTime = getElapsedTime(card.lastTrackingStart || 0);
    const totalTime = (card.timeSpent || 0) + currentElapsedTime;

    if (estimatedTimeInSeconds && totalTime > estimatedTimeInSeconds) {
      return `bg-red-500/40 dark:bg-red-400/40 border-red-500 dark:border-red-400`;
    }
    if (estimatedTimeInSeconds && totalTime >= estimatedTimeInSeconds / 2) {
      return `bg-amber-500/40 dark:bg-amber-400/40 border-amber-500 dark:border-amber-400`;
    }
    return `bg-emerald-500/40 dark:bg-emerald-400/40 border-emerald-500 dark:border-emerald-400`;
  }

  if (hasExceededEstimatedTime(card)) {
    return `bg-red-500/20 dark:bg-red-400/20 border-red-500/20 dark:border-red-400/20`;
  }
  if (isHalfwayThroughEstimatedTime(card)) {
    return `bg-amber-500/20 dark:bg-amber-400/20 border-amber-500/20 dark:border-amber-400/20`;
  }
  return `bg-white/90 dark:bg-gray-800/90 border-gray-200/30 dark:border-gray-700/30`;
};

/**
 * Calculate board statistics based on columns data
 */
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

/**
 * Sync current board state with localStorage and dispatch update event
 */
export const syncWithLocalStorage = () => {
  if (typeof localStorage !== "undefined") {
    // Save the current columns to localStorage
    localStorage.setItem("chronoflowColumns", JSON.stringify(columnsSignal.value));
    
    // Dispatch board update event for other components
    dispatchBoardUpdate(columnsSignal.value);
  }
};

/**
 * Handle card tracking state toggle
 */
export const handleCardTracking = (columnId: string, cardId: string) => {
  const column = columnsSignal.value.find((col) => col.id === columnId);
  const card = column?.cards.find((c) => c.id === cardId);

  if (!card) return;

  const isTracking = !card.isTracking;
  updateCardTracking(columnId, cardId, isTracking);
  
  // Make sure to persist changes
  syncWithLocalStorage();
};

/**
 * Determine if tracking should be stopped based on column movement
 */
export const shouldStopTracking = (targetColumnId: string, card: Card) => {
  return (targetColumnId === TaskStateTypes.TODO ||
    targetColumnId === TaskStateTypes.DONE) && card.isTracking;
};
