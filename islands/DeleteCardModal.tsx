import { JSX } from "preact";
import type { Card } from "../types/index.ts";

interface DeleteCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  card: Card;
}

export default function DeleteCardModal({ isOpen, onClose, onConfirm, card }: DeleteCardModalProps) {
  if (!isOpen) return null;

  const handleSubmit = (e: JSX.TargetedEvent<HTMLFormElement, Event>) => {
    e.preventDefault();
    onConfirm();
  };

  return (
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 class="text-xl font-bold mb-2 text-gray-900 dark:text-white">Delete Card</h2>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          Are you sure you want to delete the card "<span class="font-medium text-gray-900 dark:text-white">{card.title}</span>"? 
          This action cannot be undone.
        </p>
        <form onSubmit={handleSubmit}>
          <div class="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
            >
              Delete
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
