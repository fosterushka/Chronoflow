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
  id?: string;
  title: string;
  description: string;
  labels: string[];
  dueDate?: string;
  estimatedTime?: number;
  timeSpent?: number;
  checklist: ChecklistItem[];
}

interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (card: Card) => void;
  labels: Label[];
  card?: Card | null;
  mode: 'add' | 'edit';
}

export default function CardModal(
  { isOpen, onClose, onSubmit, labels, card, mode }: CardModalProps,
) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState("");
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [checklistRef, setChecklistRef] = useState<HTMLDivElement | null>(null);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setSelectedLabels([]);
    setDueDate("");
    setEstimatedHours("");
    setEstimatedMinutes("");
    setChecklist([]);
    setNewChecklistItem("");
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
      return;
    }

    if (mode === 'edit' && card) {
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
  }, [card, mode, isOpen]);

  useEffect(() => {
    // Scroll to the bottom of checklist when new item is added
    if (checklistRef) {
      checklistRef.scrollTop = checklistRef.scrollHeight;
    }
  }, [checklist.length]);

  const handleSubmit = (e: JSX.TargetedEvent<HTMLFormElement>) => {
    e.preventDefault();
    const estimatedTime = estimatedHours || estimatedMinutes
      ? (parseInt(estimatedHours || "0") * 60) +
        parseInt(estimatedMinutes || "0")
      : undefined;

    const newCard: Card = {
      ...(mode === 'edit' && card ? card : {}),
      title,
      description,
      labels: selectedLabels,
      dueDate: dueDate || undefined,
      estimatedTime,
      checklist,
    };

    onSubmit(newCard);
    resetForm();
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const toggleLabel = (labelId: string) => {
    setSelectedLabels((prev) =>
      prev.includes(labelId)
        ? prev.filter((id) => id !== labelId)
        : [...prev, labelId]
    );
  };

  const addChecklistItem = (e?: JSX.TargetedEvent<HTMLInputElement | HTMLButtonElement, Event>) => {
    if (e) {
      e.preventDefault();
    }
    if (newChecklistItem.trim()) {
      setChecklist([
        ...checklist,
        {
          id: crypto.randomUUID(),
          text: newChecklistItem,
          isChecked: false,
        },
      ]);
      setNewChecklistItem("");
    }
  };

  const toggleChecklistItem = (itemId: string) => {
    setChecklist(
      checklist.map((item) =>
        item.id === itemId
          ? { ...item, isChecked: !item.isChecked }
          : item
      ),
    );
  };

  const removeChecklistItem = (itemId: string) => {
    setChecklist(checklist.filter((item) => item.id !== itemId));
  };

  if (!isOpen) return null;

  return (
    <div class="fixed inset-0 bg-black/70 flex items-start sm:items-center justify-center p-2 z-50 overflow-y-auto">
      <div class="w-full max-w-2xl bg-white/80 dark:bg-gray-800/90 backdrop-blur-lg rounded-xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 my-2 flex flex-col">
        <form
          onSubmit={handleSubmit}
          class="divide-y divide-gray-200/50 dark:divide-gray-700/50 flex flex-col"
        >
          {/* Header */}
          <div class="p-3 flex justify-between items-start gap-3">
            <div class="flex-1">
              <div class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Task Title
              </div>
              <input
                type="text"
                required
                value={title}
                onInput={(e) => setTitle(e.currentTarget.value)}
                class="w-full text-base font-medium bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
                placeholder="Enter task title"
              />
            </div>
            <button
              type="button"
              onClick={handleClose}
              class="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors flex-shrink-0"
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
          </div>

          {/* Content */}
          <div class="p-3 space-y-3 overflow-y-auto max-h-[calc(100vh-12rem)]">
            {/* Description */}
            <div>
              <div class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </div>
              <textarea
                value={description}
                onInput={(e) => setDescription(e.currentTarget.value)}
                class="w-full px-3 py-2 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white resize-none text-sm"
                rows={3}
                placeholder="Add task description..."
              />
            </div>

            {/* Time, Date and Labels Section */}
            <div class="space-y-3">
              {/* Time and Date */}
              <div class="grid grid-cols-3 gap-2">
                <div>
                  <div class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Due Date
                  </div>
                  <input
                    type="date"
                    value={dueDate}
                    onInput={(e) => setDueDate(e.currentTarget.value)}
                    class="w-full px-2 py-1.5 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white text-xs"
                  />
                </div>

                <div>
                  <div class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Estimated Time
                  </div>
                  <div class="flex gap-1">
                    <input
                      type="number"
                      min="0"
                      value={estimatedHours}
                      onInput={(e) => setEstimatedHours(e.currentTarget.value)}
                      class="w-14 px-1 py-1.5 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white text-xs text-center"
                      placeholder="H"
                    />
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={estimatedMinutes}
                      onInput={(e) => {
                        const value = parseInt(e.currentTarget.value);
                        if (value > 59) {
                          setEstimatedMinutes("59");
                        } else {
                          setEstimatedMinutes(e.currentTarget.value);
                        }
                      }}
                      class="w-12 px-1 py-1.5 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white text-xs text-center"
                      placeholder="M"
                    />
                  </div>
                </div>

                {/* Time Spent - Only show in edit mode */}
                {mode === 'edit' && card?.timeSpent !== undefined && (
                  <div>
                    <div class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Time Spent
                    </div>
                    <div class="px-2 py-1.5 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg text-xs text-gray-600 dark:text-gray-400 text-center">
                      {String(Math.floor(card.timeSpent / 3600)).padStart(2, "0")}:{String(Math.floor((card.timeSpent % 3600) / 60)).padStart(2, "0")}:{String(card.timeSpent % 60).padStart(2, "0")}
                    </div>
                  </div>
                )}
              </div>

              {/* Labels */}
              <div>
                <div class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Labels
                </div>
                <div class="flex flex-wrap gap-1.5">
                  {labels.map((label) => (
                    <button
                      type="button"
                      key={label.id}
                      onClick={() => toggleLabel(label.id)}
                      class={`px-2 py-1 rounded-lg text-xs transition-colors ${
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

            </div>

            {/* Checklist */}
            <div>
              <div class="flex items-center justify-between mb-2">
                <div class="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Checklist
                </div>
                {checklist.length > 0 && (
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    {checklist.filter((item) => item.isChecked).length}/
                    {checklist.length}
                  </div>
                )}
              </div>

              <div class="space-y-1.5 max-h-[150px] overflow-y-auto" ref={setChecklistRef}>
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    class="flex items-center gap-2 bg-white/50 dark:bg-gray-700/50 rounded-lg p-2"
                  >
                    <input
                      type="checkbox"
                      checked={item.isChecked}
                      onChange={() => toggleChecklistItem(item.id)}
                      class="rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500/50"
                    />
                    <span
                      class={`flex-1 text-xs ${
                        item.isChecked
                          ? "line-through text-gray-400 dark:text-gray-500"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {item.text}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeChecklistItem(item.id)}
                      class="p-1 text-gray-400 transition-colors"
                    >
                      <svg
                        class="w-3.5 h-3.5"
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
                ))}
              </div>

              <div class="mt-2 flex gap-2">
                <input
                  type="text"
                  value={newChecklistItem}
                  onInput={(e) => setNewChecklistItem(e.currentTarget.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addChecklistItem();
                    }
                  }}
                  placeholder="Add checklist item"
                  class="flex-1 px-3 py-1.5 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white text-xs"
                />
                <button
                  type="button"
                  onClick={addChecklistItem}
                  class="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs hover:bg-blue-600 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div class="p-3 flex justify-end">
            <button
              type="submit"
              class="px-4 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
            >
              {mode === 'add' ? 'Add Task' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
