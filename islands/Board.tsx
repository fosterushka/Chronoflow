import { useCallback, useEffect, useMemo, useState } from "preact/hooks";
import CardModal from "./modals/CardModal.tsx";
import DeleteCardModal from "./modals/DeleteCardModal.tsx";
import ColumnBoard from "./ColumnBoard.tsx";
import MobileWarningModal from "./modals/MobileWarningModal.tsx";
import { syncWithLocalStorage } from "../core/services/boardService.ts";
import {
  boardStore,
  cleanupBoardStore,
  columnsSignal,
  draggedCardSignal,
  isLabelsCollapsedSignal,
  moveCard,
  showMobileWarningSignal,
} from "../core/signals/boardSignals.ts";
import { labelsSignal } from "../core/signals/labelSignals.ts";
import type { Card, ColumnId, EditingCard } from "../core/types/index.ts";
import type { DeleteCardState } from "../core/types/board.ts";
import { ErrorBoundary } from "../components/ErrorBoundary.tsx";
import type { Card as ModalCard } from "../core/types/ICardModal.ts";
import Portal from "../components/Portal.tsx";
import {
  checkTimeThresholds,
  initializeNotifications,
} from "../core/signals/timeSignals.ts";

export const convertModalCardToBoardCard = (modalCard: ModalCard): Card => {
  return {
    ...modalCard,
    isTracking: modalCard.isTracking !== undefined
      ? modalCard.isTracking
      : false,
    lastTrackingStart: modalCard.lastTrackingStart || modalCard.updatedAt ||
      Date.now(),
    currentElapsedTime: modalCard.currentElapsedTime || 0,
    checklist: modalCard.checklist?.map((item) => ({
      id: item.id,
      text: item.text,
      isChecked: item.isChecked,
    })) || [],
    dueDate: modalCard.dueDate || "",
    estimatedTime: modalCard.estimatedTime || 0,
    timeSpent: modalCard.timeSpent || 0,
  };
};

export const convertBoardCardToModalCard = (boardCard: Card): ModalCard => {
  return {
    ...boardCard,
    isTracking: boardCard.isTracking,
    lastTrackingStart: boardCard.lastTrackingStart,
    currentElapsedTime: boardCard.currentElapsedTime,
    checklist: boardCard.checklist?.map((item) => ({
      id: item.id,
      text: item.text,
      isChecked: item.isChecked,
      createdAt: new Date().toISOString(),
    })) || [],
  };
};

// Create a signal to expose handleCardEdit to other components
import { signal } from "@preact/signals";

// Signal to hold the card edit function
export const cardEditSignal = signal<
  ((card: Card, columnId: ColumnId) => void) | null
>(null);

