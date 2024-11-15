import { useState } from "preact/hooks";
import { JSX } from "preact";
import type { Label } from "../types/index.ts";

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (card: {
    title: string;
    description: string;
    labels: string[];
    dueDate?: string;
    estimatedTime?: number;
  }) => void;
  labels: Label[];
}

export default function AddCardModal({ isOpen, onClose, onSubmit, labels }: AddCardModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState("");

  const handleSubmit = (e: JSX.TargetedEvent<HTMLFormElement, Event>) => {
    e.preventDefault();

    const estimatedTime = estimatedHours || estimatedMinutes
      ? (parseInt(estimatedHours || "0") * 60) + parseInt(estimatedMinutes || "0")
      : undefined;

    onSubmit({
      title,
      description,
      labels: selectedLabels,
      dueDate: dueDate || undefined,
      estimatedTime,
    });

    // Reset form
    setTitle("");
    setDescription("");
    setSelectedLabels([]);
    setDueDate("");
    setEstimatedHours("");
    setEstimatedMinutes("");
  };

  const toggleLabel = (labelId: string) => {
    setSelectedLabels(prev =>
      prev.includes(labelId)
        ? prev.filter(id => id !== labelId)
        : [...prev, labelId]
    );
  };

  if (!isOpen) return null;

  return (
    <div class="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-gray-50/95 dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl">
        <h2 class="text-xl font-bold mb-4 text-gray-700 dark:text-white">Add New Card</h2>
        <form onSubmit={handleSubmit}>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                Title
              </label>
              <input
                type="text"
                value={title}
                onInput={(e) => setTitle((e.target as HTMLInputElement).value)}
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-gray-100/50 dark:bg-gray-700 text-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onInput={(e) => setDescription((e.target as HTMLTextAreaElement).value)}
                rows={3}
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-gray-100/50 dark:bg-gray-700 text-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                Labels
              </label>
              <div class="flex flex-wrap gap-2">
                {labels.map(label => (
                  <button
                    type="button"
                    key={label.id}
                    onClick={() => toggleLabel(label.id)}
                    class={`px-3 py-1 rounded-full text-sm ${
                      selectedLabels.includes(label.id)
                        ? `${label.color} text-white`
                        : `hover:bg-gray-200 dark:hover:bg-gray-600 ${
                            selectedLabels.includes(label.id)
                              ? "bg-gray-200 dark:bg-gray-600"
                              : "bg-gray-100 dark:bg-gray-700"
                          } text-gray-700 dark:text-gray-300`
                    }`}
                  >
                    {label.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onInput={(e) => setDueDate((e.target as HTMLInputElement).value)}
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-gray-100/50 dark:bg-gray-700 text-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                Estimated Time
              </label>
              <div class="flex gap-2">
                <div class="flex-1">
                  <input
                    type="number"
                    min="0"
                    placeholder="Hours"
                    value={estimatedHours}
                    onInput={(e) => setEstimatedHours((e.target as HTMLInputElement).value)}
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-gray-100/50 dark:bg-gray-700 text-gray-700 dark:text-white"
                  />
                </div>
                <div class="flex-1">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    placeholder="Minutes"
                    value={estimatedMinutes}
                    onInput={(e) => setEstimatedMinutes((e.target as HTMLInputElement).value)}
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-gray-100/50 dark:bg-gray-700 text-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div class="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={onClose}
                class="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-500/90 hover:bg-blue-600/90 rounded-lg transition-colors"
              >
                Add Card
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
