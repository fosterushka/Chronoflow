import DarkModeToggle from "./DarkModeToggle.tsx";
import HeaderControls from "./HeaderControls.tsx";
import { useState } from "preact/hooks";
import { cardEditSignal } from "./Board.tsx";
import { Card } from "../core/types/ICardModal.ts";

export interface IHeaderProps {
  _stats?: [] | null;
  onCardEdit?: ((card: Card, columnId: string) => void) | null;
}

export function Header({ _stats = null }: IHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div
      id="header"
      class="backdrop-blur-md bg-white/70 dark:bg-gray-800/80 border-b border-gray-100/30 dark:border-gray-700/30 shadow-lg sticky top-0 z-50 transition-all duration-300 w-full"
    >
      <div class="flex items-center justify-between px-6 h-16">
        <div class="flex items-center gap-4">
          <div class="w-8 h-8 flex-shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md transform hover:scale-105 transition-all duration-300">
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
          <div class="flex items-center gap-3">
            <h1 class="hidden sm:block font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-base">
              Chronoflow
            </h1>
            <div id="greeting-container" class="hidden sm:block" />
          </div>
        </div>

        {/* Desktop Menu */}
        <div class="hidden sm:flex items-center gap-4">
          <div class="flex items-center gap-3">
            <HeaderControls onCardEdit={cardEditSignal.value} />
            <DarkModeToggle />
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          class="sm:hidden p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 rounded-lg backdrop-blur-sm transition-all duration-300"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMobileMenuOpen
              ? (
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              )
              : (
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div class="fixed inset-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg z-50 transition-all duration-300">
          <div class="flex flex-col h-full">
            <div class="flex items-center justify-between p-6 border-b border-gray-100/30 dark:border-gray-700/30">
              <h1 class="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                Chronoflow
              </h1>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                class="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 rounded-lg backdrop-blur-sm transition-all duration-300"
              >
                <svg
                  class="w-6 h-6"
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
            <div class="flex-1 overflow-y-auto p-6">
              <div class="space-y-8">
                {/* Controls */}
                <div class="space-y-6">
                  <h2 class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Controls
                  </h2>
                  <div class="flex flex-col gap-6">
                    <HeaderControls onCardEdit={cardEditSignal.value} />
                    <DarkModeToggle />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
