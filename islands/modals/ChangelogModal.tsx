import { JSX } from "preact";

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const changelog = [
  {
    version: "0.0.4",
    date: "29/11/2024",
    changes: [
      "Welcoming screen",
      "Added GitHub issue creation",
      "Improved GitHub integration",
      "Added caching and memoization on some part of app",
      "Streamlined data structure for better performance",
      "Added loading indicators",
    ],
  },
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
    date: "16/11/2024",
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
): JSX.Element | null {
  if (!isOpen) return null;

  return (
    <div class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4 py-8">
        <div
          class="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        >
        </div>
        <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col transform transition-all duration-300 ease-out animate-fade-scale-up">
          {/* Header */}
          <div class="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 flex items-center justify-center">
                <svg
                  class="w-5 h-5 text-blue-500 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h2 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500">
                Changelog
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg
                class="w-5 h-5"
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

          {/* Content */}
          <div class="overflow-y-auto flex-1 px-6">
            <div class="space-y-8 py-6">
              {changelog.map((release, releaseIndex) => (
                <div
                  key={release.version}
                  class={`relative ${
                    releaseIndex !== changelog.length - 1
                      ? "pb-8 before:absolute before:left-[11px] before:top-[30px] before:h-full before:w-0.5 before:bg-gray-200 dark:before:bg-gray-700"
                      : ""
                  }`}
                >
                  <div class="flex gap-6">
                    {/* Version Dot */}
                    <div class="relative z-10 w-6 h-6 rounded-full bg-blue-500 dark:bg-blue-400 flex items-center justify-center ring-8 ring-white dark:ring-gray-800 transition-transform duration-200 hover:scale-110">
                      <svg
                        class="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <circle cx="8" cy="8" r="3" />
                      </svg>
                    </div>

                    {/* Version Content */}
                    <div class="flex-1">
                      <div class="flex flex-wrap items-center gap-2 mb-3">
                        <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                          Version {release.version}
                        </h3>
                        <span class="px-2.5 py-0.5 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-full">
                          {release.date}
                        </span>
                      </div>
                      <ul class="space-y-2">
                        {release.changes.map((change, index) => (
                          <li
                            key={index}
                            class="flex items-start gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                          >
                            <svg
                              class="w-5 h-5 mt-0.5 flex-shrink-0 text-blue-500 dark:text-blue-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M9 12l2 2 4-4"
                              />
                            </svg>
                            <span>{change}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
