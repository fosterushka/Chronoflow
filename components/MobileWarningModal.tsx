import { JSX } from "preact";

interface MobileWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileWarningModal(
  { isOpen, onClose }: MobileWarningModalProps,
) {
  if (!isOpen) return null;

  return (
    <div class="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div class="w-full max-w-sm bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700">
        <div class="p-4">
          <div class="flex items-center justify-center mb-4">
            <div class="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
              <svg
                class="w-6 h-6 text-amber-600 dark:text-amber-500"
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
          <h3 class="text-lg font-medium text-center text-gray-900 dark:text-white mb-2">
            Desktop Version Recommended
          </h3>
          <p class="text-sm text-center text-gray-600 dark:text-gray-400">
            Since Chronoflow is in early development, we are currently focused
            on the desktop version. Some features might be unavailable or work
            differently on mobile devices.
          </p>
        </div>
        <div class="border-t border-gray-200 dark:border-gray-700 p-3 flex justify-center">
          <button
            onClick={onClose}
            class="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
