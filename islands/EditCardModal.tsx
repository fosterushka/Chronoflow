import { JSX } from "preact";
import { useState, useEffect } from "preact/hooks";

interface Label {
  id: string;
  name: string;
  color: string;
}

interface Card {
  id: string;
  title: string;
  description: string;
  labels: string[];
  dueDate?: string;
  estimatedTime?: number;
  timeSpent: number;
}

interface EditCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (card: Card) => void;
  labels: Label[];
  card: Card | null;
}

export default function EditCardModal({ isOpen, onClose, onSubmit, labels, card }: EditCardModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState("");

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
    }
  }, [card]);

  if (!isOpen || !card) return null;

  const handleSubmit = (e: JSX.TargetedEvent<HTMLFormElement>) => {
    e.preventDefault();
    const estimatedTime = 
      (parseInt(estimatedHours || "0") * 60) + 
      parseInt(estimatedMinutes || "0");

    onSubmit({
      ...card,
      title,
      description,
      labels: selectedLabels,
      dueDate: dueDate || undefined,
      estimatedTime: estimatedTime || undefined,
    });
  };

  const toggleLabel = (labelId: string) => {
    setSelectedLabels(prev => 
      prev.includes(labelId)
        ? prev.filter(id => id !== labelId)
        : [...prev, labelId]
    );
  };

  return (
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">Edit Card</h2>
        <form onSubmit={handleSubmit}>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onInput={e => setTitle(e.currentTarget.value)}
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter card title"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onInput={e => setDescription(e.currentTarget.value)}
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                rows={3}
                placeholder="Enter card description"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                        ? label.color + " text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {label.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onInput={e => setDueDate(e.currentTarget.value)}
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Estimated Time
              </label>
              <div class="flex gap-2">
                <div class="flex-1">
                  <input
                    type="number"
                    min="0"
                    value={estimatedHours}
                    onInput={e => setEstimatedHours(e.currentTarget.value)}
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Hours"
                  />
                </div>
                <div class="flex-1">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={estimatedMinutes}
                    onInput={e => setEstimatedMinutes(e.currentTarget.value)}
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Minutes"
                  />
                </div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Time Spent
              </label>
              <div class="text-gray-600 dark:text-gray-400">
                {Math.floor(card.timeSpent / 3600)}h {Math.floor((card.timeSpent % 3600) / 60)}m {card.timeSpent % 60}s
              </div>
            </div>
          </div>

          <div class="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              class="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
