import { JSX } from "preact";

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const changelog = [
  {
    version: "0.0.5",
    date: "09/03/2025",
    changes: [
      "✨ Core Features",
      "- Customizable labels with colors",
      "- Multi-project board support",
      "- Global task filtering system (search and labels)",
      "- Archiving and restoring deleted tasks",

      "🎨 UI Improvements",
      "- Enhanced dark theme UI",
      "- Better drag & drop with visual feedback",
      "- Improved popup windows using portals",
      "- Tracked task preview in header",

      "⚡ Performance & Technical",
      "- Enhanced state management system",
      "- Major code refactoring and cleanup",
      "- Performance optimizations",

      "🔥 Experimental Features",
      "- Column collapse functionality",
      "- PWA support",
      "- Notification system",
    ],
  },
  {
    version: "0.0.4a",
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
    <div class="fixed inset-0 z-[100] overflow-y-auto">
      <div class="min-h-screen px-4 text-center">
        <div
          class="fixed inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        <div class="inline-block w-full max-w-2xl my-8 text-left align-middle transition-all transform">
          <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl">
            {/* Header */}
            <div class="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 flex items-center justify-center">
                  <svg
                    class="w-6 h-6 text-blue-500 dark:text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
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
                  What's New
                </h2>
              </div>
              <button
                onClick={onClose}
                class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg
                  class="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
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
            <div class="overflow-y-auto max-h-[60vh] p-6">
              <div class="space-y-12">
                {changelog.map((release, index) => (
                  <div key={release.version} class="relative">
                    <div class="flex gap-6">
                      <div class="relative">
                        <div class="w-4 h-4 rounded-full bg-blue-500 dark:bg-blue-400 ring-4 ring-blue-50 dark:ring-blue-900" />
                        {index !== changelog.length - 1 && (
                          <div class="absolute top-4 bottom-0 left-2 w-0.5 -translate-x-1/2 bg-gray-200 dark:bg-gray-700" />
                        )}
                      </div>
                      <div class="flex-1 -mt-1">
                        <div class="flex flex-wrap items-center gap-3 mb-4">
                          <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                            Version {release.version}
                          </h3>
                          <span class="px-2.5 py-0.5 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-full">
                            {release.date}
                          </span>
                        </div>
                        <div class="prose dark:prose-invert max-w-none">
                          {release.changes.map((change, changeIndex) => (
                            <div
                              key={changeIndex}
                              class="text-gray-600 dark:text-gray-300"
                            >
                              {change.startsWith("-")
                                ? <div class="ml-6 my-1">{change}</div>
                                : (
                                  <div class="font-medium mt-4 first:mt-0">
                                    {change}
                                  </div>
                                )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
