import { useEffect, useState } from "preact/hooks";
import { Label } from "../core/types/shared.ts";
import {
  addLabel,
  deleteLabel,
  labelsSignal,
  updateLabel,
} from "../core/signals/labelSignals.ts";

interface LabelManagerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLabels: string[];
  onLabelToggle: (labelId: string) => void;
}

const COLOR_OPTIONS = [
  { id: "bg-red-500", name: "Red" },
  { id: "bg-orange-500", name: "Orange" },
  { id: "bg-yellow-500", name: "Yellow" },
  { id: "bg-green-500", name: "Green" },
  { id: "bg-blue-500", name: "Blue" },
  { id: "bg-indigo-500", name: "Indigo" },
  { id: "bg-purple-500", name: "Purple" },
  { id: "bg-pink-500", name: "Pink" },
  { id: "bg-gray-500", name: "Gray" },
  { id: "bg-slate-500", name: "Slate" },
  { id: "bg-emerald-500", name: "Emerald" },
  { id: "bg-teal-500", name: "Teal" },
  { id: "bg-cyan-500", name: "Cyan" },
  { id: "bg-violet-500", name: "Violet" },
  { id: "bg-fuchsia-500", name: "Fuchsia" },
  { id: "bg-rose-500", name: "Rose" },
];

export default function LabelManager(
  { isOpen, onClose, selectedLabels, onLabelToggle }: LabelManagerProps,
) {
  const [labels, setLabels] = useState<Label[]>([]);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("bg-blue-500");
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [editingLabelName, setEditingLabelName] = useState("");
  const [editingLabelColor, setEditingLabelColor] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setLabels(labelsSignal.value);
  }, [labelsSignal.value]);

  const handleAddLabel = () => {
    if (!newLabelName.trim()) return;

    const newLabel: Label = {
      id: crypto.randomUUID(),
      name: newLabelName.trim(),
      color: newLabelColor,
    };

    addLabel(newLabel);
    setNewLabelName("");
  };

  const handleEditLabel = (label: Label) => {
    setEditingLabelId(label.id);
    setEditingLabelName(label.name);
    setEditingLabelColor(label.color);
  };

  const handleSaveEdit = () => {
    if (!editingLabelId || !editingLabelName.trim()) return;

    updateLabel({
      id: editingLabelId,
      name: editingLabelName.trim(),
      color: editingLabelColor,
    });

    setEditingLabelId(null);
    setEditingLabelName("");
    setEditingLabelColor("");
  };

  const handleCancelEdit = () => {
    setEditingLabelId(null);
    setEditingLabelName("");
    setEditingLabelColor("");
  };

  const handleDeleteLabel = (labelId: string) => {
    if (confirm("Are you sure you want to delete this label?")) {
      deleteLabel(labelId);
    }
  };

  const filteredLabels = searchQuery
    ? labels.filter((label) =>
      label.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : labels;

  if (!isOpen) return null;

  return (
    <div class="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 max-h-[400px] overflow-y-auto">
      <div class="mb-4">
        <input
          type="text"
          value={searchQuery}
          onInput={(e) => setSearchQuery(e.currentTarget.value)}
          placeholder="Search labels..."
          class="w-full text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all duration-200"
        />
      </div>

      <div class="mb-4">
        <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Labels
        </h3>
        <div class="space-y-2 max-h-[200px] overflow-y-auto">
          {filteredLabels.map((label) => (
            <div key={label.id} class="flex items-center justify-between gap-2">
              {editingLabelId === label.id
                ? (
                  <>
                    <div class="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={editingLabelName}
                        onInput={(e) =>
                          setEditingLabelName(e.currentTarget.value)}
                        class="flex-1 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all duration-200"
                      />
                      <select
                        value={editingLabelColor}
                        onChange={(e) =>
                          setEditingLabelColor(e.currentTarget.value)}
                        class="text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all duration-200"
                      >
                        {COLOR_OPTIONS.map((color) => (
                          <option key={color.id} value={color.id}>
                            {color.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div class="flex gap-1">
                      <button
                        type="button"
                        onClick={handleSaveEdit}
                        class="p-1 text-green-500 hover:text-green-600"
                      >
                        <svg
                          class="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        class="p-1 text-red-500 hover:text-red-600"
                      >
                        <svg
                          class="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
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
                  </>
                )
                : (
                  <>
                    <div class="flex items-center gap-2 flex-1">
                      <input
                        type="checkbox"
                        id={`label-${label.id}`}
                        checked={selectedLabels.includes(label.id)}
                        onChange={() => onLabelToggle(label.id)}
                        class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div class={`${label.color} w-4 h-4 rounded-full`}></div>
                      <label
                        for={`label-${label.id}`}
                        class="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                      >
                        {label.name}
                      </label>
                    </div>
                    <div class="flex gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          handleEditLabel(label)}
                        class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <svg
                          class="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteLabel(label.id)}
                        class="p-1 text-gray-400 hover:text-red-500"
                      >
                        <svg
                          class="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
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
                  </>
                )}
            </div>
          ))}
        </div>
      </div>

      <div class="pt-3 border-t border-gray-100 dark:border-gray-700">
        <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Create New Label
        </h3>
        <div class="flex gap-2">
          <input
            type="text"
            value={newLabelName}
            onInput={(e) => setNewLabelName(e.currentTarget.value)}
            placeholder="Label name"
            class="flex-1 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all duration-200"
          />
          <select
            value={newLabelColor}
            onChange={(e) => setNewLabelColor(e.currentTarget.value)}
            class="text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all duration-200"
          >
            {COLOR_OPTIONS.map((color) => (
              <option key={color.id} value={color.id}>{color.name}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleAddLabel}
            class="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-3 py-2 rounded-lg transition-all duration-200"
          >
            Add
          </button>
        </div>
      </div>

      <div class="mt-4 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          class="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200"
        >
          Close
        </button>
      </div>
    </div>
  );
}
