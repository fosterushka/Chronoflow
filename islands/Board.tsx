import { useCallback, useEffect, useState } from "preact/hooks";
import CardModal from "./modals/CardModal.tsx";
import DeleteCardModal from "./modals/DeleteCardModal.tsx";
import ColumnBoard from "./ColumnBoard.tsx";
import MobileWarningModal from "./modals/MobileWarningModal.tsx";
import { syncWithLocalStorage } from "../core/services/boardService.ts";
import {
  activeColumnSignal,
  columnsSignal,
  draggedCardSignal,
  isLabelsCollapsedSignal,
  moveCard,
  showMobileWarningSignal,
} from "../core/signals/boardSignals.ts";
import { LABELS } from "../core/utils/boardUtils.ts";
import type { Card, EditingCard } from "../core/types/index.ts";

export default function Board() {
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<EditingCard | null>(null);
  const [deletingCard, setDeletingCard] = useState<
    { card: Card; columnId: string } | null
  >(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    const isTouchDevice = "ontouchstart" in window ||
      navigator.maxTouchPoints > 0;
    showMobileWarningSignal.value = isTouchDevice;
  }, []);

  useEffect(() => {
    syncWithLocalStorage();
  }, [columnsSignal.value]);

  const handleCardEdit = useCallback((card: Card, columnId: string) => {
    setEditingCard({ card, columnId });
    setIsCardModalOpen(true);
  }, []);

  const handleCardDelete = useCallback((card: Card, columnId: string) => {
    setDeletingCard({ card, columnId });
    setIsDeleteModalOpen(true);
  }, []);

  const handleCardModalOpen = useCallback((columnId: string) => {
    setEditingCard({ card: null, columnId });
    setIsCardModalOpen(true);
  }, []);

  const handleCardSubmit = useCallback((updatedCard: Card) => {
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
    <>
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
          activeColumnSignal.value = columnId;
        }}
        onLabelsCollapse={(collapsed) => {
          isLabelsCollapsedSignal.value = collapsed;
        }}
      />

      {isCardModalOpen && editingCard && (
        <CardModal
          isOpen={isCardModalOpen}
          onClose={() => {
            setIsCardModalOpen(false);
            setEditingCard(null);
          }}
          onSubmit={handleCardSubmit}
          labels={LABELS}
          card={editingCard.card}
          mode={editingCard.card ? "edit" : "add"}
        />
      )}

      {isDeleteModalOpen && deletingCard && (
        <DeleteCardModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setDeletingCard(null);
          }}
          onConfirm={() => {
            if (!deletingCard) return;

            const columns = columnsSignal.value;
            const newColumns = columns.map((col) => {
              if (col.id === deletingCard.columnId) {
                return {
                  ...col,
                  cards: col.cards.filter((c) => c.id !== deletingCard.card.id),
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
    </>
  );
}
