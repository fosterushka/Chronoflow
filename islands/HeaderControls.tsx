import { useEffect, useState } from "preact/hooks";
import { JSX } from "preact";
import { clearStorage, exportData, importData } from "./Board.tsx";
import type { Column } from "../types/index.ts";
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

  const handleImport = (e: JSX.TargetedEvent<HTMLInputElement, Event>) => {
    const input = e.target as HTMLInputElement;
    importData(input.files?.[0], setColumns);
    // Reset input value to allow importing the same file again
    input.value = "";
  };

  return (
    <div class="flex items-center gap-2">
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
