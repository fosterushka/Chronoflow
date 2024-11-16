import { useEffect, useState } from "preact/hooks";
import { JSX } from "preact";
import { clearStorage, exportData, importData } from "../utils/boardUtils.ts";
import type { Card, Column } from "../types/index.ts";
import ChangelogModal from "./ChangelogModal.tsx";

export default function HeaderControls() {
  const [columns, setColumns] = useState<Column[]>(() => {
    if (typeof localStorage !== "undefined") {
      const savedData = localStorage.getItem("chronoflowColumns");
      return savedData ? JSON.parse(savedData) : [];
    }
    return [];
  });

  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());

  //TODO: could be done better
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${
      minutes.toString().padStart(2, "0")
    }:${secs.toString().padStart(2, "0")}`;
  };

  // Get currently tracked task
  //TODO: bug if you move to done or todo still tracking time
  const getTrackedTask = () => {
    for (const column of columns) {
      const trackedCard = column.cards.find((card) => card.isTracking);
      if (trackedCard) {
        return { card: trackedCard, columnId: column.id };
      }
    }
    return null;
  };

  const getTimeBasedColor = (card: Card) => {
    if (!card.isTracking) return "text-gray-500 dark:text-gray-400";

    const estimatedTimeInSeconds = card.estimatedTime
      ? card.estimatedTime * 60
      : 0;
    const currentElapsedTime = Math.floor(
      (currentTime - (card.lastTrackingStart || 0)) / 1000,
    );
    const totalTime = (card.timeSpent || 0) + currentElapsedTime;

    if (estimatedTimeInSeconds && totalTime > estimatedTimeInSeconds) {
      return "text-red-500 dark:text-red-400";
    }
    if (estimatedTimeInSeconds && totalTime >= estimatedTimeInSeconds / 2) {
      return "text-amber-500 dark:text-amber-400";
    }
    return "text-emerald-500 dark:text-emerald-400";
  };

  //TODO: bottleneck: Update timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Listen for board updates
  useEffect(() => {
    const handleBoardUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.columns) {
        setColumns(customEvent.detail.columns);
      }
    };

    globalThis.addEventListener("board-update", handleBoardUpdate);
    return () =>
      globalThis.removeEventListener("board-update", handleBoardUpdate);
  }, []);

  const handleClearStorage = () => {
    clearStorage(setColumns);
  };

  const handleExport = () => {
    exportData(columns);
  };

  //TODO: improved
  const handleImport = (e: JSX.TargetedEvent<HTMLInputElement, Event>) => {
    const input = e.target as HTMLInputElement;
    importData(input.files?.[0], setColumns);
    input.value = "";
  };

  const trackedTask = getTrackedTask();

  return (
    <div class="flex items-center gap-2">
      {trackedTask && (
        <>
          <div class="flex items-center gap-2 px-3 py-1.5 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse">
              </div>
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[200px]">
                {trackedTask.card.title}
              </span>
            </div>
            <span
              class={`text-sm font-medium ${
                getTimeBasedColor(trackedTask.card)
              }`}
            >
              {formatTime(
                (trackedTask.card.timeSpent || 0) +
                  Math.floor(
                    (currentTime - (trackedTask.card.lastTrackingStart || 0)) /
                      1000,
                  ),
              )}
            </span>
          </div>
          <div class="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>
        </>
      )}
      <div class="relative group">
        <button
          onClick={handleClearStorage}
          class="flex items-center justify-center p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
        <span class="absolute px-2 py-1 bg-gray-900/90 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 -bottom-8 left-1/2 -translate-x-1/2">
          Clear All Data
        </span>
      </div>

      <div class="relative group">
        <button
          onClick={handleExport}
          class="flex items-center justify-center p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
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
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
        </button>
        <span class="absolute px-2 py-1 bg-gray-900/90 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 -bottom-8 left-1/2 -translate-x-1/2">
          Export Board
        </span>
      </div>

      <div class="relative group">
        <label class="flex items-center justify-center p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors cursor-pointer">
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
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            class="hidden"
          />
        </label>
        <span class="absolute px-2 py-1 bg-gray-900/90 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 -bottom-8 left-1/2 -translate-x-1/2">
          Import Board
        </span>
      </div>

      <div class="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>

      <div class="relative group">
        <button
          onClick={() => setIsChangelogOpen(true)}
          class="flex items-center justify-center p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 rounded-lg transition-colors"
        >
          <span class="text-xs">0.0.3</span>
        </button>
        <span class="absolute px-2 py-1 bg-gray-900/90 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 -bottom-8 left-1/2 -translate-x-1/2">
          View Changelog
        </span>
      </div>

      <ChangelogModal
        isOpen={isChangelogOpen}
        onClose={() => setIsChangelogOpen(false)}
      />
    </div>
  );
}
