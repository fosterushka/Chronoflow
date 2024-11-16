import { JSX } from "preact";
import type { Card } from "../types/index.ts";

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
    <div class="fixed inset-0 bg-black/70 flex items-start justify-center p-4 z-50">
      <div class="w-full max-w-2xl bg-white/80 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50">
        <form
          onSubmit={handleSubmit}
          class="divide-y divide-gray-200/50 dark:divide-gray-700/50"
        >
          {/* Header */}
          <div class="p-4 flex justify-between items-center">
            <h2 class="text-xl font-medium bg-transparent text-gray-900 dark:text-white">
              Delete Card
            </h2>
            <button
              type="button"
              onClick={onClose}
              class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
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

          {/* Content */}
          <div class="p-4 space-y-4">
            <div class="text-gray-600 dark:text-gray-400">
              Are you sure you want to delete
              "<span class="font-medium text-gray-900 dark:text-white">
                {card.title}
              </span>"?
              <br />This action cannot be undone.
            </div>
          </div>

          {/* Footer */}
          <div class="p-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              class="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors"
            >
              Delete
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
