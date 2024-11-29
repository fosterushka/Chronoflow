import { JSX } from "preact";
import { useCallback, useEffect, useMemo, useState } from "preact/hooks";
import GitHubTab from "../GitHubTab.tsx";
import ContextTab from "../ContextTab.tsx";
import AuditTab from "../AuditTab.tsx";
import { createAuditEntry } from "../../core/utils/auditUtils.ts";

import {
  Card,
  CardModalProps,
  ChecklistItem,
  GitHubData,
  TabType,
} from "../../core/types/ICardModal.ts";

//TODO: First, let's move the ChecklistItem interface outside the component
interface ChecklistItem {
  id: string;
  text: string;
  isChecked: boolean;
  createdAt: string;
}

interface ChecklistState {
  items: ChecklistItem[];
  newItemText: string;
  isEditing: string | null;
}

export default function CardModal({
  isOpen,
  onClose,
  onSubmit,
  labels,
  card,
  mode,
}: CardModalProps): JSX.Element {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState<string>("");
  const [estimatedHours, setEstimatedHours] = useState<string>("");
  const [estimatedMinutes, setEstimatedMinutes] = useState<string>("");
  const [githubData, setGithubData] = useState<GitHubData>({
    repo: "",
    assignees: [],
    cachedContributors: [],
  });
  const [meetings, setMeetings] = useState<any[]>([]);
  const [relatedItems, setRelatedItems] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("task");
  const [isShaking, setIsShaking] = useState<boolean>(false);

  // Remove the checklistState and replace with direct state management
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>(
    card?.checklist || [],
  );
  const [newChecklistItem, setNewChecklistItem] = useState<string>("");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  //TODO: Memoize computed values
  const estimatedTime: EstimatedTime = useMemo(() => {
    return {
      hours: parseInt(estimatedHours) || 0,
      minutes: parseInt(estimatedMinutes) || 0,
    };
  }, [estimatedHours, estimatedMinutes]);

  const formattedDueDate = useMemo(() => {
    if (!dueDate) return "";
    const date = new Date(dueDate);
    date.setHours(23, 59, 59); // Set to end of day
    return date.toISOString();
  }, [dueDate]);

  //TODO: Optimized handlers with useCallback
  const handleTitleChange = useCallback(
    (e: JSX.TargetedEvent<HTMLInputElement>): void => {
      setTitle(e.currentTarget.value);
    },
    [],
  );

  const handleDescriptionChange = useCallback(
    (e: JSX.TargetedEvent<HTMLTextAreaElement>): void => {
      setDescription(e.currentTarget.value);
    },
    [],
  );

  // Update the handlers to use the new state management
  const handleChecklistInput = useCallback(
    (e: JSX.TargetedEvent<HTMLInputElement>): void => {
      setNewChecklistItem(e.currentTarget.value);
    },
    [],
  );

  const handleAddChecklistItem = useCallback((): void => {
    if (!newChecklistItem.trim()) return;

    const newItem: ChecklistItem = {
      id: crypto.randomUUID(),
      text: newChecklistItem.trim(),
      isChecked: false,
      createdAt: new Date().toISOString(),
    };

    setChecklistItems((prev) => [...prev, newItem]);
    setNewChecklistItem(""); // Clear input after adding
  }, [newChecklistItem]);

  const handleChecklistItemToggle = useCallback((id: string): void => {
    setChecklistItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isChecked: !item.isChecked } : item
      )
    );
  }, []);

  const handleChecklistItemDelete = useCallback((id: string): void => {
    setChecklistItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleLabelToggle = useCallback((label: string): void => {
    setSelectedLabels((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  }, []);

  //TODO: Reset form with proper typing
  const resetForm = useCallback((): void => {
    setTitle("");
    setDescription("");
    setSelectedLabels([]);
    setDueDate("");
    setEstimatedHours("");
    setEstimatedMinutes("");
    setChecklistItems([]);
    setNewChecklistItem("");
    setEditingItemId(null);
    setGithubData({
      repo: "",
      assignees: [],
      cachedContributors: [],
    });
    setMeetings([]);
    setRelatedItems([]);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
      return;
    }

    if (card) {
      setTitle(card.title || "");
      setDescription(card.description || "");
      setSelectedLabels(card.labels || []);
      // Format the incoming due date to YYYY-MM-DD for the date input
      setDueDate(
        card.dueDate ? new Date(card.dueDate).toISOString().split("T")[0] : "",
      );
      setChecklistItems(card.checklist || []);
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

  const handleSubmit = useCallback(() => {
    if (!title.trim()) {
      setIsShaking(true);
      return;
    }

    const updatedCard: Card = {
      id: card?.id || crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
      labels: selectedLabels,
      dueDate: dueDate ? formattedDueDate : undefined,
      estimatedTime: estimatedTime.hours * 60 + estimatedTime.minutes,
      checklist: checklistItems,
      meetings,
      relatedItems,
      github: githubData,
      createdAt: card?.createdAt || Date.now(),
      updatedAt: Date.now(),
      auditHistory: [...(card?.auditHistory || [])],
    };

    //TODO: Add audit entries for changes
    if (mode === "add") {
      updatedCard.auditHistory.push(createAuditEntry("create"));
    } else if (card) {
      if (card.title !== updatedCard.title) {
        updatedCard.auditHistory.push(createAuditEntry("update", {
          field: "title",
          oldValue: card.title,
          newValue: updatedCard.title,
        }));
      }
      if (card.description !== updatedCard.description) {
        updatedCard.auditHistory.push(createAuditEntry("update", {
          field: "description",
          oldValue: card.description,
          newValue: updatedCard.description,
        }));
      }
      if (JSON.stringify(card.labels) !== JSON.stringify(updatedCard.labels)) {
        updatedCard.auditHistory.push(createAuditEntry("update", {
          field: "labels",
          oldValue: card.labels,
          newValue: updatedCard.labels,
        }));
      }
      if (card.dueDate !== updatedCard.dueDate) {
        updatedCard.auditHistory.push(createAuditEntry("update", {
          field: "dueDate",
          oldValue: card.dueDate,
          newValue: updatedCard.dueDate,
        }));
      }
      if (card.estimatedTime !== updatedCard.estimatedTime) {
        updatedCard.auditHistory.push(createAuditEntry("update", {
          field: "estimatedTime",
          oldValue: card.estimatedTime,
          newValue: updatedCard.estimatedTime,
        }));
      }
    }

    onSubmit(updatedCard);
    onClose();
  }, [
    title,
    description,
    selectedLabels,
    dueDate,
    estimatedTime,
    checklistItems,
    meetings,
    relatedItems,
    githubData,
    card,
    mode,
    onSubmit,
    onClose,
  ]);

  const handleClose = useCallback((): void => {
    resetForm();
    onClose();
  }, [onClose]);

  const handleBackdropClick = useCallback(
    (e: JSX.TargetedMouseEvent<HTMLDivElement>): void => {
      if (e.target === e.currentTarget) {
        setIsShaking(true);
        setTimeout(() => {
          setIsShaking(false);
        }, 500); // Reset after animation
      }
    },
    [],
  );

  // Move the checklist JSX outside of renderTab
  const renderChecklist = () => (
    <div>
      <label class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
        Checklist
      </label>
      <div class="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {checklistItems.map((item) => (
          <div
            key={item.id}
            class="flex items-start gap-3 group p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
          >
            <button
              type="button"
              onClick={() => handleChecklistItemToggle(item.id)}
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
              onClick={() => handleChecklistItemDelete(item.id)}
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
          onInput={handleChecklistInput}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddChecklistItem();
            }
          }}
          class="flex-1 text-sm bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all duration-200"
          placeholder="Add new item..."
        />
        <button
          type="button"
          onClick={handleAddChecklistItem}
          disabled={!newChecklistItem.trim()}
          class="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-xl transition-all duration-200 hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add
        </button>
      </div>
    </div>
  );

  const renderTab = useCallback(() => {
    switch (activeTab) {
      case "task":
        return (
          <div class="space-y-6">
            {/* Description */}
            <div>
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Description
              </label>
              <textarea
                value={description}
                onInput={handleDescriptionChange}
                class="w-full h-32 text-sm bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white resize-none transition-all duration-200"
                placeholder="Describe your task..."
              />
            </div>

            {/* Checklist */}
            {renderChecklist()}
          </div>
        );
      case "github":
        return (
          <GitHubTab
            description={description}
            selectedLabels={selectedLabels}
            title={title}
            checklist={checklistItems}
            initialData={githubData}
            onGithubDataChange={setGithubData}
          />
        );
      case "context":
        return (
          <ContextTab
            meetings={meetings}
            relatedItems={relatedItems}
            onMeetingsChange={setMeetings}
            onRelatedItemsChange={setRelatedItems}
          />
        );
      case "audit":
        return <AuditTab auditHistory={card?.auditHistory} />;
      default:
        return null;
    }
  }, [activeTab, description, checklistItems, newChecklistItem]);

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
          onSubmit={(e) => handleSubmit()}
          class="flex flex-col h-full"
        >
          {/* Header */}
          <div class="p-6 flex justify-between items-start gap-3 border-b border-gray-100 dark:border-gray-700">
            <div class="flex-1">
              <input
                type="text"
                required
                value={title}
                onInput={handleTitleChange}
                class="w-full text-xl font-semibold bg-transparent border-0 p-0 focus:outline-none focus:ring-0 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="Task title"
              />
            </div>
            <button
              type="button"
              onClick={handleClose}
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
              <button
                type="button"
                onClick={() => setActiveTab("audit")}
                class={`py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
                  activeTab === "audit"
                    ? "border-blue-500 text-blue-500"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Audit
              </button>
            </div>
          </div>

          {/* Content */}
          <div class="flex-1 overflow-y-auto flex min-h-[400px]">
            {/* Main Content */}
            <div class="flex-1 p-6">
              {renderTab()}
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
                      onClick={() => handleLabelToggle(label.id)}
                      class={`${label.color} text-white text-xs px-3 py-1.5 rounded-full transition-all duration-200 ${
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
