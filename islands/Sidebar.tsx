import { useState } from "preact/hooks";
import HeaderControls from "./HeaderControls.tsx";
import Statistics from "./Statistics.tsx";
import DarkModeToggle from "./DarkModeToggle.tsx";
import ChangelogModal from "./ChangelogModal.tsx";

interface SidebarProps {
  stats: {
    totalTasks: number;
    completedTasks: number;
    totalEstimatedTime: number;
    totalTimeSpent: number;
  };
  activeTask?: {
    title: string;
  };
}

export default function Sidebar({ stats, activeTask }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);

  return (
    <div
      class={`flex flex-col transition-all duration-300 ease-in-out relative z-50
        ${isCollapsed ? "w-16" : "w-58"} 
        h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700`}
    >
      <div class="p-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <div
          class={`flex items-center gap-3 ${
            isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
          } transition-all overflow-hidden`}
        >
          <div class="w-8 h-8 flex-shrink-0 bg-indigo-500 rounded-lg flex items-center justify-center">
            <svg
              class="w-5 h-5 text-white"
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
          <h1 class="font-bold text-gray-900 dark:text-white whitespace-nowrap text-sm">
            Chronoflow
          </h1>
          <DarkModeToggle />
        </div>

        {isCollapsed && (
          <div class="w-8 h-8 flex-shrink-0 bg-indigo-500 rounded-lg flex items-center justify-center">
            <svg
              class="w-5 h-5 text-white"
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
        )}
      </div>

      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        class="absolute -right-4 top-16 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <svg
          class={`w-4 h-4 text-gray-400 transition-transform duration-300 ${
            isCollapsed ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <div
        class={`flex-1 overflow-y-auto ${
          isCollapsed ? "opacity-0 hidden" : "opacity-100 visible"
        } transition-all duration-300`}
      >
        <div class="flex flex-col space-y-2 px-3 py-2">
          {activeTask && (
            <div class="bg-emerald-50 dark:bg-emerald-900/30 rounded-lg p-3">
              <div class="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-1">
                Currently Tracking
              </div>
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse">
                </div>
                <div class="text-sm text-emerald-700 dark:text-emerald-300 font-medium truncate">
                  {activeTask.title}
                </div>
              </div>
            </div>
          )}

          <div>
            <h2 class="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
              Statistics
            </h2>
            <Statistics {...stats} />
          </div>

          <div>
            <h2 class="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
              Board Actions
            </h2>
            <div class="space-y-2">
              <HeaderControls />
            </div>
          </div>
        </div>
      </div>

      {isCollapsed && (
        <div class="flex-1 py-4">
          <div class="space-y-4">
            {activeTask && (
              <div class="px-4 group relative">
                <div class="w-8 h-8 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse">
                  </div>
                </div>
                <div class="absolute left-full ml-2 px-2 py-1 bg-gray-900/90 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                  {activeTask.title}
                </div>
              </div>
            )}

            <div class="px-4 group relative">
              <div class="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <div class="flex items-center gap-1">
                  <div class="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                  <span class="text-xs font-medium text-gray-600 dark:text-gray-300">
                    {stats.totalTasks}
                  </span>
                </div>
              </div>
              <div class="absolute left-full ml-2 px-2 py-1 bg-gray-900/90 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                Total Tasks: {stats.totalTasks}
              </div>
            </div>

            <div class="px-4 group relative">
              <div class="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <div class="flex items-center gap-1">
                  <div class="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  <span class="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    {stats.completedTasks}
                  </span>
                </div>
              </div>
              <div class="absolute left-full ml-2 px-2 py-1 bg-gray-900/90 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                Completed: {stats.completedTasks}
              </div>
            </div>

            <div class="px-4 group relative">
              <div class="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <div class="flex items-center gap-1">
                  <div class="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                  <span class="text-xs font-medium text-blue-600 dark:text-blue-400">
                    {Math.floor(stats.totalTimeSpent / 3600)}h
                  </span>
                </div>
              </div>
              <div class="absolute left-full ml-2 px-2 py-1 bg-gray-900/90 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                Time Spent: {Math.floor(stats.totalTimeSpent / 3600)}h{" "}
                {Math.floor((stats.totalTimeSpent % 3600) / 60)}m
              </div>
            </div>
          </div>
        </div>
      )}
      <div class="mt-auto border-t border-gray-200 dark:border-gray-700 p-1">
        <button
          onClick={() => setIsChangelogOpen(true)}
          class="w-full text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-center"
        >
          0.0.2
        </button>
      </div>

      <ChangelogModal
        isOpen={isChangelogOpen}
        onClose={() => setIsChangelogOpen(false)}
      />
    </div>
  );
}
