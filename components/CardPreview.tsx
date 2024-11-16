import { JSX } from "preact";
import { Card } from "../types/index.ts";
import { LABELS } from "../utils/boardUtils.ts";

interface CardPreviewProps {
  card: Card;
  columnId: string;
  isLabelsCollapsed: boolean;
  onLabelClick: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDragOver: (e: JSX.TargetedDragEvent<HTMLDivElement>) => void;
  onClick: () => void;
  onTrackingToggle: (e: JSX.TargetedMouseEvent<HTMLButtonElement>) => void;
  onDelete: (e: JSX.TargetedMouseEvent<HTMLButtonElement>) => void;
  getTimeBasedColor: (card: Card, columnId: string) => string;
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
  onTrackingToggle,
  onDelete,
  getTimeBasedColor,
  formatTime,
  hasExceededEstimatedTime,
}: CardPreviewProps) {
  return (
    <div
      class={`group relative rounded-lg shadow-sm hover:shadow-md transition-all duration-500 cursor-move min-w-0
        ${getTimeBasedColor(card, columnId)}
        ${card.isTracking ? "ring-2 ring-emerald-500/20" : ""}`}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onClick={onClick}
      data-card={JSON.stringify(card)}
      data-column-id={columnId}
    >
      <div class="p-3 space-y-2.5 min-w-0">
        {/* Header: Labels and Delete Button */}
        <div class="flex justify-between items-start gap-2">
          {/* Labels */}
          <div class="flex flex-wrap gap-1.5 min-w-0 flex-1">
            {card.labels.map((labelId) => {
              const label = LABELS.find((l) => l.id === labelId);
              return label
                ? (
                  <span
                    key={label.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onLabelClick();
                    }}
                    class={`${label.color} !bg-opacity-100 text-white text-xs px-2 rounded-full cursor-pointer shrink-0 inline-flex justify-center transition-all duration-200
                    ${isLabelsCollapsed ? "py-px h-[14px]" : "py-1 h-[24px]"}`}
                  >
                    <span
                      class={`${
                        isLabelsCollapsed ? "opacity-0" : "opacity-100"
                      } transition-opacity duration-200 truncate`}
                    >
                      {label.name}
                    </span>
                  </span>
                )
                : null;
            })}
          </div>

          {/* Delete Button */}
          <button
            onClick={onDelete}
            class="text-gray-400 hover:text-red-500 shrink-0 p-1"
          >
            <svg
              class="w-4 h-4"
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

        {/* Content */}
        <div class="space-y-2 min-w-0">
          {/* Title */}
          <h3 class="font-medium text-gray-900 dark:text-gray-100 truncate">
            {card.title}
          </h3>

          {/* Description */}
          {card.description && (
            <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 break-words">
              {card.description}
            </p>
          )}
        </div>

        {/* Checklist */}
        {card.checklist?.length > 0 && (
          <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <div class="flex items-center gap-1.5 shrink-0">
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <span>
                {card.checklist.filter((item) => item.isChecked).length}/
                {card.checklist.length}
              </span>
            </div>
            <div class="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                class="h-full bg-green-500 transition-all duration-300"
                style={{
                  width: `${
                    (card.checklist.filter((item) => item.isChecked).length /
                      card.checklist.length) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div class="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-700">
          {/* Metadata Row */}
          <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 flex-wrap gap-2">
            <div class="flex items-center gap-3 flex-wrap">
              {/* Due Date */}
              {card.dueDate && (
                <span class="inline-flex items-center gap-1">
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {card.dueDate}
                </span>
              )}

              {/* Estimated Time */}
              {card.estimatedTime && (
                <span
                  class={`inline-flex items-center gap-1 ${
                    hasExceededEstimatedTime(card)
                      ? "text-red-500 dark:text-red-400"
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
                  {Math.floor(card.estimatedTime / 60)}h{" "}
                  {card.estimatedTime % 60}m
                </span>
              )}
            </div>

            {/* Time Tracking */}
            <div class="flex items-center gap-2">
              <span>
                {formatTime(card.timeSpent + (card.currentElapsedTime || 0))}
              </span>
              {columnId !== "todo" && columnId !== "done" && (
                <button
                  onClick={onTrackingToggle}
                  class={`opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity px-2 py-1 rounded text-xs font-medium ${
                    card.isTracking
                      ? "text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      : "text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                  }`}
                >
                  {card.isTracking ? "Stop" : "Start"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
