import { signal } from "@preact/signals";

export interface FilterState {
  searchQuery: string;
  selectedLabels: string[];
}

export const filterSignal = signal<FilterState>({
  searchQuery: "",
  selectedLabels: [],
});

export const clearFilters = () => {
  filterSignal.value = {
    searchQuery: "",
    selectedLabels: [],
  };
};
