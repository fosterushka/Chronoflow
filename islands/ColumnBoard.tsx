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
import { signal } from "@preact/signals";
import { experimentalFeaturesEnabled } from "./HeaderControls.tsx";
import { filterSignal } from "../core/signals/filterSignals.ts";
import { useEffect, useRef, useState } from "preact/hooks";

// Add a signal for collapsed columns
const collapsedColumnsSignal = signal<Set<string>>(new Set());

interface DragIndicator {
  columnId: string;
  index: number;
}

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
  onReorder: (columnId: string, draggedId: string, targetIndex: number) => void;
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
  onReorder,
}: ColumnBoardProps) {
  const columns = columnsSignal.value;
  const isLabelsCollapsed = isLabelsCollapsedSignal.value;
  const isExperimental = experimentalFeaturesEnabled.value;
  const filters = filterSignal.value;

  const filterCards = (cards: Card[]) => {
    return cards.filter((card) => {
      // Filter by search query
      const matchesSearch = filters.searchQuery
        ? card.title.toLowerCase().includes(
          filters.searchQuery.toLowerCase(),
        ) ||
          card.description.toLowerCase().includes(
            filters.searchQuery.toLowerCase(),
          )
        : true;

      // Filter by labels
      const matchesLabels = filters.selectedLabels.length > 0
        ? filters.selectedLabels.every((labelId) =>
          card.labels.includes(labelId)
        )
        : true;

      return matchesSearch && matchesLabels;
    });
  };

  const toggleColumnCollapse = (columnId: string) => {
    if (!isExperimental) return;

    const newCollapsed = new Set(collapsedColumnsSignal.value);
    if (newCollapsed.has(columnId)) {
      newCollapsed.delete(columnId);
    } else {
      newCollapsed.add(columnId);
    }
    collapsedColumnsSignal.value = newCollapsed;
  };

  const [dragIndicator, setDragIndicator] = useState<DragIndicator | null>(
    null,
  );
  const [draggedCard, setDraggedCard] = useState<Card | null>(null);
  const dragGhostRef = useRef<HTMLDivElement>(null);

  // Add effect to handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDragIndicator(null);
        setDraggedCard(null);
        onDragEnd();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleDragOver = (
    e: DragEvent,
    columnId: string,
    cardIndex: number,
  ) => {
    e.preventDefault();
    if (!draggedCard) return;

    const cardElement = (e.target as HTMLElement).closest("[data-card-id]");
    if (!cardElement) {
      setDragIndicator({
        columnId,
        index: 0,
      });
      return;
    }

    const rect = cardElement.getBoundingClientRect();
    const mouseY = e.clientY;
    const threshold = rect.top + (rect.height * 0.5);
    const index = mouseY <= threshold ? cardIndex : cardIndex + 1;

    setDragIndicator({
      columnId,
      index,
    });
  };

  const handleColumnDragOver = (e: DragEvent, columnId: string) => {
    e.preventDefault();
    const column = columns.find((col) => col.id === columnId);
    if (column && column.cards.length === 0) {
      setDragIndicator({
        columnId,
        index: 0,
      });
    }
  };

  return (
    <div class="h-screen flex flex-col">
      <div class="flex-1 p-6">
        <div class="flex gap-5 h-full min-w-full">
          {columns?.map((column) => {
            const isCollapsed = isExperimental &&
              collapsedColumnsSignal.value.has(column.id);
            const filteredCards = isExperimental
              ? filterCards(column.cards)
              : column.cards;

            return (
              <div
                key={column.id}
                data-column-id={column.id}
                class={`
                  flex flex-col 
                  ${
                  isCollapsed
                    ? "w-[52px] min-w-[52px] max-w-[52px]"
                    : "min-h-0 flex-1 min-w-[280px] max-w-[400px]"
                }
                  transition-all duration-300 ease-in-out
                  bg-white/70 dark:bg-gray-800/40 
                  backdrop-blur-md rounded-xl 
                  shadow-lg 
                  border border-gray-200/30 dark:border-gray-700/30 
                  hover:shadow-xl
                `}
                onDragOver={(e) => handleColumnDragOver(e, column.id)}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragIndicator && draggedCard) {
                    onDrop(column.id);
                    // Handle reordering after column change
                    setTimeout(() => {
                      onReorder(column.id, draggedCard.id, dragIndicator.index);
                    }, 0);
                  }
                  setDragIndicator(null);
                  setDraggedCard(null);
                }}
              >
                <div
                  class={`
                  shrink-0 
                  ${isCollapsed ? "px-2" : "px-5"} 
                  py-3 
                  flex justify-between items-center 
                  border-b border-gray-200/30 dark:border-gray-700/30
                `}
                >
                  <div class="flex items-center gap-3 min-w-0">
                    {isExperimental && (
                      <button
                        type="button"
                        onClick={() => toggleColumnCollapse(column.id)}
                        class="shrink-0 p-1 text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 rounded-full hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-all duration-300"
                        title={isCollapsed
                          ? "Expand column"
                          : "Collapse column"}
                      >
                        <svg
                          class={`w-4 h-4 transform transition-transform ${
                            isCollapsed ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d={isCollapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"}
                          />
                        </svg>
                      </button>
                    )}
                    {(!isExperimental || !isCollapsed) && (
                      <>
                        <div
                          class={`shrink-0 w-3 h-3 rounded-full shadow-sm ${
                            column.id === TaskStateTypes.TODO
                              ? "bg-gradient-to-r from-indigo-500 to-indigo-600"
                              : column.id === TaskStateTypes.IN_PROGRESS
                              ? "bg-gradient-to-r from-amber-400 to-amber-500"
                              : column.id === TaskStateTypes.CODE_REVIEW
                              ? "bg-gradient-to-r from-purple-400 to-purple-600"
                              : column.id === TaskStateTypes.TESTING
                              ? "bg-gradient-to-r from-blue-400 to-blue-600"
                              : "bg-gradient-to-r from-emerald-400 to-emerald-600"
                          }`}
                        />
                        <h2 class="font-medium text-gray-700 dark:text-gray-200 truncate">
                          {column.title}
                        </h2>
                        <span class="shrink-0 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100/70 dark:bg-gray-700/50 rounded-full">
                          {column.cards?.length || 0}
                        </span>
                      </>
                    )}
                  </div>
                  {(!isExperimental || !isCollapsed) &&
                    column.id !== TaskStateTypes.DONE && (
                    <button
                      type="button"
                      onClick={() => onCardModalOpen(column.id)}
                      class="shrink-0 p-1.5 text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 rounded-full hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-all duration-300"
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
                {(!isExperimental || !isCollapsed) && (
                  <div class="flex-1 min-h-0 relative">
                    <div class="absolute inset-0 p-3 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
                      {filteredCards.map((card, index) => (
                        <div key={card.id}>
                          {dragIndicator?.columnId === column.id &&
                            dragIndicator.index === index && (
                            <div class="h-20 border-2 border-blue-500 border-dashed rounded-lg bg-blue-50/50 dark:bg-blue-900/20 mb-2 transition-all duration-200" />
                          )}
                          <div class="mb-2">
                            <CardPreview
                              card={card}
                              columnId={column.id}
                              isLabelsCollapsed={isLabelsCollapsed}
                              onLabelClick={() =>
                                onLabelsCollapse(!isLabelsCollapsed)}
                              onDragStart={(e) => {
                                setDraggedCard(card);
                                onDragStart(card, column.id);

                                if (dragGhostRef.current) {
                                  const ghost = dragGhostRef.current.cloneNode(
                                    true,
                                  ) as HTMLDivElement;
                                  ghost.style.position = "absolute";
                                  ghost.style.top = "-1000px";
                                  ghost.style.opacity = "0.8";
                                  document.body.appendChild(ghost);
                                  e.dataTransfer?.setDragImage(ghost, 0, 0);
                                  setTimeout(() => ghost.remove(), 0);
                                }
                              }}
                              onDragEnd={() => {
                                setDragIndicator(null);
                                setDraggedCard(null);
                                onDragEnd();
                              }}
                              onDragOver={(e) =>
                                handleDragOver(e, column.id, index)}
                              onClick={() => onCardEdit(card, column.id)}
                              onDelete={(e) => {
                                e.preventDefault();
                                onCardDelete(card, column.id);
                              }}
                              getTimeBasedColor={getTimeBasedColor}
                              formatTime={formatTime}
                              hasExceededEstimatedTime={hasExceededEstimatedTime}
                            />
                          </div>
                          {dragIndicator?.columnId === column.id &&
                            dragIndicator.index === index + 1 &&
                            index === filteredCards.length - 1 && (
                            <div class="h-20 border-2 border-blue-500 border-dashed rounded-lg bg-blue-50/50 dark:bg-blue-900/20 transition-all duration-200" />
                          )}
                        </div>
                      ))}

                      {/* Show indicator for empty column */}
                      {dragIndicator?.columnId === column.id &&
                        filteredCards.length === 0 && (
                        <div class="h-20 border-2 border-blue-500 border-dashed rounded-lg bg-blue-50/50 dark:bg-blue-900/20 transition-all duration-200" />
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {/* Ghost element for drag preview */}
      <div
        ref={dragGhostRef}
        class="fixed top-0 left-0 pointer-events-none opacity-0"
        style={{ transform: "translateX(-100%)" }}
      >
        <div class="w-[280px] bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
          {draggedCard && (
            <h3 class="text-sm font-medium text-gray-900 dark:text-white">
              {draggedCard.title}
            </h3>
          )}
        </div>
      </div>
    </div>
  );
}
