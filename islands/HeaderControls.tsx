import { useEffect, useState } from "preact/hooks";
import { JSX } from "preact";
import { clearStorage, exportData, importData } from "./Board.tsx";
import type { Column } from "../types/index.ts";

export default function HeaderControls() {
  const [columns, setColumns] = useState<Column[]>(() => {
    if (typeof localStorage !== "undefined") {
      const savedData = localStorage.getItem("chronoflowColumns");
      return savedData ? JSON.parse(savedData) : [];
    }
    return [];
  });

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
    <div class="space-y-2">
      <button
        onClick={handleClearStorage}
        class="w-full flex items-center gap-2 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm"
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
        Clear All Data
      </button>

      <button
        onClick={handleExport}
        class="w-full flex items-center gap-2 px-3 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors text-sm"
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
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        Export Board
      </button>

      <label class="w-full flex items-center gap-2 px-3 py-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors text-sm cursor-pointer">
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
        Import Board
        <input
          type="file"
          accept=".json"
          class="hidden"
          onChange={handleImport}
        />
      </label>

      <div class="w-full h-px bg-gray-200 dark:bg-gray-700 my-2" />
    </div>
  );
}
