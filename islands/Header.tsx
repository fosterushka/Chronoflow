import DarkModeToggle from "./DarkModeToggle.tsx";
import HeaderControls from "./HeaderControls.tsx";
import { useEffect, useRef, useState } from "preact/hooks";
import { cardEditSignal } from "./Board.tsx";
import { Card } from "../core/types/ICardModal.ts";
import { useSignal } from "@preact/signals";
import { filterSignal } from "../core/signals/filterSignals.ts";
import { labelsSignal } from "../core/signals/labelSignals.ts";
import { Label } from "../core/types/shared.ts";
import { experimentalFeaturesEnabled } from "./HeaderControls.tsx";

export interface IHeaderProps {
  _stats?: [] | null;
  onCardEdit?: ((card: Card, columnId: string) => void) | null;
}

export function Header({ _stats = null }: IHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const showLabelDropdown = useSignal(false);
  const labelDropdownRef = useRef<HTMLDivElement>(null);

  const handleSearchChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    filterSignal.value = {
      ...filterSignal.value,
      searchQuery: target.value,
    };
  };

  const toggleLabel = (labelId: string) => {
    const currentLabels = filterSignal.value.selectedLabels;
    const newLabels = currentLabels.includes(labelId)
      ? currentLabels.filter((id) => id !== labelId)
      : [...currentLabels, labelId];

    filterSignal.value = {
      ...filterSignal.value,
      selectedLabels: newLabels,
    };
  };

  const clearAllFilters = () => {
    filterSignal.value = {
      searchQuery: "",
      selectedLabels: [],
    };
  };

  // Handle click outside of label dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        labelDropdownRef.current &&
        !labelDropdownRef.current.contains(event.target as Node)
      ) {
        showLabelDropdown.value = false;
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      id="header"
      class="backdrop-blur-md bg-white/70 dark:bg-gray-800/80 border-b border-gray-100/30 dark:border-gray-700/30 shadow-lg sticky top-0 z-50 transition-all duration-300 w-full"
    >
      <div class="flex items-center justify-between px-6 h-16">
        <div class="flex items-center gap-4">
          <div class="relative group">
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
            <a
              href="https://github.com/fosterushka/Chronoflow"
              target="_blank"
              rel="noopener noreferrer"
              class="absolute top-0 left-0 w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md transform hover:scale-105 transition-all duration-300 opacity-0 group-hover:opacity-100"
            >
              <svg
                class="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clip-rule="evenodd"
                />
              </svg>
            </a>
          </div>
          <div class="flex items-center gap-3">
            <h1 class="hidden sm:block font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-base">
              Chronoflow
            </h1>
            <div id="greeting-container" class="hidden sm:block" />
          </div>
        </div>

        {/* Add Filter Controls */}
        {experimentalFeaturesEnabled.value && (
          <div class="flex-1 max-w-xl mx-4 flex items-center gap-2">
            <div class="relative flex-1">
              <input
                type="text"
                value={filterSignal.value.searchQuery}
                onInput={handleSearchChange}
                placeholder="Search tasks..."
                class="w-full h-9 px-3 text-sm bg-white/70 dark:bg-gray-800/70 border border-gray-200/30 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:text-white"
              />
              {filterSignal.value.searchQuery && (
                <button
                  onClick={() => {
                    filterSignal.value = {
                      ...filterSignal.value,
                      searchQuery: "",
                    };
                  }}
                  class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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
              )}
            </div>

            <div class="relative" ref={labelDropdownRef}>
              <button
                onClick={() =>
                  showLabelDropdown.value = !showLabelDropdown.value}
                class="h-9 px-3 text-sm bg-white/70 dark:bg-gray-800/70 border border-gray-200/30 dark:border-gray-700/30 rounded-lg hover:bg-white/90 dark:hover:bg-gray-800/90 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:text-white flex items-center gap-2"
              >
                <span>Labels</span>
                {filterSignal.value.selectedLabels.length > 0 && (
                  <span class="text-xs bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">
                    {filterSignal.value.selectedLabels.length}
                  </span>
                )}
              </button>

              {showLabelDropdown.value && (
                <div class="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200/30 dark:border-gray-700/30 z-50">
                  <div class="p-2 space-y-1">
                    {labelsSignal.value.map((label: Label) => (
                      <div
                        key={label.id}
                        onClick={() => toggleLabel(label.id)}
                        class={`
                          flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer
                          ${
                          filterSignal.value.selectedLabels.includes(label.id)
                            ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                            : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                        }
                        `}
                      >
                        <div class={`w-3 h-3 rounded-full ${label.color}`} />
                        <span>{label.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {(filterSignal.value.searchQuery ||
              filterSignal.value.selectedLabels.length > 0) && (
              <button
                onClick={clearAllFilters}
                class="h-9 px-3 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                Clear
              </button>
            )}
          </div>
        )}

        <div class="flex items-center gap-4">
          <HeaderControls onCardEdit={cardEditSignal.value} />
          <DarkModeToggle />
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
