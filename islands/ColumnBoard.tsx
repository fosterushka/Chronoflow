import { JSX } from "preact";
import { Card, Column } from "../types/index.ts";
import { TaskStateTypes } from "../types/TaskStateTypes.ts";
import CardPreview from "../components/CardPreview.tsx";
import {
  formatTime,
  getTimeBasedColor,
  hasExceededEstimatedTime,
} from "../services/boardService.ts";

interface ColumnBoardProps {
  column: Column;
  isLabelsCollapsed: boolean;
  onLabelClick: () => void;
  onDragStart: (card: Card, columnId: string) => void;
  onDragEnd: () => void;
  onDragOver: (e: JSX.TargetedDragEvent<HTMLDivElement>) => void;
  onDrop: (columnId: string) => void;
  onEditCard: (card: Card, columnId: string) => void;
  onTrackingToggle: (columnId: string, cardId: string) => void;
  onDeleteCard: (card: Card, columnId: string) => void;
  onAddCard: (columnId: string) => void;
}

export default function ColumnBoard({
  column,
  isLabelsCollapsed,
  onLabelClick,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onEditCard,
  onTrackingToggle,
  onDeleteCard,
  onAddCard,
}: ColumnBoardProps) {
  return (
    <div
      key={column.id}
      class="flex flex-col min-h-0 flex-1 min-w-[280px] max-w-[400px] bg-white dark:bg-gray-800/50 rounded-xl"
      onDragOver={onDragOver}
      onDrop={() => onDrop(column.id)}
    >
      <div class="shrink-0 px-4 min-h-10 py-1 flex justify-between items-center border-b border-gray-300/50 dark:border-gray-700">
        <div class="flex items-center gap-1 min-w-0">
          <div
            class={`shrink-0 w-2 h-2 rounded-full ${
              column.id === TaskStateTypes.TODO
                ? "bg-indigo-500"
                : column.id === TaskStateTypes.IN_PROGRESS
                ? "bg-amber-500"
                : column.id === TaskStateTypes.CODE_REVIEW
                ? "bg-purple-500"
                : column.id === TaskStateTypes.TESTING
                ? "bg-blue-500"
                : "bg-emerald-500"
            }`}
          >
          </div>
          <h2 class="font-medium text-gray-700 dark:text-gray-200 truncate">
            {column.title}
          </h2>
          <span class="shrink-0 text-sm text-gray-500 dark:text-gray-500">
            {column.cards.length}
          </span>
        </div>
        {column.id !== TaskStateTypes.DONE && (
          <div class="flex gap-2">
            <button
              onClick={() => onAddCard(column.id)}
              class="w-full px-1 py-1 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors flex items-center justify-center gap-2"
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
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add Task
            </button>
          </div>
        )}
      </div>

      <div class="flex-1 min-h-0 relative">
        <div class="absolute inset-0 hover:overflow-y-overlay p-2 space-y-2 overflow-y-auto">
          {column.cards.map((card) => (
            <div class="mb-2">
              <CardPreview
                key={card.id}
                card={card}
                columnId={column.id}
                isLabelsCollapsed={isLabelsCollapsed}
                onLabelClick={onLabelClick}
                onDragStart={() => onDragStart(card, column.id)}
                onDragEnd={onDragEnd}
                onDragOver={onDragOver}
                onClick={() => onEditCard(card, column.id)}
                onTrackingToggle={(e) => {
                  e.stopPropagation();
                  onTrackingToggle(column.id, card.id);
                }}
                onDelete={(e) => {
                  e.stopPropagation();
                  onDeleteCard(card, column.id);
                }}
                getTimeBasedColor={getTimeBasedColor}
                formatTime={formatTime}
                hasExceededEstimatedTime={hasExceededEstimatedTime}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
