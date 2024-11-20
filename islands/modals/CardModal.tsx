import { JSX } from "preact";
import { useEffect, useState } from "preact/hooks";
import GitHubTab from "../GitHubTab.tsx";
import ContextTab from "../ContextTab.tsx";

import {
  Card,
  CardModalProps,
  ChecklistItem,
  GitHubData,
} from "../../core/types/ICardModal.ts";

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
  const [activeTab, setActiveTab] = useState<"task" | "context" | "github">(
    "task",
  );
  const [isShaking, setIsShaking] = useState(false);
  const [githubData, setGithubData] = useState<GitHubData>({
    repo: "",
    assignees: [],
    cachedContributors: [],
  });
  const [meetings, setMeetings] = useState([]);
  const [relatedItems, setRelatedItems] = useState([]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setSelectedLabels([]);
    setDueDate("");
    setEstimatedHours("");
    setEstimatedMinutes("");
    setChecklist([]);
    setNewChecklistItem("");
    setGithubData({
      repo: "",
      assignees: [],
      cachedContributors: [],
    });
    setMeetings([]);
    setRelatedItems([]);
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
      return;
    }

    if (card) {
      setTitle(card.title || "");
      setDescription(card.description || "");
      setSelectedLabels(card.labels || []);
      setDueDate(card.dueDate || "");
      setChecklist(card.checklist || []);
      setMeetings(card.meetings || []);
      setRelatedItems(card.relatedItems || []);
      setGithubData(
        card.github || {
          repo: "",
          assignees: [],
          cachedContributors: [],
        },
      );

      if (card.estimatedTime) {
        const hours = Math.floor(card.estimatedTime / 60);
        const minutes = card.estimatedTime % 60;
        setEstimatedHours(hours.toString());
        setEstimatedMinutes(minutes.toString());
      }
    }
  }, [isOpen, card]);

  useEffect(() => {
    // Scroll to the bottom of checklist when new item is added
    if (checklistRef) {
      checklistRef.scrollTop = checklistRef.scrollHeight;
    }
  }, [checklist.length]);

  const toggleLabel = (labelId: string) => {
    setSelectedLabels((prev) =>
      prev.includes(labelId)
        ? prev.filter((id) => id !== labelId)
        : [...prev, labelId]
    );
  };

  const addChecklistItem = (
    e?: JSX.TargetedEvent<HTMLInputElement | HTMLButtonElement, Event>,
  ) => {
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
        item.id === itemId ? { ...item, isChecked: !item.isChecked } : item
      ),
    );
  };

  const removeChecklistItem = (itemId: string) => {
    setChecklist(checklist.filter((item) => item.id !== itemId));
  };

  const handleSubmit = (e: JSX.TargetedEvent<HTMLFormElement>) => {
    e.preventDefault();

    const estimatedTime = estimatedHours || estimatedMinutes
      ? parseInt(estimatedHours || "0") * 60 + parseInt(estimatedMinutes || "0")
      : undefined;

    const updatedCard: Card = {
      ...(card?.id ? { id: card.id } : {}),
      title,
      description,
      labels: selectedLabels,
      dueDate: dueDate || undefined,
      estimatedTime,
      timeSpent: card?.timeSpent || 0,
      checklist,
      meetings,
      relatedItems,
      ...(githubData.repo ? { github: githubData } : {}),
    };

    onSubmit(updatedCard);
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleBackdropClick = (e: JSX.TargetedMouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setIsShaking(true);
      setTimeout(() => {
        setIsShaking(false);
      }, 500); // Reset after animation
    }
  };

  if (!isOpen) return null;

  return (
    <div
      class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start sm:items-center justify-center p-2 z-50 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div
        class={`w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 my-2 flex flex-col transition-all duration-300 ${
          isShaking ? "animate-shake" : ""
        }`}
      >
        <form
          onSubmit={handleSubmit}
          class="flex flex-col h-full"
        >
          {/* Header */}
          <div class="p-6 flex justify-between items-start gap-3 border-b border-gray-100 dark:border-gray-700">
            <div class="flex-1">
              <input
                type="text"
                required
                value={title}
                onInput={(e) => setTitle(e.currentTarget.value)}
                class="w-full text-xl font-semibold bg-transparent border-0 p-0 focus:outline-none focus:ring-0 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="Task title"
              />
            </div>
            <button
              type="button"
              onClick={onClose}
              class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg
                class="w-5 h-5"
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

          {/* Tabs */}
          <div class="px-6 border-b border-gray-100 dark:border-gray-700">
            <div class="flex gap-6">
              <button
                type="button"
                onClick={() => setActiveTab("task")}
                class={`py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
                  activeTab === "task"
                    ? "border-blue-500 text-blue-500"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Task Details
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("context")}
                class={`py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
                  activeTab === "context"
                    ? "border-blue-500 text-blue-500"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Context
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("github")}
                class={`py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
                  activeTab === "github"
                    ? "border-blue-500 text-blue-500"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                GitHub
              </button>
            </div>
          </div>

          {/* Content */}
          <div class="flex-1 overflow-y-auto flex min-h-[400px]">
            {/* Main Content */}
            <div class="flex-1 p-6">
              {activeTab === "task"
                ? (
                  <div class="space-y-6">
                    {/* Description */}
                    <div>
                      <label class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Description
                      </label>
                      <textarea
                        value={description}
                        onInput={(e) => setDescription(e.currentTarget.value)}
                        class="w-full h-32 text-sm bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white resize-none transition-all duration-200"
                        placeholder="Describe your task..."
                      />
                    </div>

                    {/* Checklist */}
                    <div>
                      <label class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Checklist
                      </label>
                      <div
                        class="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent"
                        ref={setChecklistRef}
                      >
                        {checklist.map((item) => (
                          <div
                            key={item.id}
                            class="flex items-start gap-3 group p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                          >
                            <button
                              type="button"
                              onClick={() => toggleChecklistItem(item.id)}
                              class={`mt-0.5 w-5 h-5 rounded-md border-2 transition-all duration-200 flex-shrink-0 ${
                                item.isChecked
                                  ? "bg-blue-500 border-blue-500"
                                  : "border-gray-300 dark:border-gray-500 hover:border-blue-500"
                              }`}
                            >
                              {item.isChecked && (
                                <svg
                                  class="w-4 h-4 text-white"
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
                              )}
                            </button>
                            <span
                              class={`flex-1 text-sm transition-all duration-200 ${
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
                              class="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all duration-200"
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
                        ))}
                      </div>
                      <div class="mt-3 flex gap-2">
                        <input
                          type="text"
                          value={newChecklistItem}
                          onInput={(e) =>
                            setNewChecklistItem(e.currentTarget.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addChecklistItem();
                            }
                          }}
                          class="flex-1 text-sm bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all duration-200"
                          placeholder="Add new item..."
                        />
                        <button
                          type="button"
                          onClick={addChecklistItem}
                          class="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-xl transition-all duration-200 hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                )
                : activeTab === "context"
                ? (
                  <ContextTab
                    meetings={meetings}
                    relatedItems={relatedItems}
                    onMeetingsChange={setMeetings}
                    onRelatedItemsChange={setRelatedItems}
                  />
                )
                : (
                  <GitHubTab
                    description={description}
                    selectedLabels={selectedLabels}
                    title={title}
                    checklist={checklist}
                    initialData={githubData}
                    onGithubDataChange={setGithubData}
                  />
                )}
            </div>

            {/* Sidebar */}
            <div class="w-72 p-6 bg-gray-50 dark:bg-gray-800/50 border-l border-gray-100 dark:border-gray-700">
              {/* Labels */}
              <div class="mb-6">
                <label class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Labels
                </label>
                <div class="flex flex-wrap gap-2">
                  {labels.map((label) => (
                    <button
                      key={label.id}
                      type="button"
                      onClick={() => toggleLabel(label.id)}
                      class={`${label.color} text-white text-xs px-3 py-1.5 rounded-full transition-all duration-200 hover:shadow-md transform hover:scale-[1.05] ${
                        selectedLabels.includes(label.id)
                          ? "opacity-100"
                          : "opacity-40"
                      }`}
                    >
                      {label.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Due Date */}
              <div class="mb-6">
                <label class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onInput={(e) => setDueDate(e.currentTarget.value)}
                  class="w-full text-sm bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all duration-200"
                />
              </div>

              {/* Estimated Time */}
              <div>
                <label class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Estimated Time
                </label>
                <div class="flex gap-3">
                  <div class="flex-1">
                    <input
                      type="number"
                      min="0"
                      value={estimatedHours}
                      onInput={(e) => setEstimatedHours(e.currentTarget.value)}
                      class="w-full text-sm bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all duration-200"
                      placeholder="Hours"
                    />
                  </div>
                  <div class="flex-1">
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={estimatedMinutes}
                      onInput={(e) =>
                        setEstimatedMinutes(e.currentTarget.value)}
                      class="w-full text-sm bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all duration-200"
                      placeholder="Minutes"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div class="p-6 flex justify-end border-t border-gray-100 dark:border-gray-700">
            <button
              type="submit"
              class="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl text-sm hover:from-blue-600 hover:to-blue-700 transition-all duration-200 hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {mode === "add" ? "Add Task" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
