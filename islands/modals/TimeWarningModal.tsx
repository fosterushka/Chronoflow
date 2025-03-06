import { JSX } from "preact";

interface TimeWarningModalProps {
  cardTitle: string;
  type: "warning" | "exceeded";
  onClose: () => void;
}

export default function TimeWarningModal(
  { cardTitle, type, onClose }: TimeWarningModalProps,
): JSX.Element {
  return (
    <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700">
        <div class="p-4">
          <div class="flex items-center gap-3 mb-2">
            <div
              class={`w-2 h-2 rounded-full ${
                type === "exceeded"
                  ? "bg-red-500 animate-pulse"
                  : "bg-amber-500 animate-pulse"
              }`}
            >
            </div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">
              {type === "exceeded" ? "Time Exceeded!" : "Time Warning!"}
            </h3>
          </div>
          <p class="text-gray-600 dark:text-gray-400">
            {type === "exceeded"
              ? `Task "${cardTitle}" has exceeded its estimated time.`
              : `Task "${cardTitle}" has reached 50% of its estimated time.`}
          </p>
        </div>
        <div class="border-t border-gray-100 dark:border-gray-700 p-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            class="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
