import { useSignal } from "@preact/signals";
import { filterSignal } from "../core/signals/filterSignals.ts";
import { labelsSignal } from "../core/signals/labelSignals.ts";
import { Label } from "../core/types/shared.ts";

export default function FilterBar() {
  const showLabelDropdown = useSignal(false);

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

  return (
    <div class="px-6 py-3 bg-white/50 dark:bg-gray-800/50 border-b border-gray-200/30 dark:border-gray-700/30">
      <div class="flex items-center gap-4">
        <div class="flex-1 relative">
          <input
            type="text"
            value={filterSignal.value.searchQuery}
            onInput={handleSearchChange}
            placeholder="Search tasks..."
            class="w-full px-4 py-2 bg-white/70 dark:bg-gray-800/70 border border-gray-200/30 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:text-white"
          />
          {filterSignal.value.searchQuery && (
            <button
              type="button"
              onClick={() => {
                filterSignal.value = {
                  ...filterSignal.value,
                  searchQuery: "",
                };
              }}
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg
                class="w-5 h-5"
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

        <div class="relative">
          <button
            type="button"
            onClick={() => showLabelDropdown.value = !showLabelDropdown.value}
            class="px-4 py-2 bg-white/70 dark:bg-gray-800/70 border border-gray-200/30 dark:border-gray-700/30 rounded-lg hover:bg-white/90 dark:hover:bg-gray-800/90 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:text-white flex items-center gap-2"
          >
            <span>Labels</span>
            <span class="text-xs bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">
              {filterSignal.value.selectedLabels.length}
            </span>
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
                        : "hover:bg-gray-100 dark:hover:bg-gray-700/50"
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
            type="button"
            onClick={clearAllFilters}
            class="px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            Clear filters
          </button>
        )}

        {/* Add experimental badge */}
        <div class="px-2 py-1 text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/20 rounded-full">
          Experimental
        </div>
      </div>
    </div>
  );
}
