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
import { LABELS } from "../core/utils/boardUtils.ts";
import type { Card, ColumnId, EditingCard } from "../core/types/index.ts";
import type { DeleteCardState } from "../core/types/board.ts";
import { ErrorBoundary } from "../components/ErrorBoundary.tsx";

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

  const handleCardSubmit = useCallback((updatedCard: Card): void => {
    if (!editingCard) return;

    const columns = columnsSignal.value;
    const newColumns = columns.map((col) => {
      if (col.id === editingCard.columnId) {
        if (editingCard.card) {
          // Edit existing card
          return {
            ...col,
            cards: col.cards.map((c) =>
              c.id === updatedCard.id ? { ...c, ...updatedCard } : c
            ),
          };
        } else {
          // Add new card
          return {
            ...col,
            cards: [...col.cards, { ...updatedCard, id: crypto.randomUUID() }],
          };
        }
      }
      return col;
    });

    columnsSignal.value = newColumns;
    setIsCardModalOpen(false);
    setEditingCard(null);
  }, [editingCard]);

  return (
    <ErrorBoundary
      fallback={(error) => (
        <div class="p-6 max-w-2xl mx-auto">
          <h2 class="text-xl font-semibold text-red-600 dark:text-red-400">
            Board Error
          </h2>
          <p class="mt-2 text-gray-600 dark:text-gray-300">
            {error.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Reload Board
          </button>
        </div>
      )}
    >
      <div class="h-full flex flex-col">
        <ColumnBoard
          onDragStart={(card, columnId) => {
            draggedCardSignal.value = { card, sourceColumnId: columnId };
          }}
          onDragEnd={() => {
            draggedCardSignal.value = null;
          }}
          onDragOver={(e) => {
            e.preventDefault();
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
        />

        {isCardModalOpen && editingCard && (
          <CardModal
            isOpen={isCardModalOpen}
            onClose={handleCloseCardModal}
            onSubmit={handleCardSubmit}
            labels={LABELS}
            card={editingCard.card}
            mode={editingCard.card ? "edit" : "add"}
          />
        )}

        {isDeleteModalOpen && deletingCard && (
          <DeleteCardModal
            isOpen={isDeleteModalOpen}
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
            card={deletingCard.card}
          />
        )}

        {showMobileWarningSignal.value && (
          <MobileWarningModal
            isOpen={showMobileWarningSignal.value}
            onClose={() => {
              showMobileWarningSignal.value = false;
            }}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}
