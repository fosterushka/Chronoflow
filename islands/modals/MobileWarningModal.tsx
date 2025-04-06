interface MobileWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileWarningModal(
  { isOpen, onClose }: MobileWarningModalProps,
) {
  if (!isOpen) return null;

  return (
    <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div class="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-2xl transform transition-all duration-300 animate-fade-scale-up">
        <div class="relative">
          <div class="absolute -top-16 left-1/2 -translate-x-1/2 w-24 h-24 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 rounded-full flex items-center justify-center shadow-lg transform-gpu animate-float">
            <svg
              class="w-12 h-12 text-amber-500 dark:text-amber-400 transform-gpu animate-pulse-subtle"
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
          <h3 class="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-400 dark:to-orange-400 mb-4">
            Desktop Version Recommended
          </h3>
          <p class="text-base text-center leading-relaxed text-gray-600 dark:text-gray-300">
            Since Chronoflow is in early development, we are currently focused
            on the desktop experience. Some features might be limited or behave
            differently on mobile devices.
          </p>
        </div>

        <div class="p-6 flex justify-center border-t border-gray-100 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            class="w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium rounded-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg"
          >
            Continue Anyway
          </button>
        </div>
      </div>
    </div>
  );
}
