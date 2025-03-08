import { useEffect, useState } from "preact/hooks";
import { INotification } from "../../core/types/INotification.ts";
import { markAsRead } from "../../core/signals/notificationSignals.ts";

interface FloatingNotificationProps {
  notification: INotification;
  onDismiss: () => void;
}

export default function FloatingNotification(
  { notification, onDismiss }: FloatingNotificationProps,
) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onDismiss, 300); // Allow animation to complete
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    markAsRead(notification.id);
    setTimeout(onDismiss, 300);
  };

  return (
    <div
      class={`
        fixed top-4 right-4 max-w-sm w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg 
        border border-gray-100 dark:border-gray-700 transform transition-all duration-300
        z-50 pointer-events-auto
        ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }
      `}
      style="margin-top: calc(3.5rem + 1rem);" // Add space below header
    >
      <div class="p-4">
        <div class="flex items-center gap-3">
          <div
            class={`w-2 h-2 rounded-full ${
              notification.type === "exceeded"
                ? "bg-red-500 animate-pulse"
                : notification.type === "warning"
                ? "bg-amber-500 animate-pulse"
                : "bg-blue-500"
            }`}
          />
          <h3 class="flex-1 text-sm font-medium text-gray-900 dark:text-white">
            {notification.title}
          </h3>
          <button
            type="button"
            onClick={handleDismiss}
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg
              class="w-4 h-4"
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
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {notification.message}
        </p>
      </div>
    </div>
  );
}
