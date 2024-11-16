import type { Column, Label } from "../types/index.ts";

export const BOARD_UPDATE_EVENT = "board-update";

export const dispatchBoardUpdate = (columns: Column[]) => {
  globalThis.dispatchEvent(
    new CustomEvent(BOARD_UPDATE_EVENT, { detail: { columns } }),
  );
};

export const LABELS: Label[] = [
  { id: "bug", name: "Bug", color: "bg-red-500" },
  { id: "feature", name: "Feature", color: "bg-blue-500" },
  { id: "enhancement", name: "Enhancement", color: "bg-green-500" },
  { id: "documentation", name: "Documentation", color: "bg-purple-500" },
  { id: "design", name: "Design", color: "bg-yellow-500" },
  { id: "refactor", name: "Refactor", color: "bg-orange-500" },
];

export const COLUMNS: Omit<Column, "cards">[] = [
  { id: "todo", title: "To Do" },
  { id: "inProgress", title: "In Progress" },
  { id: "codeReview", title: "Code Review" },
  { id: "testing", title: "Testing" },
  { id: "done", title: "Done" },
];

export function clearStorage(setColumns: (cols: Column[]) => void) {
  if (
    confirm("Are you sure you want to clear all data? This cannot be undone.")
  ) {
    const emptyColumns = COLUMNS.map((col) => ({ ...col, cards: [] }));
    localStorage.setItem("chronoflowColumns", JSON.stringify(emptyColumns));
    setColumns(emptyColumns);
    dispatchBoardUpdate(emptyColumns);
  }
}

export function exportData(columns: Column[]) {
  const data = JSON.stringify(columns, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `chronoflow-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importData(
  file: File | undefined,
  setColumns: (cols: Column[]) => void,
) {
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string;
      const data = JSON.parse(content);

      // Validate the data structure
      if (
        Array.isArray(data) &&
        data.every((col) =>
          col.id && col.title && Array.isArray(col.cards) &&
          col.cards.every((card: any) => card.id && card.title)
        )
      ) {
        // Initialize timeSpent and other missing properties
        const processedData = data.map((col: Column) => ({
          ...col,
          cards: col.cards.map((card) => ({
            ...card,
            timeSpent: card.timeSpent || 0,
            isTracking: false,
            lastTrackingStart: undefined,
            currentElapsedTime: 0,
          })),
        }));

        localStorage.setItem(
          "chronoflowColumns",
          JSON.stringify(processedData),
        );
        setColumns(processedData);
        dispatchBoardUpdate(processedData);
      } else {
        alert("Invalid file format");
      }
    } catch (error) {
      console.error("Error importing data:", error);
      alert("Error importing data. Please check the file format.");
    }
  };
  reader.readAsText(file);
}
