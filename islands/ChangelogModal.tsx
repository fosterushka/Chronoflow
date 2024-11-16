import { JSX } from "preact";

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const changelog = [
  {
    version: "0.0.3",
    date: "16/11/2024",
    changes: [
      "Converted sidebar to sticky header for better space utilization",
      "Enhanced time tracking visualization with dynamic indicators and colors",
      "Made modal layout more compact and responsive",
      "Fixed modal state persistence issues",
      "Improved time input fields with better validation",
    ],
  },
  {
    version: "0.0.2",
    date: "16/11/2024",
    changes: [
      "Improved UI layout and consistency",
      "Standardized column and card sizes",
      "Perfectly centered cards within columns",
      "Reduced sidebar width for better space utilization",
      "Added version display with changelog popup",
      "Enhanced text truncation for long content",
      "Improved dark mode contrast",
    ],
  },
  {
    version: "0.0.1",
    date: "15/11/2024",
    changes: [
      "Initial release",
      "Basic kanban board functionality",
      "Time tracking features",
      "Dark mode support",
      "Task management with labels",
      "Checklist support",
    ],
  },
];

export default function ChangelogModal(
  { isOpen, onClose }: ChangelogModalProps,
): JSX.Element {
  if (!isOpen) return null;

  return (
    <div class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-black opacity-70" onClick={onClose}></div>
        <div class="relative bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full max-h-[80vh] flex flex-col">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">
              Changelog
            </h2>
            <button
              onClick={onClose}
              class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
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
          <div class="overflow-y-auto flex-1 pr-2 -mr-2">
            <div class="space-y-6">
              {changelog.map((release) => (
                <div
                  key={release.version}
                  class="border-b border-gray-200 dark:border-gray-700 pb-4"
                >
                  <div class="flex justify-between items-center mb-2">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                      Version {release.version}
                    </h3>
                    <span class="text-sm text-gray-500 dark:text-gray-400">
                      {release.date}
                    </span>
                  </div>
                  <ul class="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                    {release.changes.map((change, index) => (
                      <li key={index}>{change}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
