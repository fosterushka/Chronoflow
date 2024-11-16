import { JSX } from "preact";
import { useEffect, useState } from "preact/hooks";

interface Label {
  id: string;
  name: string;
  color: string;
}

interface ChecklistItem {
  id: string;
  text: string;
  isChecked: boolean;
}

interface Card {
  id: string;
  title: string;
  description: string;
  labels: string[];
  dueDate?: string;
  estimatedTime?: number;
  timeSpent: number;
  checklist?: ChecklistItem[];
}

interface EditCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (card: Card) => void;
  labels: Label[];
  card: Card | null;
}

export default function EditCardModal(
  { isOpen, onClose, onSubmit, labels, card }: EditCardModalProps,
) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState("");
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newChecklistItem, setNewChecklistItem] = useState("");

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description);
      setSelectedLabels(card.labels);
      setDueDate(card.dueDate || "");
      if (card.estimatedTime) {
        setEstimatedHours(Math.floor(card.estimatedTime / 60).toString());
        setEstimatedMinutes((card.estimatedTime % 60).toString());
      } else {
        setEstimatedHours("");
        setEstimatedMinutes("");
      }
      setChecklist(card.checklist || []);
    }
  }, [card]);

  const handleSubmit = (e: JSX.TargetedEvent<HTMLFormElement>) => {
    e.preventDefault();
    const estimatedTime = (parseInt(estimatedHours || "0") * 60) +
      parseInt(estimatedMinutes || "0");

    onSubmit({
      ...card,
      title,
      description,
      labels: selectedLabels,
      dueDate: dueDate || undefined,
      estimatedTime: estimatedTime || undefined,
      checklist,
    });
  };

  const toggleLabel = (labelId: string) => {
    setSelectedLabels((prev) =>
      prev.includes(labelId)
        ? prev.filter((id) => id !== labelId)
        : [...prev, labelId]
    );
  };

  return (
    <div class="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div class="w-full max-w-2xl bg-white/80 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 min-h-[60vh] max-h-[80vh] flex flex-col">
        <form
          onSubmit={handleSubmit}
          class="divide-y divide-gray-200/50 dark:divide-gray-700/50 h-full flex flex-col"
        >
          {/* Header */}
          <div class="p-4 flex justify-between items-start gap-3">
            <div class="flex-1">
              <div class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Task Title
              </div>
              <input
                type="text"
                required
                value={title}
                onInput={(e) => setTitle(e.currentTarget.value)}
                class="w-full text-xl font-medium bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
                placeholder="Enter task title"
              />
            </div>
            <button
              type="button"
              onClick={onClose}
              class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors flex-shrink-0"
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
          </div>

          {/* Content */}
          <div class="p-4 space-y-4 overflow-y-auto flex-grow">
            {/* Description */}
            <div>
              <div class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </div>
              <textarea
                value={description}
                onInput={(e) => setDescription(e.currentTarget.value)}
                class="w-full px-3 py-2 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white resize-none text-sm"
                rows={3}
                placeholder="Add task description..."
              />
            </div>

            {/* Time, Date and Labels Section */}
            <div class="space-y-3">
              {/* Time and Date */}
              <div class="grid grid-cols-3 gap-3">
                <div>
                  <div class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Due Date
                  </div>
                  <input
                    type="date"
                    value={dueDate}
                    onInput={(e) => setDueDate(e.currentTarget.value)}
                    class="w-full px-3 py-1.5 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <div class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Estimated Time
                  </div>
                  <div class="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      value={estimatedHours}
                      onInput={(e) => setEstimatedHours(e.currentTarget.value)}
                      class="w-full px-2 py-1.5 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white text-sm"
                      placeholder="Hours"
                    />
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={estimatedMinutes}
                      onInput={(e) =>
                        setEstimatedMinutes(e.currentTarget.value)}
                      class="w-full px-2 py-1.5 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white text-sm"
                      placeholder="Min"
                    />
                  </div>
                </div>
                <div>
                  <div class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Time Spent
                  </div>
                  <div class="px-3 py-1.5 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-600 dark:text-gray-400">
                    {String(Math.floor(card.timeSpent / 3600)).padStart(
                      2,
                      "0",
                    )}h{" "}
                    {String(Math.floor((card.timeSpent % 3600) / 60)).padStart(
                      2,
                      "0",
                    )}m {String(card.timeSpent % 60).padStart(2, "0")}s
                  </div>
                </div>
              </div>

              {/* Labels */}
              <div class="flex flex-wrap gap-2">
                {labels.map((label) => (
                  <button
                    type="button"
                    key={label.id}
                    onClick={() => toggleLabel(label.id)}
                    class={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedLabels.includes(label.id)
                        ? `${label.color} text-white`
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {label.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Checklist */}
            <div>
              <div class="flex items-center justify-between mb-2">
                <div class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Checklist
                </div>
                {checklist.length > 0 && (
                  <span class="text-xs text-gray-500 dark:text-gray-400">
                    {checklist.filter((item) => item.isChecked)
                      .length}/{checklist.length}
                  </span>
                )}
              </div>

              {checklist.length > 0 && (
                <div class="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
                  <div
                    class="h-full bg-green-500 transition-all duration-300"
                    style={{
                      width: `${
                        (checklist.filter((item) => item.isChecked).length /
                          checklist.length) * 100
                      }%`,
                    }}
                  />
                </div>
              )}

              <div
                class="overflow-y-auto"
                style={{ maxHeight: "calc(80vh - 550px)" }}
              >
                <div class="space-y-2">
                  {checklist.map((item) => (
                    <div key={item.id} class="flex items-center gap-2 group">
                      <input
                        type="checkbox"
                        checked={item.isChecked}
                        onChange={() => {
                          setChecklist((prev) =>
                            prev.map((i) =>
                              i.id === item.id
                                ? { ...i, isChecked: !i.isChecked }
                                : i
                            )
                          );
                        }}
                        class="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={item.text}
                        onChange={(e) => {
                          setChecklist((prev) =>
                            prev.map((i) =>
                              i.id === item.id
                                ? { ...i, text: e.target.value }
                                : i
                            )
                          );
                        }}
                        class="flex-1 bg-transparent border-none focus:outline-none text-sm text-gray-700 dark:text-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setChecklist((prev) =>
                            prev.filter((i) => i.id !== item.id)
                          );
                        }}
                        class="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
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
                    </div>
                  ))}
                </div>
              </div>

              <div class="flex gap-2 mt-3">
                <input
                  type="text"
                  value={newChecklistItem}
                  onInput={(e) => setNewChecklistItem(e.currentTarget.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (newChecklistItem.trim()) {
                        setChecklist((prev) => [...prev, {
                          id: crypto.randomUUID(),
                          text: newChecklistItem.trim(),
                          isChecked: false,
                        }]);
                        setNewChecklistItem("");
                      }
                    }
                  }}
                  class="flex-1 px-3 py-2 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white text-sm"
                  placeholder="Add checklist item (press Enter)"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div class="p-4 flex justify-end gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              class="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-xl transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
