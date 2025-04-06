import { JSX } from "preact";
import type { Card } from "../../core/types/index.ts";

interface DeleteCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  card: Card | undefined;
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
    <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div class="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-2xl transform transition-all duration-300 animate-fade-scale-up">
        <form onSubmit={handleSubmit} class="relative">
          <div class="relative">
            <div class="absolute -top-16 left-1/2 -translate-x-1/2 w-24 h-24 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-full flex items-center justify-center shadow-lg transform-gpu animate-float">
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
          </div>

          <div class="p-6 pt-14">
            <h3 class="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-rose-500 dark:from-red-400 dark:to-rose-400 mb-4">
              Delete Card
            </h3>
            <div class="space-y-2 text-center">
              <p class="text-gray-600 dark:text-gray-300">
                Are you sure you want to delete
              </p>
              <p class="font-medium text-gray-900 dark:text-white">
                "{card?.title}"
              </p>
              <p class="text-sm text-red-500 dark:text-red-400 font-medium mt-4">
                This action cannot be undone.
              </p>
            </div>
          </div>

          <div class="p-6 flex gap-3 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              class="flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white font-medium rounded-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg"
            >
              Delete
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
