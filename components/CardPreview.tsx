import { JSX } from "preact";
import { Card } from "../types/index.ts";
import { LABELS } from "../utils/boardUtils.ts";
import { TaskStateTypes } from "../types/TaskStateTypes.ts";
import { useMemo } from "preact/hooks";

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
  const isButtonVisible = useMemo(
    () => columnId !== TaskStateTypes.TODO && columnId !== TaskStateTypes.DONE,
    [columnId],
  );

  const checklistProgress = card.checklist?.length
    ? (card.checklist.filter((item) => item.isChecked).length /
      card.checklist.length) * 100
    : 0;

  return (
    <div
      class={`group relative rounded-lg shadow-sm hover:shadow-md transition-all duration-500 cursor-move
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
      <div class="flex flex-col h-full p-4">
        {/* Header Section */}
        <div class="flex justify-between items-start gap-2 mb-3">
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
                )
                : null;
            })}
          </div>
          <button
            onClick={onDelete}
            class="text-gray-400 hover:text-red-500 shrink-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
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

        {/* Content Section */}
        <div class="flex-1 flex flex-col">
          <h3 class="font-medium text-gray-900 dark:text-gray-100 text-sm mb-2 line-clamp-2">
            {card.title}
          </h3>

          {/* Checklist Progress */}
          {card.checklist?.length > 0 && (
            <div class="mb-2">
              <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
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
                <span>{Math.round(checklistProgress)}% Complete</span>
              </div>
              <div class="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  class="h-full bg-green-500 transition-all duration-300"
                  style={{ width: `${checklistProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Metadata Section */}
          <div class="pt-2 border-t border-gray-100 dark:border-gray-700">
            <div class="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
              {card.dueDate && (
                <span class="inline-flex items-center gap-1.5">
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
                  {new Date(card.dueDate).toLocaleDateString()}
                </span>
              )}

              {card.estimatedTime && (
                <span
                  class={`inline-flex items-center gap-1.5 ${
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

              {card.github?.repo && (
                <a
                  href={`${card.github.repo}/issues`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  class="inline-flex items-center gap-1.5 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  <svg
                    class="w-3.5 h-3.5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    />
                  </svg>
                  Issues
                </a>
              )}
            </div>

            {/* Time Tracking */}
            <div class="flex items-center justify-between">
              <span class="text-xs font-medium text-gray-600 dark:text-gray-300">
                {formatTime(card.timeSpent + (card.currentElapsedTime || 0))}
              </span>
              {isButtonVisible && (
                <button
                  onClick={onTrackingToggle}
                  class={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                    card.isTracking
                      ? "bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/30"
                      : "bg-emerald-100 text-emerald-600 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/30"
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
