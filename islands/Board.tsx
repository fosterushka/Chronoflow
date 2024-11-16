import { useCallback, useEffect, useState } from "preact/hooks";
import { JSX } from "preact";
import AddCardModal from "./AddCardModal.tsx";
import EditCardModal from "./EditCardModal.tsx";
import DeleteCardModal from "./DeleteCardModal.tsx";
import Sidebar from "./Sidebar.tsx";
import CardPreview from "../components/CardPreview.tsx";
import type {
  Card,
  Column,
  DraggedCard,
  EditingCard,
  Label,
} from "../types/index.ts";

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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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

    // When moving to Done column, stop tracking if active
    if (targetColumnId === "done" && card.isTracking) {
      card.isTracking = false;
      card.lastTrackingStart = undefined;
    }

    setColumns((prevColumns) => {
      return prevColumns.map((column) => {
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
    });

    setDraggedCard(null);
  }, [draggedCard]);

  const toggleTracking = useCallback((columnId: string, cardId: string) => {
    // Don't allow tracking in Done column
    if (columnId === "done") return;

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
      } else {
        // Stop tracking - save to localStorage
        newColumns = prevColumns.map((column) => ({
          ...column,
          cards: column.cards.map((card) => {
            if (card.id === cardId && column.id === columnId) {
              const elapsedTime = Math.floor(
                (Date.now() - (card.lastTrackingStart || 0)) / 1000,
              );
              const updatedCard = {
                ...card,
                isTracking: false,
                lastTrackingStart: undefined,
                currentElapsedTime: 0,
                timeSpent: (card.timeSpent || 0) + elapsedTime,
              };
              return updatedCard;
            }
            return card;
          }),
        }));
        // Save to localStorage only when stopping the timer
        if (typeof localStorage !== "undefined") {
          localStorage.setItem("chronoflowColumns", JSON.stringify(newColumns));
          dispatchBoardUpdate(newColumns);
        }
      }
      return newColumns;
    });
  }, []);

  const openAddModal = useCallback((columnId: string) => {
    setActiveColumn(columnId);
    setIsAddModalOpen(true);
  }, []);

  const handleAddCard = useCallback(
    (cardData: Omit<Card, "id" | "timeSpent" | "isTracking">) => {
      if (!activeColumn) return;

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

      setIsAddModalOpen(false);
      setActiveColumn(null);
    },
    [activeColumn],
  );

  const handleEditCard = useCallback((updatedCard: Card) => {
    if (!editingCard) return;

    const updatedColumns = columns.map((column) => ({
      ...column,
      cards: column.cards.map((card) =>
        card.id === updatedCard.id
          ? { ...updatedCard, isTracking: card.isTracking }
          : card
      ),
    }));

    dispatchBoardUpdate(updatedColumns);
    setColumns(updatedColumns);
    setIsEditModalOpen(false);
    setEditingCard(null);
  }, [columns, editingCard]);

  const openEditModal = useCallback((card: Card, columnId: string) => {
    setEditingCard({ card, columnId });
    setIsEditModalOpen(true);
  }, []);

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
    if (hasExceededEstimatedTime(card)) {
      return "bg-red-50/80 dark:bg-red-900/30 ring-2 ring-red-500/50";
    }
    if (isNearingEstimatedTime(card)) {
      return "bg-amber-50/80 dark:bg-amber-900/30 ring-1 ring-amber-500/50";
    }
    return "bg-gray-50/80 dark:bg-gray-700/50";
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
    <div class="flex h-screen">
      <Sidebar
        stats={stats}
        activeTask={columns.some((col) =>
            col.cards.some((card) => card.isTracking)
          )
          ? {
            title:
              columns.find((col) => col.cards.some((card) => card.isTracking))
                ?.cards.find((card) => card.isTracking)?.title || "",
          }
          : undefined}
      />

      <div class="flex-1 p-6 overflow-x-auto bg-gray-100/50 dark:bg-gray-900">
        <div class="flex gap-6 h-full min-h-0">
          {columns.map((column) => (
            <div
              key={column.id}
              class="w-[300px] flex-none flex flex-col bg-gray-200/50 dark:bg-gray-800/50 rounded-xl backdrop-blur-sm"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.id)}
            >
              <div class="px-4 py-3 flex justify-between items-center border-b border-gray-300/50 dark:border-gray-700">
                <div class="flex items-center gap-2">
                  <div
                    class={`w-2 h-2 rounded-full ${
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
                  <h2 class="font-medium text-gray-700 dark:text-gray-200">
                    {column.title}
                  </h2>
                  <span class="text-sm text-gray-500 dark:text-gray-500">
                    {column.cards.length}
                  </span>
                </div>
                {column.id !== "done" && (
                  <button
                    onClick={() => openAddModal(column.id)}
                    class="text-gray-500 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
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
                      >
                      </path>
                    </svg>
                  </button>
                )}
              </div>

              <div class="overflow-y-auto flex-1">
                <div class="px-3 py-2 space-y-2">
                  {column.cards.map((card) => (
                    <div key={card.id} class="w-[290px] mx-auto">
                      <CardPreview
                        key={card.id}
                        card={card}
                        columnId={column.id}
                        isLabelsCollapsed={isLabelsCollapsed}
                        onLabelClick={() => setIsLabelsCollapsed((prev) => !prev)}
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

      <AddCardModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setActiveColumn(null);
        }}
        onSubmit={handleAddCard}
        labels={LABELS}
      />

      {editingCard && (
        <EditCardModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingCard(null);
          }}
          onSubmit={handleEditCard}
          card={editingCard.card}
          labels={LABELS}
        />
      )}

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
