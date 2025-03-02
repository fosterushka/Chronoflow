import { JSX } from "preact";
import { useEffect, useMemo, useState } from "preact/hooks";
import GitHubTab from "../GitHubTab.tsx";
import ContextTab from "../ContextTab.tsx";
import AuditTab from "../AuditTab.tsx";
import { createAuditEntry } from "../../core/utils/auditUtils.ts";
import {
  Card,
  CardModalProps,
  ChecklistItem,
  GitHubData,
  Meeting,
  RelatedItem,
  TabType,
} from "../../core/types/ICardModal.ts";

export default function CardModal({
  isOpen,
  onClose,
  onSubmit,
  labels,
  card,
  mode,
}: CardModalProps): JSX.Element | null {
  const [cardData, setCardData] = useState<Partial<Card>>({
    title: "",
    description: "",
    labels: [],
    checklist: [],
    meetings: [],
    relatedItems: [],
    github: {
      repo: "",
      assignees: [],
      cachedContributors: [],
    },
  });

  const [activeTab, setActiveTab] = useState<TabType>("task");
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [newChecklistItem, setNewChecklistItem] = useState<string>("");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemText, setEditingItemText] = useState("");
  const [estimatedHours, setEstimatedHours] = useState<string>("");
  const [estimatedMinutes, setEstimatedMinutes] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");

  const estimatedTime = useMemo(() => {
    return {
      hours: parseInt(estimatedHours) || 0,
      minutes: parseInt(estimatedMinutes) || 0,
    };
  }, [estimatedHours, estimatedMinutes]);

  const formattedDueDate = useMemo(() => {
    if (!dueDate) return "";
    const date = new Date(dueDate);
    date.setHours(23, 59, 59);
    return date.toISOString();
  }, [dueDate]);

  const resetForm = () => {
    setCardData({
      title: "",
      description: "",
      labels: [],
      checklist: [],
      meetings: [],
      relatedItems: [],
      github: {
        repo: "",
        assignees: [],
        cachedContributors: [],
      },
    });
    setEstimatedHours("");
    setEstimatedMinutes("");
    setDueDate("");
    setNewChecklistItem("");
    setEditingItemId(null);
    setEditingItemText("");
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
      return;
    }

    if (card) {
      setCardData({
        title: card.title || "",
        description: card.description || "",
        labels: card.labels || [],
        checklist: card.checklist || [],
        meetings: card.meetings || [],
        relatedItems: card.relatedItems || [],
        github: card.github || {
          repo: "",
          assignees: [],
          cachedContributors: [],
        },
      });

      setDueDate(
        card.dueDate ? new Date(card.dueDate).toISOString().split("T")[0] : "",
      );

      if (card.estimatedTime) {
        const hours = Math.floor(card.estimatedTime / 60);
        const minutes = card.estimatedTime % 60;
        setEstimatedHours(hours.toString());
        setEstimatedMinutes(minutes.toString());
      }
    }
  }, [isOpen, card]);

  const handleTitleChange = (e: JSX.TargetedEvent<HTMLInputElement>): void => {
    setCardData((prev) => ({ ...prev, title: e.currentTarget.value }));
  };

  const handleDescriptionChange = (
    e: JSX.TargetedEvent<HTMLTextAreaElement>,
  ): void => {
    setCardData((prev) => ({ ...prev, description: e.currentTarget.value }));
  };

  const handleChecklistInput = (
    e: JSX.TargetedEvent<HTMLInputElement>,
  ): void => {
    const value = e.currentTarget.value;
    setNewChecklistItem(value);
  };

  const handleAddChecklistItem = (): void => {
    if (!newChecklistItem.trim()) return;

    const newItem: ChecklistItem = {
      id: crypto.randomUUID(),
      text: newChecklistItem.trim(),
      isChecked: false,
      createdAt: new Date().toISOString(),
    };

    setCardData((prevData) => {
      const updatedChecklist = [...(prevData.checklist || []), newItem];
      return {
        ...prevData,
        checklist: updatedChecklist,
      };
    });
    setNewChecklistItem("");
  };

  const handleChecklistItemToggle = (id: string): void => {
    setCardData((prev) => ({
      ...prev,
      checklist: (prev.checklist || []).map((item) =>
        item.id === id ? { ...item, isChecked: !item.isChecked } : item
      ),
    }));
  };

  const handleChecklistItemDelete = (id: string): void => {
    setCardData((prev) => ({
      ...prev,
      checklist: (prev.checklist || []).filter((item) => item.id !== id),
    }));
  };

  const handleChecklistItemEdit = (id: string, text: string): void => {
    setEditingItemId(id);
    setEditingItemText(text);
  };

  const handleSaveChecklistItemEdit = (): void => {
    if (!editingItemId || !editingItemText.trim()) {
      setEditingItemId(null);
      setEditingItemText("");
      return;
    }

    setCardData((prevData) => {
      const updatedChecklist = prevData.checklist?.map((item) =>
        item.id === editingItemId
          ? { ...item, text: editingItemText.trim() }
          : item
      ) || [];

      return {
        ...prevData,
        checklist: updatedChecklist,
      };
    });

    setEditingItemId(null);
    setEditingItemText("");
  };

  const handleCancelChecklistItemEdit = (): void => {
    setEditingItemId(null);
    setEditingItemText("");
  };

  const handleLabelToggle = (label: string): void => {
    setCardData((prev) => ({
      ...prev,
      labels: prev.labels?.includes(label)
        ? prev.labels.filter((l) => l !== label)
        : [...(prev.labels || []), label],
    }));
  };

  const handleGithubDataChange = (data: GitHubData): void => {
    setCardData((prev) => ({ ...prev, github: data }));
  };

  const handleMeetingsChange = (meetings: Meeting[]): void => {
    setCardData((prev) => ({ ...prev, meetings }));
  };

  const handleRelatedItemsChange = (items: RelatedItem[]): void => {
    setCardData((prev) => ({ ...prev, relatedItems: items }));
  };

  const handleSubmit = () => {
    if (!cardData.title?.trim()) {
      setIsShaking(true);
      return;
    }

    const updatedCard: Card = {
      id: card?.id || crypto.randomUUID(),
      title: cardData.title.trim(),
      description: cardData.description?.trim() || "",
      labels: cardData.labels || [],
      dueDate: dueDate ? formattedDueDate : undefined,
      estimatedTime: estimatedTime.hours * 60 + estimatedTime.minutes,
      checklist: cardData.checklist || [],
      meetings: cardData.meetings || [],
      relatedItems: cardData.relatedItems || [],
      github: cardData.github,
      auditHistory: card?.auditHistory || [],
      createdAt: card?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    if (mode === "add") {
      createAuditEntry("create", {
        newValue: updatedCard.title,
      });
    } else {
      if (JSON.stringify(card) !== JSON.stringify(updatedCard)) {
        createAuditEntry("update", {
          oldValue: card?.title ?? "",
          newValue: updatedCard.title,
        });
      }
    }

    onSubmit(updatedCard);
    onClose();
  };

  const handleClose = (): void => {
    resetForm();
    onClose();
  };

  const handleBackdropClick = (
    e: JSX.TargetedMouseEvent<HTMLDivElement>,
  ): void => {
    if (e.target === e.currentTarget) {
      setIsShaking(true);
      setTimeout(() => {
        setIsShaking(false);
      }, 500);
    }
  };

  const renderChecklist = () => {
    return (
      <div class="space-y-4">
        <div class="text-sm font-medium dark:text-gray-200">Checklist</div>
        <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
          {(cardData.checklist || []).map((item) => (
            <div
              key={item.id}
              class="group flex items-center gap-2 bg-white/50 dark:bg-gray-700/50 p-2 rounded-xl"
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

              {editingItemId === item.id
                ? (
                  <div class="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={editingItemText}
                      onInput={(e) => setEditingItemText(e.currentTarget.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleSaveChecklistItemEdit();
                        } else if (e.key === "Escape") {
                          handleCancelChecklistItemEdit();
                        }
                      }}
                      class="flex-1 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all duration-200"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleSaveChecklistItemEdit}
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
                      onClick={handleCancelChecklistItemEdit}
                      class="p-1 text-gray-400 hover:text-gray-500"
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
                )
                : (
                  <span
                    class={`flex-1 text-sm transition-all duration-200 ${
                      item.isChecked
                        ? "line-through text-gray-400 dark:text-gray-500"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                    onDblClick={() =>
                      handleChecklistItemEdit(item.id, item.text)}
                  >
                    {item.text}
                  </span>
                )}

              {editingItemId !== item.id && (
                <div class="flex gap-1">
                  <button
                    type="button"
                    onClick={() => handleChecklistItemEdit(item.id, item.text)}
                    class="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-500 transition-all duration-200"
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
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
              )}
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
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "task":
        return (
          <div class="space-y-5 p-4">
            {/* Title Input */}
            <div>
              <div class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title
              </div>
              <input
                id="title-input"
                type="text"
                value={cardData.title}
                onInput={handleTitleChange}
                placeholder="Task title"
                class="w-full dark:text-gray-300 py-2 px-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Description Textarea */}
            <div>
              <div class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </div>
              <textarea
                id="description-textarea"
                value={cardData.description}
                onInput={handleDescriptionChange}
                class="w-full dark:text-gray-300 h-32 py-2 px-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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
            description={cardData.description || ""}
            selectedLabels={cardData.labels || []}
            title={cardData.title || ""}
            checklist={cardData.checklist as ChecklistItem[] || []}
            initialData={cardData.github}
            onGithubDataChange={handleGithubDataChange}
          />
        );
      case "context":
        return (
          <ContextTab
            meetings={cardData.meetings as Meeting[] || []}
            relatedItems={cardData.relatedItems as RelatedItem[] || []}
            onMeetingsChange={handleMeetingsChange}
            onRelatedItemsChange={handleRelatedItemsChange}
          />
        );
      case "audit":
        return <AuditTab auditHistory={card?.auditHistory} />;
      default:
        return null;
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
          onSubmit={(_e) => handleSubmit()}
          class="flex flex-col h-full"
        >
          {/* Header */}
          <div class="p-6 flex justify-between items-start gap-3 border-b border-gray-100 dark:border-gray-700">
            <div class="flex-1">
              <input
                id="title-input"
                type="text"
                required
                value={cardData.title}
                onInput={handleTitleChange}
                class="w-full text-x font-semibold bg-transparent border-0 p-0 focus:outline-none focus:ring-0 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
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
              {renderTabContent()}
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
                        (cardData.labels || []).includes(label.id)
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
