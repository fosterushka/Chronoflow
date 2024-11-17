import { JSX } from "preact";
import { useEffect, useState } from "preact/hooks";
import GitHubTab from "./GitHubTab.tsx";

import {
  Card,
  CardModalProps,
  ChecklistItem,
  GitHubData,
  Label,
} from "../types/ICardModal.ts";

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
  const [activeTab, setActiveTab] = useState<"task" | "github">("task");
  const [isShaking, setIsShaking] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const [githubData, setGithubData] = useState<GitHubData>({
    repo: "",
    assignees: [],
    cachedContributors: [],
  });

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
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
      return;
    }

    if (mode === "edit" && card) {
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

      // Set GitHub data from card
      if (card.github) {
        setGithubData(card.github);
      }
    }
  }, [isOpen, card, mode]);

  //TODO: move all hooks and fucntion to hooks.js and services or store.
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
      ? (parseInt(estimatedHours || "0") * 60) +
        parseInt(estimatedMinutes || "0")
      : undefined;

    const newCard: Card = {
      ...(mode === "edit" && card ? card : {}),
      title,
      description,
      labels: selectedLabels,
      dueDate: dueDate || undefined,
      estimatedTime,
      checklist,
      github: githubData.repo ? githubData : undefined,
    };

    onSubmit(newCard);
    resetForm();
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleBackdropClick = (e: JSX.TargetedMouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setIsShaking(true);
      setIsPinging(true);
      setTimeout(() => {
        setIsShaking(false);
        setIsPinging(false);
      }, 500); // Reset after animation
    }
  };

  if (!isOpen) return null;

  return (
    <div
      class="fixed inset-0 bg-black/70 flex items-start sm:items-center justify-center p-2 z-50 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div
        class={`w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 my-2 flex flex-col transition-transform ${
          isShaking ? "animate-shake" : ""
        }`}
      >
        <form
          onSubmit={handleSubmit}
          class="divide-y divide-gray-200 dark:divide-gray-700 flex flex-col"
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
                class="w-full text-base font-medium bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                placeholder="Enter task title"
              />
            </div>
            <button
              type="button"
              onClick={handleClose}
              class={`relative p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors flex-shrink-0 ${
                isPinging
                  ? 'after:content-[""] after:absolute after:inset-0 after:rounded-lg after:animate-ping-once after:bg-gray-400/30 dark:after:bg-gray-600/30'
                  : ""
              }`}
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

          {/* Tabs */}
          <div class="border-b border-gray-200 dark:border-gray-700">
            <div class="flex gap-4 px-4">
              <button
                type="button"
                onClick={() => setActiveTab("task")}
                class={`py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "task"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Task Details
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("github")}
                class={`py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "github"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                GitHub Issue
              </button>
            </div>
          </div>

          {/* Content */}
          <div class="flex-1 overflow-y-auto">
            {activeTab === "task"
              ? (
                // Task Details Tab
                <div class="p-4 space-y-4">
                  {/* Description */}
                  <div>
                    <div class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </div>
                    <textarea
                      value={description}
                      onInput={(e) => setDescription(e.currentTarget.value)}
                      class="w-full h-24 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white resize-none"
                      placeholder="Enter task description"
                    />
                  </div>

                  {/* Labels */}
                  <div>
                    <div class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Labels
                    </div>
                    <div class="flex flex-wrap gap-2">
                      {labels.map((label) => (
                        <button
                          key={label.id}
                          type="button"
                          onClick={() => toggleLabel(label.id)}
                          class={`${label.color} text-white text-xs px-3 py-1 rounded-full transition-opacity ${
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
                  <div>
                    <div class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Due Date
                    </div>
                    <input
                      type="date"
                      value={dueDate}
                      onInput={(e) => setDueDate(e.currentTarget.value)}
                      class="w-full text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                    />
                  </div>

                  {/* Estimated Time */}
                  <div>
                    <div class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Estimated Time
                    </div>
                    <div class="flex gap-2">
                      <div class="flex-1">
                        <input
                          type="number"
                          min="0"
                          value={estimatedHours}
                          onInput={(e) =>
                            setEstimatedHours(e.currentTarget.value)}
                          class="w-full text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
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
                          class="w-full text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                          placeholder="Minutes"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Checklist */}
                  <div>
                    <div class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Checklist
                    </div>
                    <div
                      class="space-y-2 max-h-28 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent"
                      ref={setChecklistRef}
                    >
                      {checklist.map((item) => (
                        <div
                          key={item.id}
                          class="flex items-start gap-2 group"
                        >
                          <button
                            type="button"
                            onClick={() => toggleChecklistItem(item.id)}
                            class={`mt-1 w-4 h-4 rounded border transition-colors flex-shrink-0 ${
                              item.isChecked
                                ? "bg-blue-500 border-blue-500"
                                : "border-gray-300 dark:border-gray-600"
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
                            class={`flex-1 text-sm ${
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
                            class="text-gray-400 hover:text-red-500"
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
                    <div class="mt-2 flex gap-2">
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
                        class="flex-1 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                        placeholder="Add checklist item"
                      />
                      <button
                        type="button"
                        onClick={() => addChecklistItem()}
                        class="px-3 py-1.5 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
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

          {/* Footer */}
          <div class="p-3 flex justify-end">
            <button
              type="submit"
              class="px-4 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
            >
              {mode === "add" ? "Add Task" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
