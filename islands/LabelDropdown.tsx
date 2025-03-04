import { useEffect, useRef, useState } from "preact/hooks";
import { Label } from "../core/types/shared.ts";
import {
  addLabel,
  labelsSignal,
  saveLabels,
  updateLabel,
} from "../core/signals/labelSignals.ts";

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
];

interface LabelDropdownProps {
  selectedLabels: string[];
  onLabelToggle: (labelId: string) => void;
}

export default function LabelDropdown(
  { selectedLabels, onLabelToggle }: LabelDropdownProps,
) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewLabel, setShowNewLabel] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState(COLOR_OPTIONS[4].id); // Default to blue
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [editingLabelName, setEditingLabelName] = useState("");
  const [editingLabelColor, setEditingLabelColor] = useState(
    COLOR_OPTIONS[4].id,
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleStartEdit = (label: Label) => {
    setEditingLabelId(label.id);
    setEditingLabelName(label.name);
    setEditingLabelColor(label.color);
  };

  const handleSaveEdit = () => {
    if (!editingLabelId || !editingLabelName.trim()) return;

    const updatedLabel: Label = {
      id: editingLabelId,
      name: editingLabelName.trim(),
      color: editingLabelColor,
    };

    updateLabel(updatedLabel);
    saveLabels();
    setEditingLabelId(null);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setShowNewLabel(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAddLabel = () => {
    if (!newLabelName.trim()) return;

    const newLabel: Label = {
      id: crypto.randomUUID(),
      name: newLabelName.trim(),
      color: newLabelColor,
    };

    addLabel(newLabel);
    saveLabels();
    setNewLabelName("");
    setNewLabelColor(COLOR_OPTIONS[4].id);
    setShowNewLabel(false);
  };

  const filteredLabels = searchQuery
    ? labelsSignal.value.filter((label) =>
      label.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : labelsSignal.value;

  const getSelectedLabelsPreview = () => {
    if (selectedLabels.length === 0) {
      return "None";
    }

    const selectedLabelObjects = labelsSignal.value.filter((label) =>
      selectedLabels.includes(label.id)
    );
    if (selectedLabelObjects.length <= 2) {
      return selectedLabelObjects.map((label) => label.name).join(", ");
    }

    return `${selectedLabelObjects[0].name}, ${
      selectedLabelObjects[1].name
    }, +${selectedLabels.length - 2} more`;
  };

  return (
    <div class="relative" ref={dropdownRef}>
      <div class="mb-2 flex justify-between items-center">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
          Labels
        </label>
        <div class="text-xs text-gray-500 dark:text-gray-400">
          {getSelectedLabelsPreview()}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        class="w-full flex items-center justify-between text-sm bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all duration-200"
      >
        <span>Select labels</span>
        <svg
          class={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? "transform rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div class="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 max-h-[300px] overflow-y-auto">
          <div class="p-2">
            <input
              type="text"
              value={searchQuery}
              onInput={(e) => setSearchQuery(e.currentTarget.value)}
              placeholder="Search labels..."
              class="w-full text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all duration-200"
            />
          </div>

          <div class="p-2 max-h-[200px] overflow-y-auto">
            {filteredLabels.length > 0
              ? (
                filteredLabels.map((label) => (
                  <div
                    key={label.id}
                    class="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
                  >
                    {editingLabelId === label.id
                      ? (
                        <div class="flex-1 flex items-center gap-2">
                          <input
                            type="text"
                            value={editingLabelName}
                            onInput={(e) =>
                              setEditingLabelName(e.currentTarget.value)}
                            class="flex-1 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                          />
                          <select
                            value={editingLabelColor}
                            onChange={(e) =>
                              setEditingLabelColor(e.currentTarget.value)}
                            class="text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                          >
                            {COLOR_OPTIONS.map((color) => (
                              <option key={color.id} value={color.id}>
                                {color.name}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={handleSaveEdit}
                            class="p-1 text-green-500 hover:text-green-600"
                          >
                            <svg
                              class="w-4 h-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fill-rule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clip-rule="evenodd"
                              />
                            </svg>
                          </button>
                        </div>
                      )
                      : (
                        <>
                          <label class="flex-1 flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedLabels.includes(label.id)}
                              onChange={() => onLabelToggle(label.id)}
                              class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div class={`${label.color} w-4 h-4 rounded-full`}>
                            </div>
                            <span class="text-sm text-gray-700 dark:text-gray-300">
                              {label.name}
                            </span>
                          </label>
                          <button
                            type="button"
                            onClick={() => handleStartEdit(label)}
                            class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <svg
                              class="w-4 h-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                        </>
                      )}
                  </div>
                ))
              )
              : (
                <div class="text-center py-2 text-sm text-gray-500 dark:text-gray-400">
                  No labels found
                </div>
              )}
          </div>

          <div class="p-2 border-t border-gray-100 dark:border-gray-700">
            {showNewLabel
              ? (
                <div class="space-y-2">
                  <input
                    type="text"
                    value={newLabelName}
                    onInput={(e) => setNewLabelName(e.currentTarget.value)}
                    placeholder="Label name"
                    class="w-full text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all duration-200"
                  />
                  <div class="flex gap-2 items-center">
                    <select
                      value={newLabelColor}
                      onChange={(e) => setNewLabelColor(e.currentTarget.value)}
                      class="text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all duration-200"
                    >
                      {COLOR_OPTIONS.map((color) => (
                        <option key={color.id} value={color.id}>
                          {color.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleAddLabel}
                      class="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )
              : (
                <button
                  type="button"
                  onClick={() => setShowNewLabel(true)}
                  class="w-full text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium py-1"
                >
                  + Create new label
                </button>
              )}
          </div>

          <div class="p-2 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <div class="text-xs text-gray-500 dark:text-gray-400">
              {selectedLabels.length} selected
            </div>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setShowNewLabel(false);
              }}
              class="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {selectedLabels.length > 0 && (
        <div class="mt-2 flex flex-wrap gap-1">
          {selectedLabels.map((labelId) => {
            const label = labelsSignal.value.find((l) => l.id === labelId);
            if (!label) return null;
            return (
              <span
                key={label.id}
                class={`${label.color} text-white text-xs px-2 py-1 rounded-full inline-flex items-center gap-1`}
              >
                {label.name}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLabelToggle(label.id);
                  }}
                  class="text-white/80 hover:text-white"
                >
                  <svg
                    class="w-3 h-3"
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
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
