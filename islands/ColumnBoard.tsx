import { JSX } from "preact";
import { Card } from "../core/types/index.ts";
import { TaskStateTypes } from "../core/types/TaskStateTypes.ts";
import CardPreview from "./CardPreview.tsx";
import {
  formatTime,
  getTimeBasedColor,
  hasExceededEstimatedTime,
} from "../core/services/boardService.ts";
import {
  columnsSignal,
  isLabelsCollapsedSignal,
} from "../core/signals/boardSignals.ts";

interface ColumnBoardProps {
  onDragStart: (card: Card, columnId: string) => void;
  onDragEnd: () => void;
  onDragOver: (e: JSX.TargetedDragEvent<HTMLDivElement>) => void;
  onDrop: (columnId: string) => void;
  onCardEdit: (card: Card, columnId: string) => void;
  onCardDelete: (card: Card, columnId: string) => void;
  onCardModalOpen: (columnId: string) => void;
  onActiveColumnChange: (columnId: string) => void;
  onLabelsCollapse: (collapsed: boolean) => void;
}

export default function ColumnBoard({
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onCardEdit,
  onCardDelete,
  onCardModalOpen,
  onLabelsCollapse,
}: ColumnBoardProps) {
  const columns = columnsSignal.value;
  const isLabelsCollapsed = isLabelsCollapsedSignal.value;

  return (
    <div class="h-screen flex flex-col">
      <div class="flex-1 p-6 bg-gray-100/50 dark:bg-gray-900 min-h-0 overflow-x-auto">
        <div class="flex gap-4 h-full min-w-full">
          {columns?.map((column) => (
            <div
              key={column.id}
              data-column-id={column.id}
              class="flex flex-col min-h-0 flex-1 min-w-[280px] max-w-[400px] bg-white dark:bg-gray-800/50 rounded-xl"
              onDragOver={onDragOver}
              onDrop={() => onDrop(column.id)}
            >
              <div class="shrink-0 px-4 min-h-10 py-1 flex justify-between items-center border-b border-gray-300/50 dark:border-gray-700">
                <div class="flex items-center gap-2 min-w-0">
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
                  />
                  <h2 class="font-medium text-gray-700 dark:text-gray-200 truncate">
                    {column.title}
                  </h2>
                  <span class="shrink-0 px-2 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 rounded">
                    {column.cards?.length || 0}
                  </span>
                </div>
                {column.id !== TaskStateTypes.DONE && (
                  <button
                    type="button"
                    onClick={() => onCardModalOpen(column.id)}
                    class="shrink-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </button>
                )}
              </div>
              <div class="flex-1 min-h-0 relative">
                <div class="absolute inset-0 hover:overflow-y-overlay p-2 space-y-2 overflow-y-auto">
                  {column.cards?.map((card) => (
                    <CardPreview
                      key={card.id}
                      card={card}
                      columnId={column.id}
                      isLabelsCollapsed={isLabelsCollapsed}
                      onLabelClick={() => onLabelsCollapse(!isLabelsCollapsed)}
                      onDragStart={() => onDragStart(card, column.id)}
                      onDragEnd={onDragEnd}
                      onDragOver={onDragOver}
                      onClick={() => onCardEdit(card, column.id)}
                      onDelete={(e) => {
                        e.preventDefault();
                        onCardDelete(card, column.id);
                      }}
                      getTimeBasedColor={getTimeBasedColor}
                      formatTime={formatTime}
                      hasExceededEstimatedTime={hasExceededEstimatedTime}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
