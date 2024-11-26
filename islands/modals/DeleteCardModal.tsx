import { JSX } from "preact";
import type { Card } from "../../core/types/index.ts";

interface DeleteCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  card: Card;
}

export default function DeleteCardModal(
  { isOpen, onClose, onConfirm, card }: DeleteCardModalProps,
) {
  if (!isOpen) return null;

  const handleSubmit = (e: JSX.TargetedEvent<HTMLFormElement, Event>) => {
    e.preventDefault();
    onConfirm();
  };

  return (
    <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 transform transition-all duration-300 ease-out">
        <form onSubmit={handleSubmit} class="relative">
          {/* Warning Icon */}
          <div class="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center shadow-lg">
            <svg
              class="w-12 h-12 text-red-500 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Header */}
          <div class="pt-8 px-6 text-center">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
              Delete Card
            </h2>
          </div>

          {/* Content */}
          <div class="p-6 space-y-4">
            <div class="text-center space-y-2">
              <p class="text-gray-600 dark:text-gray-400 text-lg">
                Are you sure you want to delete
              </p>
              <p class="font-medium text-gray-900 dark:text-white text-lg">
                "{card.title}"
              </p>
              <p class="text-sm text-red-500 dark:text-red-400 font-medium mt-4">
                This action cannot be undone.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div class="p-6 flex gap-3 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              class="flex-1 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 hover:shadow-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="flex-1 px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl transition-all duration-200 hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Delete
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
