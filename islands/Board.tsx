import { useCallback, useEffect, useState } from "preact/hooks";
import { JSX } from "preact";
import CardModal from "./CardModal.tsx";
import DeleteCardModal from "./DeleteCardModal.tsx";
import HeaderControls from "./HeaderControls.tsx";
import DarkModeToggle from "./DarkModeToggle.tsx";
import CardPreview from "../components/CardPreview.tsx";
import type {
  Card,
  Column,
  DraggedCard,
  EditingCard,
  Label,
} from "../types/index.ts";

//TODO: move to utils or configs

const BOARD_UPDATE_EVENT = "board-update";

export const dispatchBoardUpdate = (columns: Column[]) => {
  globalThis.dispatchEvent(
    new CustomEvent(BOARD_UPDATE_EVENT, { detail: { columns } }),
  );
};

export const LABELS: Label[] = [
  { id: "bug", name: "Bug", color: "bg-red-500" },
  { id: "feature", name: "Feature", color: "bg-blue-500" },
  { id: "enhancement", name: "Enhancement", color: "bg-green-500" },
  { id: "documentation", name: "Documentation", color: "bg-purple-500" },
  { id: "design", name: "Design", color: "bg-yellow-500" },
  { id: "refactor", name: "Refactor", color: "bg-orange-500" },
];

export const COLUMNS: Omit<Column, "cards">[] = [
  { id: "todo", title: "To Do" },
  { id: "inProgress", title: "In Progress" },
  { id: "codeReview", title: "Code Review" },
  { id: "testing", title: "Testing" },
  { id: "done", title: "Done" },
];

//TODO: all functios to store or services.
export function clearStorage(setColumns: (cols: Column[]) => void) {
  if (
    confirm("Are you sure you want to clear all data? This cannot be undone.")
  ) {
    const emptyColumns = COLUMNS.map((col) => ({ ...col, cards: [] }));
    localStorage.setItem("chronoflowColumns", JSON.stringify(emptyColumns));
    setColumns(emptyColumns);
    dispatchBoardUpdate(emptyColumns);
  }
}

