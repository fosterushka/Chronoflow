import { JSX } from "preact";
import { Card } from "../core/types/index.ts";
import { LABELS } from "../core/utils/boardUtils.ts";
import { TaskStateTypes } from "../core/types/TaskStateTypes.ts";
import { useMemo, useRef } from "preact/hooks";
import { handleCardTracking } from "../core/services/boardService.ts";
import { useComputed } from "@preact/signals";
import { currentTime, getElapsedTime } from "../core/signals/timeSignals.ts";
import CardPreviewPip from "./CardPreviewPip.tsx";
import { experimentalFeaturesEnabled } from "./HeaderControls.tsx";

interface CardPreviewProps {
  card: Card;
  columnId: string;
  isLabelsCollapsed: boolean;
  onLabelClick: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDragOver: (e: JSX.TargetedDragEvent<HTMLDivElement>) => void;
  onClick: () => void;
  onDelete: (e: JSX.TargetedMouseEvent<HTMLButtonElement>) => void;
  getTimeBasedColor: (card: Card) => string;
  formatTime: (seconds: number) => string;
  hasExceededEstimatedTime: (card: Card) => boolean;
}

export default function CardPreview({
  card,
  columnId,
  isLabelsCollapsed,
  onLabelClick,
  onDragStart,
  onDragEnd,
  onDragOver,
  onClick,
  onDelete,
  getTimeBasedColor,
  formatTime,
  hasExceededEstimatedTime,
}: CardPreviewProps) {
  const isButtonVisible = useMemo(
    () => columnId !== TaskStateTypes.TODO && columnId !== TaskStateTypes.DONE,
    [columnId],
  );

  const currentElapsedTime = useComputed(() => {
    const _ = currentTime.value;
    if (!card.isTracking) return card.timeSpent || 0;
    return (card.timeSpent || 0) + getElapsedTime(card.lastTrackingStart || 0);
  });

  const checklistProgress = card.checklist?.length
    ? (card.checklist.filter((item) => item.isChecked).length /
      card.checklist.length) * 100
    : 0;

  const cardRef = useRef<HTMLDivElement>(null);

  const { isPipOpen, openPictureInPicture } = CardPreviewPip({
    card,
    formatTime,
    getElapsedTime,
    currentElapsedTime,
    getTimeBasedColor,
    hasExceededEstimatedTime,
    columnId,
  });

  const handlePictureInPicture = (
    e: JSX.TargetedMouseEvent<HTMLButtonElement>,
  ) => {
    e.stopPropagation();
    openPictureInPicture();
  };

  return (
    <div
      ref={cardRef}
      data-card-id={card.id}
      class={`group relative rounded-lg shadow-sm hover:shadow-md transition-all duration-500 cursor-move
        ${getTimeBasedColor(card)}
        ${card.isTracking ? "ring-2 ring-emerald-500/20" : ""}
        ${isPipOpen ? "ring-2 ring-blue-500/20" : ""}`}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <div class="flex flex-col p-3 gap-2">
        {/* Header with title and actions */}
        <div class="flex items-start justify-between gap-2">
          <h3 class="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 flex-1">
            {card.title}
          </h3>
          <div class="flex items-center gap-1 shrink-0">
            {isButtonVisible && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (card.id) {
                    handleCardTracking(columnId, card.id);
                  }
                }}
                class={`p-1.5 rounded-md transition-all ${
                  card.isTracking
                    ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10"
                    : "text-gray-400 hover:text-emerald-500 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                } opacity-0 group-hover:opacity-100`}
              >
                <svg
                  class="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d={card.isTracking
                      ? "M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      : "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z"}
                  />
                </svg>
              </button>
            )}
            {isButtonVisible && experimentalFeaturesEnabled.value && (
              <button
                type="button"
                onClick={handlePictureInPicture}
                class={`p-1.5 rounded-md transition-all text-gray-400 hover:text-blue-500 hover:bg-gray-50 dark:hover:bg-gray-700/50 opacity-0 group-hover:opacity-100 ${
                  isPipOpen
                    ? "text-blue-500 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400"
                    : ""
                }`}
                title="Picture-in-Picture"
              >
                <svg
                  class="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                  />
                </svg>
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(e);
              }}
              class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-md opacity-0 group-hover:opacity-100 transition-all"
            >
              <svg
                class="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Labels */}
        {card.labels && card.labels.length > 0 && (
          <div class="flex flex-wrap gap-1">
            {card.labels.map((labelId) => {
              const label = LABELS.find((l) => l.id === labelId);
              if (!label) return null;
              return (
                <span
                  key={label.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onLabelClick();
                  }}
                  class={`${label.color} !bg-opacity-100 text-white text-xs px-2 rounded-full cursor-pointer shrink-0 inline-flex items-center transition-all duration-200
                  ${isLabelsCollapsed ? "w-6 h-6" : "h-6 min-w-[24px]"}`}
                >
                  <span
                    class={`${
                      isLabelsCollapsed ? "opacity-0" : "opacity-100"
                    } transition-opacity duration-200 truncate`}
                  >
                    {label.name}
                  </span>
                </span>
              );
            })}
          </div>
        )}

        {/* Metadata and Progress */}
        <div class="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          {/* Time tracking */}
          {isButtonVisible && currentElapsedTime.value > 0 && (
            <span
              class={`inline-flex items-center gap-1 ${
                hasExceededEstimatedTime(card)
                  ? "text-red-600 dark:text-red-400"
                  : ""
              }`}
            >
              <svg
                class="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {formatTime(currentElapsedTime.value)}
              {card.estimatedTime && (
                <span class="text-gray-400 dark:text-gray-500">
                  / {formatTime(card.estimatedTime * 60)}
                </span>
              )}
            </span>
          )}

          {/* Checklist progress */}
          {card.checklist && card.checklist.length > 0 && (
            <div class="flex items-center gap-2 flex-1">
              <div class="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  class="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${checklistProgress}%` }}
                />
              </div>
              <span class="text-xs min-w-[2rem] text-right">
                {Math.round(checklistProgress)}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
