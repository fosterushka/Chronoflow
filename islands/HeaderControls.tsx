import { useEffect, useState } from "preact/hooks";
import { JSX } from "preact";
import { clearStorage, exportData, importData } from "../utils/boardUtils.ts";
import type { Card, Column } from "../types/index.ts";
import ChangelogModal from "./ChangelogModal.tsx";
import WelcomeModal from "./WelcomeModal.tsx";
import { changelog } from "./ChangelogModal.tsx";
import {
  currentTime,
  formattedTime,
  getElapsedTime,
} from "../signals/timeSignals.ts";

export default function HeaderControls() {
  const [columns, setColumns] = useState<Column[]>(() => {
    if (typeof localStorage !== "undefined") {
      const savedData = localStorage.getItem("chronoflowColumns");
      return savedData ? JSON.parse(savedData) : [];
    }
    return [];
  });

  const formatedNowTime = new Date(currentTime).toLocaleString("en-GB");

  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const hasSeenIntro = localStorage.getItem("chronoflowIntroSeen");
    const savedName = localStorage.getItem("chronoflowUserName");

    if (!hasSeenIntro) {
      setShowWelcome(true);
    }

    if (savedName) {
      setUserName(savedName);
    }
  }, []);

  /**
   * Handles the completion of the welcome process.
   * Sets the intro as seen, saves the user's name, updates the state, and closes the welcome modal.
   * @param {string} name - The name entered by the user
   */
  const handleWelcomeComplete = (name: string) => {
    localStorage.setItem("chronoflowIntroSeen", "true");
    localStorage.setItem("chronoflowUserName", name);
    setUserName(name);
    setShowWelcome(false);
  };

  /**
   * Handles skipping the welcome process.
   * Sets the intro as seen and closes the welcome modal without saving a name.
   */
  const handleWelcomeSkip = () => {
    localStorage.setItem("chronoflowIntroSeen", "true");
    setShowWelcome(false);
  };

  //TODO: interface and tests.
  const getGreeting: any = () => {
    const hour = new Date().getHours();

    const greetings = [
      {
        condition: hour >= 6 && hour < 12,
        text: "Good morning",
        icon:
          '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>',
      },
      {
        condition: hour >= 12 && hour <= 18,
        text: "Good day",
        icon:
          '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>',
      },
      {
        condition: true,
        text: "Good evening",
        icon:
          '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>',
      },
    ];

    return greetings.find((g) => g.condition);
  };

  useEffect(() => {
    const greetingContainer = document.getElementById("greeting-container");
    if (greetingContainer) {
      const { text, icon } = getGreeting();
      greetingContainer.innerHTML = "";
      const greetingDiv = document.createElement("div");
      greetingDiv.className =
        "flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300";

      const iconDiv = document.createElement("div");
      iconDiv.innerHTML = icon;

      greetingDiv.appendChild(iconDiv);
      greetingDiv.appendChild(
        document.createTextNode(userName ? ` ${text}, ${userName} ` : text),
      );
      greetingContainer.appendChild(greetingDiv);
    }
  }, [userName]);

  //TODO: could be done better
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${
      minutes.toString().padStart(2, "0")
    }:${secs.toString().padStart(2, "0")}`;
  };

  //TODO: bug if you move to done or todo still tracking time
  const getTrackedTask = () => {
    for (const column of columns) {
      const trackedCard = column.cards.find((card) => card.isTracking);
      if (trackedCard) {
        return {
          card: trackedCard,
          columnId: column.id,
        };
      }
    }
    return null;
  };

  const getTimeBasedColor = (card: Card) => {
    if (!card.isTracking) return "text-gray-500 dark:text-gray-400";

    const estimatedTimeInSeconds = card.estimatedTime
      ? card.estimatedTime * 60
      : 0;
    const currentElapsedTime = getElapsedTime(card.lastTrackingStart || 0);
    const totalTime = (card.timeSpent || 0) + currentElapsedTime;

    if (estimatedTimeInSeconds && totalTime > estimatedTimeInSeconds) {
      return "text-red-500 dark:text-red-400";
    }
    if (estimatedTimeInSeconds && totalTime >= estimatedTimeInSeconds / 2) {
      return "text-amber-500 dark:text-amber-400";
    }
    return "text-emerald-500 dark:text-emerald-400";
  };

  const trackedTask = getTrackedTask();

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
                trackedTask.card.timeSpent +
                  getElapsedTime(trackedTask.card.lastTrackingStart || 0),
              )}
            </span>
          </div>
          <div class="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>
        </>
      )}

      <div class="hidden xl:flex text-sm text-gray-600 dark:text-gray-400 items-center gap-2">
        <span>Time is {formatedNowTime}</span>
      </div>

      <div class="relative group">
        <button
          onClick={handleClearStorage}
          class="flex items-center justify-center text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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
        <span class="absolute px-2 bg-gray-900/90 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 -bottom-8 left-1/2 -translate-x-1/2">
          Clear All Data
        </span>
      </div>

      <div class="relative group">
        <button
          onClick={handleExport}
          disabled={columns.every((col) => col.cards.length === 0)}
          class="flex items-center justify-center p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
        <span class="absolute px-2 bg-gray-900/90 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 -bottom-8 left-1/2 -translate-x-1/2">
          Export Board
        </span>
      </div>

      <div class="relative group">
        <label class="flex items-center justify-center text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors cursor-pointer">
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

      <div class="relative group flex items-center gap-2">
        <button
          onClick={() => setIsChangelogOpen(true)}
          class="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <span class="text-xs">{changelog[0].version}</span>
        </button>
        <span class="absolute px-2 py-1 bg-gray-900/90 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 -bottom-8 left-1/2 -translate-x-1/2">
          View Changelog
        </span>
      </div>

      <ChangelogModal
        isOpen={isChangelogOpen}
        onClose={() => setIsChangelogOpen(false)}
      />

      <WelcomeModal
        isOpen={showWelcome}
        onClose={handleWelcomeSkip}
        onComplete={handleWelcomeComplete}
      />
    </div>
  );
}
