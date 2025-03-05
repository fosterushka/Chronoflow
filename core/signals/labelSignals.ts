import { signal } from "@preact/signals";
import { Label } from "../types/shared.ts";

// Default labels
const DEFAULT_LABELS: Label[] = [
  { id: "bug", name: "Bug", color: "bg-red-500" },
  { id: "feature", name: "Feature", color: "bg-blue-500" },
  { id: "enhancement", name: "Enhancement", color: "bg-green-500" },
  { id: "documentation", name: "Documentation", color: "bg-purple-500" },
  { id: "design", name: "Design", color: "bg-yellow-500" },
  { id: "refactor", name: "Refactor", color: "bg-orange-500" },
];

export const labelsSignal = signal<Label[]>(
  typeof localStorage !== "undefined" &&
    localStorage.getItem("chronoflowLabels")
    ? JSON.parse(localStorage.getItem("chronoflowLabels") || "[]")
    : DEFAULT_LABELS,
);

export function saveLabels() {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(
      "chronoflowLabels",
      JSON.stringify(labelsSignal.value),
    );
  }
}

export function addLabel(label: Label) {
  labelsSignal.value = [...labelsSignal.value, label];
  saveLabels();
}

export const updateLabel = (updatedLabel: Label) => {
  labelsSignal.value = labelsSignal.value.map((label) =>
    label.id === updatedLabel.id ? updatedLabel : label
  );
  saveLabels();
};

export function deleteLabel(labelId: string) {
  labelsSignal.value = labelsSignal.value.filter((label) =>
    label.id !== labelId
  );
  saveLabels();
}