export function exportData(columns: Column[]) {
  const data = JSON.stringify(columns, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `chronoflow-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importData(
  file: File | undefined,
  setColumns: (cols: Column[]) => void,
) {
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string;
      const data = JSON.parse(content);

      // Validate the data structure
      if (
        Array.isArray(data) &&
        data.every((col) =>
          col.id && col.title && Array.isArray(col.cards) &&
          col.cards.every((card: any) => card.id && card.title)
        )
      ) {
        // Initialize timeSpent and other missing properties
        const processedData = data.map((col: Column) => ({
          ...col,
          cards: col.cards.map((card) => ({
            ...card,
            timeSpent: card.timeSpent || 0,
            isTracking: false,
            lastTrackingStart: undefined,
            currentElapsedTime: 0,
          })),
        }));

        localStorage.setItem(
          "chronoflowColumns",
          JSON.stringify(processedData),
        );
        setColumns(processedData);
        dispatchBoardUpdate(processedData);
      } else {
        alert("Invalid file format");
      }
    } catch (error) {
      alert("Error importing file");
      console.error("Import error:", error);
    }
  };
  reader.readAsText(file);
}

export default function Board() {
  const [columns, setColumns] = useState<Column[]>(() => {
    if (typeof localStorage !== "undefined") {
      const savedData = localStorage.getItem("chronoflowColumns");
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        return parsedData.map((col: Column) => ({
          ...col,
          cards: col.cards.map((card) => ({
            ...card,
            timeSpent: card.timeSpent || 0,
            isTracking: false,
            lastTrackingStart: undefined,
            currentElapsedTime: 0,
          })),
        }));
      }
      return COLUMNS.map((col) => ({ ...col, cards: [] }));
    }
    return COLUMNS.map((col) => ({ ...col, cards: [] }));
  });

  const [draggedCard, setDraggedCard] = useState<DraggedCard | null>(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [activeColumn, setActiveColumn] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<EditingCard | null>(null);
  const [deletingCard, setDeletingCard] = useState<
    { card: Card; columnId: string } | null
  >(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [isLabelsCollapsed, setIsLabelsCollapsed] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setColumns((prevColumns) => {
      let hasUpdates = false;
      const newColumns = prevColumns.map((column) => ({
        ...column,
        cards: column.cards.map((card) => {
          if (card.isTracking) {
            hasUpdates = true;
            // Don't add to timeSpent, just calculate current elapsed time
            const elapsedTime = Math.floor(
              (currentTime - (card.lastTrackingStart || 0)) / 1000,
            );
            return {
              ...card,
              // Keep original timeSpent and just update lastTrackingStart
              lastTrackingStart: card.lastTrackingStart,
              // Store current elapsed time separately for display
              currentElapsedTime: elapsedTime,
            };
          }
          return {
            ...card,
            currentElapsedTime: 0,
          };
        }),
      }));
      return hasUpdates ? newColumns : prevColumns;
    });
  }, [currentTime]);

  useEffect(() => {
    const handleBoardUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.columns) {
        setColumns(customEvent.detail.columns);
      }
    };

    globalThis.addEventListener(BOARD_UPDATE_EVENT, handleBoardUpdate);
    return () =>
      globalThis.removeEventListener(BOARD_UPDATE_EVENT, handleBoardUpdate);
  }, []);

  const handleDragStart = useCallback((card: Card, columnId: string) => {
    setDraggedCard({ card, columnId });
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedCard(null);
  }, []);

  const handleDragOver = useCallback(
    (e: JSX.TargetedDragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const targetCard = e.currentTarget.dataset.card
        ? JSON.parse(e.currentTarget.dataset.card)
        : null;
      const targetColumnId = e.currentTarget.dataset.columnId || "";

      if (
        !draggedCard || !targetCard || draggedCard.card.id === targetCard.id
      ) return;

      // Only reorder within the same column
      if (draggedCard.columnId === targetColumnId) {
        setColumns((prevColumns) => {
          return prevColumns.map((column) => {
            if (column.id === targetColumnId) {
              const cards = [...column.cards];
              const draggedIndex = cards.findIndex((card) =>
                card.id === draggedCard.card.id
              );
              const targetIndex = cards.findIndex((card) =>
                card.id === targetCard.id
              );

              // Remove dragged card and insert at new position
              const [draggedCardItem] = cards.splice(draggedIndex, 1);
              cards.splice(targetIndex, 0, draggedCardItem);

              return {
                ...column,
                cards,
              };
            }
            return column;
          });
        });
      }
    },
    [draggedCard],
  );

  const handleDrop = useCallback((targetColumnId: string) => {
    if (!draggedCard) return;

    const { card, columnId: sourceColumnId } = draggedCard;
    if (sourceColumnId === targetColumnId) return;

    // Stop tracking when moving to todo or done
    if (
      (targetColumnId === "todo" || targetColumnId === "done") &&
      card.isTracking
    ) {
      const elapsedTime = Math.floor(
        (Date.now() - (card.lastTrackingStart || 0)) / 1000,
      );
      card.isTracking = false;
      card.lastTrackingStart = undefined;
      card.currentElapsedTime = 0;
      card.timeSpent = (card.timeSpent || 0) + elapsedTime;
    }

    setColumns((prevColumns) => {
      const newColumns = prevColumns.map((column) => {
        if (column.id === sourceColumnId) {
          return {
            ...column,
            cards: column.cards.filter((c) => c.id !== card.id),
          };
        }
        if (column.id === targetColumnId) {
          return {
            ...column,
            cards: [...column.cards, card],
          };
        }
        return column;
      });

      // Save to localStorage
      localStorage.setItem("chronoflowColumns", JSON.stringify(newColumns));
      return newColumns;
    });

    setDraggedCard(null);
  }, [draggedCard]);

  const toggleTracking = useCallback((columnId: string, cardId: string) => {
    // Don't allow tracking in todo or done columns
    if (columnId === "todo" || columnId === "done") return;

    setColumns((prevColumns) => {
      const targetCard = prevColumns
        .find((col) => col.id === columnId)
        ?.cards.find((card) => card.id === cardId);

      let newColumns;
      if (targetCard && !targetCard.isTracking) {
        // Start tracking
        newColumns = prevColumns.map((column) => ({
          ...column,
          cards: column.cards.map((card) => {
            if (card.id === cardId && column.id === columnId) {
              return {
                ...card,
                isTracking: true,
                lastTrackingStart: Date.now(),
                currentElapsedTime: 0,
              };
            } else if (card.isTracking) {
              // Stop tracking any other card that was being tracked
              const elapsedTime = Math.floor(
                (Date.now() - (card.lastTrackingStart || 0)) / 1000,
              );
              return {
                ...card,
                isTracking: false,
                lastTrackingStart: undefined,
                currentElapsedTime: 0,
                timeSpent: (card.timeSpent || 0) + elapsedTime,
              };
            }
            return card;
          }),
        }));
        // Save to localStorage and dispatch update when starting tracking
        localStorage.setItem("chronoflowColumns", JSON.stringify(newColumns));
        dispatchBoardUpdate(newColumns);
      } else {
        // Stop tracking
        newColumns = prevColumns.map((column) => ({
          ...column,
          cards: column.cards.map((card) => {
            if (card.id === cardId && column.id === columnId) {
              const elapsedTime = Math.floor(
                (Date.now() - (card.lastTrackingStart || 0)) / 1000,
              );
              return {
                ...card,
                isTracking: false,
                lastTrackingStart: undefined,
                currentElapsedTime: 0,
                timeSpent: (card.timeSpent || 0) + elapsedTime,
              };
            }
            return card;
          }),
        }));
        // Save to localStorage and dispatch update when stopping tracking
        localStorage.setItem("chronoflowColumns", JSON.stringify(newColumns));
        dispatchBoardUpdate(newColumns);
      }
      return newColumns;
    });
  }, []);

  const openAddModal = useCallback((columnId: string) => {
    setActiveColumn(columnId);
    setEditingCard(null);
    setIsCardModalOpen(true);
  }, []);

  const openEditModal = useCallback((card: Card, columnId: string) => {
    setEditingCard({ card, columnId });
    setIsCardModalOpen(true);
  }, []);

  const handleCardSubmit = useCallback(
    (cardData: Card) => {
      if (editingCard) {
        // Handle edit case
        const updatedColumns = columns.map((column) => ({
          ...column,
          cards: column.cards.map((card) =>
            card.id === cardData.id
              ? { ...cardData, isTracking: card.isTracking }
              : card
          ),
        }));

        dispatchBoardUpdate(updatedColumns);
        setColumns(updatedColumns);
      } else if (activeColumn) {
        // Handle add case
        const newCard: Card = {
          ...cardData,
          id: crypto.randomUUID(),
          timeSpent: 0,
          isTracking: false,
          lastTrackingStart: undefined,
          currentElapsedTime: 0,
        };

        setColumns((prevColumns: Column[]) => {
          return prevColumns.map((column: Column) => {
            if (column.id === activeColumn) {
              return {
                ...column,
                cards: [...column.cards, newCard],
              };
            }
            return column;
          });
        });
      }

      setIsCardModalOpen(false);
      setEditingCard(null);
      setActiveColumn(null);
    },
    [activeColumn, columns, editingCard],
  );

  //TODO: typesing everything and move into interfaces.
  const getStatistics = useCallback(() => {
    const totalTasks = columns.reduce(
      (acc: any, col: { cards: string | any[] }) => acc + col.cards.length,
      0,
    );
    const completedTasks = columns.find((col: { id: string }) =>
      col.id === "done"
    )?.cards.length || 0;
    const totalEstimatedTime = columns.reduce(
      (acc: any, col: { cards: any[] }) =>
        acc +
        col.cards.reduce((sum: any, card: { estimatedTime: any }) =>
          sum + (card.estimatedTime || 0), 0),
      0,
    );
    const totalTimeSpent = columns.reduce(
      (acc: any, col: { cards: any[] }) =>
        acc +
        col.cards.reduce(
          (sum: any, card: { timeSpent: any }) => sum + (card.timeSpent || 0),
          0,
        ),
      0,
    );

    return {
      totalTasks,
      completedTasks,
      totalEstimatedTime: totalEstimatedTime || 0,
      totalTimeSpent: totalTimeSpent || 0,
    };
  }, [columns]);

  const formatTime = useCallback((seconds: number = 0) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  }, []);

  const hasExceededEstimatedTime = (card: Card) => {
    if (!card.estimatedTime) return false;
    const estimatedTimeInSeconds = card.estimatedTime * 60;
    return card.timeSpent > estimatedTimeInSeconds;
  };

  const isNearingEstimatedTime = (card: Card) => {
    if (!card.estimatedTime) return false;
    const estimatedTimeInSeconds = card.estimatedTime * 60;
    const halfTime = estimatedTimeInSeconds / 2;
    return card.timeSpent >= halfTime &&
      card.timeSpent <= estimatedTimeInSeconds;
  };

  const getTimeBasedColor = (card: Card, columnId: string) => {
    if (card.isTracking) {
      const estimatedTimeInSeconds = card.estimatedTime
        ? card.estimatedTime * 60
        : 0;
      const currentElapsedTime = Math.floor(
        (Date.now() - (card.lastTrackingStart || 0)) / 1000,
      );
      const totalTime = card.timeSpent + currentElapsedTime;

      if (estimatedTimeInSeconds && totalTime > estimatedTimeInSeconds) {
        return "bg-red-100/90 dark:bg-red-900/90";
      }
      if (estimatedTimeInSeconds && totalTime >= estimatedTimeInSeconds / 2) {
        return "bg-amber-100/90 dark:bg-amber-900/90";
      }
      return "bg-white dark:bg-gray-800/90";
    }

    if (hasExceededEstimatedTime(card)) {
      return "bg-red-50/80 dark:bg-red-900/30 ring-2 ring-red-500/50";
    }
    if (isNearingEstimatedTime(card)) {
      return "bg-amber-50/80 dark:bg-amber-900/30 ring-1 ring-amber-500/50";
    }
    return "bg-white dark:bg-gray-800/90";
  };

  const handleDeleteCard = (card: Card, columnId: string) => {
    setDeletingCard({ card, columnId });
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteCard = () => {
    if (!deletingCard) return;

    setColumns((prevColumns) => {
      return prevColumns.map((column) => {
        if (column.id === deletingCard.columnId) {
          return {
            ...column,
            cards: column.cards.filter((card) =>
              card.id !== deletingCard.card.id
            ),
          };
        }
        return column;
      });
    });

    setIsDeleteModalOpen(false);
    setDeletingCard(null);
  };

  const stats = getStatistics();

  return (
    <div class="h-screen flex flex-col">
      <div class="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 shadow-sm sticky top-0 z-50">
        <div class="flex items-center justify-between px-4 h-14">
          <div class="flex items-center gap-3">
            <div class="w-6 h-6 flex-shrink-0 bg-indigo-500 rounded flex items-center justify-center">
              <svg
                class="w-4 h-4 text-white"
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
            </div>
            <h1 class="font-semibold text-gray-700 dark:text-white text-sm">
              Chronoflow
            </h1>
          </div>

          <div class="flex items-center gap-4">
            <div class="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              <div class="flex items-center gap-1.5">
                <div class="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                <span>{stats.totalTasks} tasks</span>
              </div>
              <div class="flex items-center gap-1.5">
                <div class="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                <span>{stats.completedTasks} completed</span>
              </div>
              <div class="flex items-center gap-1.5">
                <div class="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                <span>{Math.floor(stats.totalTimeSpent / 3600)}h spent</span>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <HeaderControls />
              <DarkModeToggle />
            </div>
          </div>
        </div>
      </div>

      <div class="flex-1 p-6 bg-gray-100/50 dark:bg-gray-900 min-h-0">
        <div class="grid grid-cols-5 gap-4 h-full auto-rows-fr">
          {columns.map((column, index) => (
            <div
              key={column.id}
              class="flex flex-col bg-gray-200/50 dark:bg-gray-800/50 rounded-xl backdrop-blur-sm min-w-0"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.id)}
            >
              <div class="shrink-0 px-4 py-3 flex justify-between items-center border-b border-gray-300/50 dark:border-gray-700">
                <div class="flex items-center gap-2 min-w-0">
                  <div
                    class={`shrink-0 w-2 h-2 rounded-full ${
                      column.id === "todo"
                        ? "bg-indigo-500"
                        : column.id === "inProgress"
                        ? "bg-amber-500"
                        : column.id === "codeReview"
                        ? "bg-purple-500"
                        : column.id === "testing"
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
                {/* //TODO: move to const types */}
                {column.id !== "done" && (
                  <div class="flex gap-2">
                    <button
                      onClick={() => openAddModal(column.id)}
                      class="w-full px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors flex items-center justify-center gap-2"
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

              <div class="overflow-y-auto flex-1 min-h-0">
                <div class="p-2 space-y-2">
                  {column.cards.map((card) => (
                    <div key={card.id} class="mb-2">
                      <CardPreview
                        key={card.id}
                        card={card}
                        columnId={column.id}
                        isLabelsCollapsed={isLabelsCollapsed}
                        onLabelClick={() =>
                          setIsLabelsCollapsed((prev) => !prev)}
                        onDragStart={() => handleDragStart(card, column.id)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => handleDragOver(e)}
                        onClick={() => openEditModal(card, column.id)}
                        onTrackingToggle={(e) => {
                          e.stopPropagation();
                          toggleTracking(column.id, card.id);
                        }}
                        onDelete={(e) => {
                          e.stopPropagation();
                          handleDeleteCard(card, column.id);
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
          ))}
        </div>
      </div>

      <CardModal
        isOpen={isCardModalOpen}
        onClose={() => {
          setIsCardModalOpen(false);
          setEditingCard(null);
          setActiveColumn(null);
        }}
        onSubmit={handleCardSubmit}
        labels={LABELS}
        card={editingCard?.card || null}
        mode={editingCard ? "edit" : "add"}
      />

      {deletingCard && (
        <DeleteCardModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setDeletingCard(null);
          }}
          onConfirm={confirmDeleteCard}
          card={deletingCard.card}
        />
      )}
    </div>
  );
}
