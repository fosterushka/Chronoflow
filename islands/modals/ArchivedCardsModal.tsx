import { useEffect, useState } from "preact/hooks";
import {
  getRecentlyDeletedCards,
  restoreCard,
} from "../../core/utils/archiveUtils.ts";
import { columnsSignal } from "../../core/signals/boardSignals.ts";
import { formatTime } from "../../core/services/boardService.ts";

interface ArchivedCardsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ArchivedCardsModal(
  { isOpen, onClose }: ArchivedCardsModalProps,
) {
  const [archivedCards, setArchivedCards] = useState(getRecentlyDeletedCards());

  useEffect(() => {
    if (isOpen) {
      setArchivedCards(getRecentlyDeletedCards());
    }
  }, [isOpen]);

  const handleRestore = (cardId: string) => {
    const restored = restoreCard(cardId);
    if (!restored) return;
    const columns = columnsSignal.value;
    const updatedColumns = columns.map((col) => {
      if (col.id === restored.columnId) {
        return {
          ...col,
          cards: [...col.cards, restored.card],
        };
      }
      return col;
    });
    columnsSignal.value = updatedColumns;

    setArchivedCards(getRecentlyDeletedCards());
  };

  if (!isOpen) return null;

  return (
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
              Recently Deleted Cards
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {archivedCards.length === 0
          ? (
            <p class="text-gray-500 dark:text-gray-400 text-center py-4">
              No recently deleted cards
            </p>
          )
          : (
            <div class="space-y-3">
              {archivedCards.map((card) => (
                <div
                  key={card.id}
                  class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div class="flex-1">
                    <h3 class="font-medium text-gray-900 dark:text-white">
                      {card.title}
                    </h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      Deleted {new Date(card.deletedAt).toLocaleString()}
                      {card.timeSpent
                        ? ` • Time spent: ${formatTime(card.timeSpent)}`
                        : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => card.id && handleRestore(card.id)}
                    class="ml-4 px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  );
}
