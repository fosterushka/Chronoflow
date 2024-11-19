import { useCallback, useEffect, useState } from "preact/hooks";
import { JSX } from "preact";
import CardModal from "./CardModal.tsx";
import DeleteCardModal from "./DeleteCardModal.tsx";
import ColumnBoard from "./ColumnBoard.tsx";
import MobileWarningModal from "../components/MobileWarningModal.tsx";
import {
  BOARD_UPDATE_EVENT,
  COLUMNS,
  dispatchBoardUpdate,
  LABELS,
} from "../utils/boardUtils.ts";
import type { Card, Column, DraggedCard, EditingCard } from "../types/index.ts";
import { TaskStateTypes } from "../types/TaskStateTypes.ts";
import { currentTime, getElapsedTime } from "../signals/timeSignals.ts";
import { getBoardStatistics } from "../services/boardService.ts";
import { Header } from "./Header.tsx";

export default function Board() {
  const [columns, setColumns] = useState<Column[]>(() => {
    const defaultColumns = COLUMNS.map((col) => ({ ...col, cards: [] }));

    if (typeof localStorage === "undefined") {
      return defaultColumns;
    }

    const savedData = localStorage.getItem("chronoflowColumns");
    if (!savedData) {
      return defaultColumns;
    }

    try {
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
    } catch (error) {
      console.error("Error parsing saved columns:", error);
      return defaultColumns;
    }
  });

  const [draggedCard, setDraggedCard] = useState<DraggedCard | null>(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [activeColumn, setActiveColumn] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<EditingCard | null>(null);
  const [deletingCard, setDeletingCard] = useState<
    { card: Card; columnId: string } | null
  >(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLabelsCollapsed, setIsLabelsCollapsed] = useState(false);
  const [showMobileWarning, setShowMobileWarning] = useState(false);

  useEffect(() => {
    const isTouchDevice = "ontouchstart" in window ||
      navigator.maxTouchPoints > 0;
    setShowMobileWarning(isTouchDevice);
  }, []);

  useEffect(() => {
    setColumns((prevColumns) => {
      let hasUpdates = false;
      const newColumns = prevColumns.map((column) => ({
        ...column,
        cards: column.cards.map((card) => {
          if (card.isTracking) {
            hasUpdates = true;
            return {
              ...card,
              currentElapsedTime: getElapsedTime(card.lastTrackingStart || 0),
            };
          }
          return card;
        }),
      }));
      return hasUpdates ? newColumns : prevColumns;
    });
  }, [currentTime.value]);

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

  useEffect(() => {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("chronoflowColumns", JSON.stringify(columns));
    }
  }, [columns]);

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
      (targetColumnId === TaskStateTypes.TODO ||
        targetColumnId === TaskStateTypes.DONE) &&
      card.isTracking
    ) {
      const elapsedTime = getElapsedTime(card.lastTrackingStart || 0);
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

  const handleTrackingToggle = useCallback(
    (columnId: string, cardId: string) => {
      const now = currentTime.value;
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
                  lastTrackingStart: now,
                  currentElapsedTime: 0,
                };
              } else if (card.isTracking) {
                // Stop tracking any other card that was being tracked
                const elapsedTime = getElapsedTime(card.lastTrackingStart || 0);
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
                const elapsedTime = getElapsedTime(card.lastTrackingStart || 0);
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
    },
    [currentTime.value],
  );

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
              ? {
                ...cardData,
                isTracking: card.isTracking,
                lastTrackingStart: card.lastTrackingStart,
                currentElapsedTime: card.currentElapsedTime,
                timeSpent: card.timeSpent,
              }
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

  const stats = getBoardStatistics(columns);

  return (
    <div class="h-screen flex flex-col">
      <Header stats={stats}></Header>

      <div class="flex-1 p-6 bg-gray-100/50 dark:bg-gray-900 min-h-0 overflow-x-auto">
        <div class="flex gap-4 h-full min-w-full">
          {columns.map((column) => (
            <ColumnBoard
              key={column.id}
              column={column}
              isLabelsCollapsed={isLabelsCollapsed}
              onLabelClick={() => setIsLabelsCollapsed((prev) => !prev)}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onEditCard={openEditModal}
              onTrackingToggle={handleTrackingToggle}
              onDeleteCard={handleDeleteCard}
              onAddCard={openAddModal}
            />
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

      <MobileWarningModal
        isOpen={showMobileWarning}
        onClose={() => setShowMobileWarning(false)}
      />
    </div>
  );
}