export default function Board() {
  const [isCardModalOpen, setIsCardModalOpen] = useState<boolean>(false);
  const [editingCard, setEditingCard] = useState<EditingCard | null>(null);
  const [deletingCard, setDeletingCard] = useState<DeleteCardState | null>(
    null,
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

  // Memoize expensive computations
  const isTouchDevice = useMemo(() => {
    return "ontouchstart" in globalThis || navigator.maxTouchPoints > 0;
  }, []);

  // Effect for mobile warning - now using memoized value
  useEffect(() => {
    showMobileWarningSignal.value = isTouchDevice;
  }, [isTouchDevice]);

  // Effect for syncing with localStorage and cleanup
  useEffect(() => {
    try {
      // Sync with localStorage when columns change
      const unsubscribe = columnsSignal.subscribe(() => {
        syncWithLocalStorage();
      });

      // Cleanup function
      return () => {
        unsubscribe();
        cleanupBoardStore();
      };
    } catch (error) {
      console.error("Error in Board effect:", error);
      // Handle error appropriately
    }
  }, []);

  const handleCardEdit = useCallback((card: Card, columnId: ColumnId): void => {
    try {
      setEditingCard({ card, columnId });
      setIsCardModalOpen(true);
    } catch (error) {
      console.error("Error editing card:", error);
      // Handle error appropriately
    }
  }, []);

  // Set the card edit function in the signal so other components can access it
  useEffect(() => {
    cardEditSignal.value = handleCardEdit;
    return () => {
      cardEditSignal.value = null;
    };
  }, [handleCardEdit]);

  const handleCardDelete = useCallback(
    (card: Card, columnId: ColumnId): void => {
      try {
        setDeletingCard({ card, columnId });
        setIsDeleteModalOpen(true);
      } catch (error) {
        console.error("Error deleting card:", error);
        // Handle error appropriately
      }
    },
    [],
  );

  const handleCardModalOpen = useCallback((columnId: ColumnId): void => {
    try {
      setEditingCard({ card: null, columnId });
      setIsCardModalOpen(true);
    } catch (error) {
      console.error("Error opening card modal:", error);
      // Handle error appropriately
    }
  }, []);

  const handleCloseCardModal = useCallback((): void => {
    setIsCardModalOpen(false);
    setEditingCard(null);
  }, []);

  const handleCloseDeleteModal = useCallback((): void => {
    setIsDeleteModalOpen(false);
    setDeletingCard(null);
  }, []);

  const handleCardSubmit = useCallback((updatedCard: ModalCard): void => {
    if (!editingCard) return;

    const boardCard = convertModalCardToBoardCard(updatedCard);

    const columns = columnsSignal.value;
    const newColumns = columns.map((col) => {
      if (col.id === editingCard.columnId) {
        if (editingCard.card) {
          // Edit existing card
          return {
            ...col,
            cards: col.cards.map((c) =>
              c.id === boardCard.id ? { ...c, ...boardCard } : c
            ),
          };
        } else {
          // Add new card
          return {
            ...col,
            cards: [...col.cards, { ...boardCard, id: crypto.randomUUID() }],
          };
        }
      }
      return col;
    });

    columnsSignal.value = newColumns;
    setIsCardModalOpen(false);
    setEditingCard(null);
  }, [editingCard]);

  const handleCardReorder = (
    columnId: string,
    draggedId: string,
    targetIndex: number,
  ) => {
    const columns = columnsSignal.value;
    const newColumns = columns.map((col) => {
      if (col.id === columnId) {
        const cards = [...col.cards];
        const draggedCard = cards.find((c) => c.id === draggedId);
        const currentIndex = cards.findIndex((c) => c.id === draggedId);

        if (draggedCard && currentIndex !== -1) {
          cards.splice(currentIndex, 1);
          cards.splice(targetIndex, 0, draggedCard);
        }

        return {
          ...col,
          cards,
        };
      }
      return col;
    });

    columnsSignal.value = newColumns;
  };

  useEffect(() => {
    // Initialize notifications when component mounts
    initializeNotifications();

    // Set up interval to check time thresholds
    const checkInterval = setInterval(() => {
      columnsSignal.value.forEach((column) => {
        column.cards.forEach((card) => {
          if (card.isTracking) {
            checkTimeThresholds(card);
          }
        });
      });
    }, 1000);

    // No need to reset warnings when tracking starts/stops
    const unsubscribe = columnsSignal.subscribe(() => {
      // Only subscribe to changes, no warning resets
    });

    return () => {
      clearInterval(checkInterval);
      unsubscribe();
    };
  }, []);

  return (
    <ErrorBoundary
      fallback={(error) => (
        <div class="p-8 max-w-2xl mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl shadow-xl border border-gray-200/30 dark:border-gray-700/30 mt-10">
          <h2 class="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-600 dark:from-red-400 dark:to-pink-500">
            Board Error
          </h2>
          <p class="mt-3 text-gray-600 dark:text-gray-300">
            {error.message}
          </p>
          <button
            type="button"
            onClick={() => globalThis.location.reload()}
            class="mt-5 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
          >
            Reload Board
          </button>
        </div>
      )}
    >
      <div class="h-full w-full flex flex-col overflow-x-hidden">
        <ColumnBoard
          onDragStart={(card, columnId) => {
            draggedCardSignal.value = { card, sourceColumnId: columnId };
          }}
          onDragEnd={() => {
            draggedCardSignal.value = null;
          }}
          onDrop={(columnId) => {
            if (draggedCardSignal.value) {
              const { card, sourceColumnId } = draggedCardSignal.value;
              if (sourceColumnId !== columnId) {
                moveCard(card, sourceColumnId, columnId);
              }
            }
          }}
          onCardEdit={handleCardEdit}
          onCardDelete={handleCardDelete}
          onCardModalOpen={handleCardModalOpen}
          onActiveColumnChange={(columnId) => {
            boardStore.activeColumn.value = columnId;
          }}
          onLabelsCollapse={(collapsed) => {
            isLabelsCollapsedSignal.value = collapsed;
          }}
          onReorder={handleCardReorder}
        />

        <Portal>
          <CardModal
            isOpen={isCardModalOpen && editingCard !== null}
            onClose={handleCloseCardModal}
            onSubmit={handleCardSubmit}
            labels={labelsSignal.value}
            card={editingCard?.card
              ? convertBoardCardToModalCard(editingCard.card)
              : null}
            mode={editingCard?.card ? "edit" : "add"}
          />
        </Portal>

        <Portal>
          <DeleteCardModal
            isOpen={isDeleteModalOpen && deletingCard !== null}
            onClose={handleCloseDeleteModal}
            onConfirm={() => {
              if (!deletingCard) return;

              const columns = columnsSignal.value;
              const newColumns = columns.map((col) => {
                if (col.id === deletingCard.columnId) {
                  return {
                    ...col,
                    cards: col.cards.filter((c) =>
                      c.id !== deletingCard.card.id
                    ),
                  };
                }
                return col;
              });
              columnsSignal.value = newColumns;
              setIsDeleteModalOpen(false);
              setDeletingCard(null);
            }}
            card={deletingCard?.card}
          />
        </Portal>

        <Portal>
          <MobileWarningModal
            isOpen={showMobileWarningSignal.value}
            onClose={() => {
              showMobileWarningSignal.value = false;
            }}
          />
        </Portal>
      </div>
    </ErrorBoundary>
  );
}
