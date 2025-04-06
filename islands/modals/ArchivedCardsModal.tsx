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
    <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div class="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl transform transition-all duration-300 animate-fade-scale-up">
        <div class="relative">
          <div class="absolute -top-16 left-1/2 -translate-x-1/2 w-24 h-24 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-full flex items-center justify-center shadow-lg transform-gpu animate-float">
            <svg
              class="w-12 h-12 text-purple-500 dark:text-purple-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
              />
            </svg>
          </div>
        </div>

        <div class="p-6 pt-14">
          <h3 class="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-indigo-500 dark:from-purple-400 dark:to-indigo-400 mb-6">
            Recently Deleted Cards
          </h3>

          {archivedCards.length === 0
            ? (
              <div class="text-center py-8">
                <p class="text-gray-500 dark:text-gray-400">
                  No recently deleted cards
                </p>
              </div>
            )
            : (
              <div class="space-y-3 max-h-[60vh] overflow-y-auto">
                {archivedCards.map((card) => (
                  <div
                    key={card.id}
                    class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <div class="flex-1 min-w-0">
                      <h4 class="font-medium text-gray-900 dark:text-white truncate">
                        {card.title}
                      </h4>
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
                      class="ml-4 px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors duration-200"
                    >
                      Restore
                    </button>
                  </div>
                ))}
              </div>
            )}
        </div>

        <div class="p-6 border-t border-gray-100 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            class="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-medium rounded-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
