import { JSX } from "preact";
import { useEffect, useState } from "preact/hooks";

//TODO: move interfaces to types INamespace
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
  githubRepo?: string;
  githubAssignees?: string[];
}

interface GitHubContributor {
  login: string;
  avatar_url: string;
  contributions: number;
}

interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (card: Card) => void;
  labels: Label[];
  card?: Card | null;
  mode: "add" | "edit";
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
  const [githubRepo, setGithubRepo] = useState("");
  const [githubAssignees, setGithubAssignees] = useState<string[]>([]);
  const [contributors, setContributors] = useState<GitHubContributor[]>([]);
  const [isContributorsOpen, setIsContributorsOpen] = useState(false);
  const [isLoadingContributors, setIsLoadingContributors] = useState(false);
  const [contributorsError, setContributorsError] = useState("");
  const [activeTab, setActiveTab] = useState<"task" | "github">("task");
  const [dropdownRef, setDropdownRef] = useState<HTMLDivElement | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [isPinging, setIsPinging] = useState(false);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setSelectedLabels([]);
    setDueDate("");
    setEstimatedHours("");
    setEstimatedMinutes("");
    setChecklist([]);
    setNewChecklistItem("");
    setGithubRepo("");
    setGithubAssignees([]);
    setContributors([]);
    setContributorsError("");
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
      setGithubRepo(card.githubRepo || "");
      setGithubAssignees(card.githubAssignees || []);
    }
  }, [card, mode, isOpen]);

  //TODO: move all hooks and fucntion to hooks.js and services or store.
  useEffect(() => {
    // Scroll to the bottom of checklist when new item is added
    if (checklistRef) {
      checklistRef.scrollTop = checklistRef.scrollHeight;
    }
  }, [checklist.length]);

  useEffect(() => {
    const handleGithubRepo = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.repo) {
        setGithubRepo(customEvent.detail.repo);
      }
    };

    globalThis.addEventListener("set-github-repo", handleGithubRepo);
    return () =>
      globalThis.removeEventListener("set-github-repo", handleGithubRepo);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
        setIsContributorsOpen(false);
      }
    };

    if (isContributorsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isContributorsOpen]);

  useEffect(() => {
    if (githubRepo) {
      const match = githubRepo.match(/github\.com\/([^/]+\/[^/]+)/);
      if (match) {
        fetchContributors(match[1]);
      }
    }
  }, [githubRepo]);

  const fetchContributors = async (repo: string) => {
    setIsLoadingContributors(true);
    setContributorsError("");
    try {
      const [owner, repoName] = repo.split("/").slice(-2);
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repoName}/contributors`,
      );
      if (!response.ok) throw new Error("Failed to fetch contributors");
      const data = await response.json();
      setContributors(data);
    } catch (error) {
      setContributorsError("Error loading contributors");
      console.error("Error:", error);
    } finally {
      setIsLoadingContributors(false);
    }
  };

  const toggleAssignee = (login: string) => {
    setGithubAssignees((prev) =>
      prev.includes(login) ? prev.filter((a) => a !== login) : [...prev, login]
    );
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
      githubRepo,
      githubAssignees,
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

  const formatChecklistForGithub = () => {
    let checklistMd = "";
    if (checklist.length > 0) {
      checklistMd = "\n\n### Checklist\n";
      checklist.forEach((item) => {
        checklistMd += `- [${item.isChecked ? "x" : " "}] ${item.text}\n`;
      });
    }
    return checklistMd;
  };

  const createGithubIssue = () => {
    if (!githubRepo) return;

    const checklistMd = formatChecklistForGithub();
    const fullDescription = description + checklistMd;

    const params = new URLSearchParams({
      title,
      body: fullDescription,
      labels: selectedLabels.join(","),
      ...(githubAssignees.length && { assignees: githubAssignees.join(",") }),
    });

    window.open(`${githubRepo}/issues/new?${params.toString()}`, "_blank");
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
        class={`w-full max-w-2xl bg-white/80 dark:bg-gray-800/90 backdrop-blur-lg rounded-xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 my-2 flex flex-col transition-transform ${
          isShaking ? "animate-shake" : ""
        }`}
      >
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
          <div class="border-b border-gray-200/50 dark:border-gray-700/50">
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
                      class="w-full h-24 text-sm bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white resize-none"
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
                      class="w-full text-sm bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
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
                          class="w-full text-sm bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
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
                          class="w-full text-sm bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
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
                      ref={setChecklistRef}
                      class="space-y-2 max-h-40 overflow-y-auto pr-2"
                    >
                      {checklist.map((item) => (
                        <div
                          key={item.id}
                          class="flex items-center gap-2 group"
                        >
                          <input
                            type="checkbox"
                            checked={item.isChecked}
                            class="w-4 h-4 border-2 border-gray-300 dark:border-gray-600 rounded text-blue-500 dark:text-blue-400 focus:ring-blue-500/50"
                            onChange={() => toggleChecklistItem(item.id)}
                          />
                          <span class="flex-1 text-sm text-gray-700 dark:text-gray-300">
                            {item.text}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeChecklistItem(item.id)}
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
                        class="flex-1 text-sm bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
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
                // GitHub Issue Tab
                <div class="p-4 space-y-4 min-h-[50vh]">
                  <div>
                    <div class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      GitHub Repository URL
                    </div>
                    <input
                      type="url"
                      value={githubRepo}
                      onInput={(e) => setGithubRepo(e.currentTarget.value)}
                      placeholder="https://github.com/username/repository"
                      class="w-full text-sm bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
                    />
                  </div>

                  {/* Contributors Dropdown */}
                  <div class="relative" ref={setDropdownRef}>
                    <div class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Assignees
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsContributorsOpen(!isContributorsOpen)}
                      class="w-full text-left text-sm bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
                    >
                      {githubAssignees.length > 0
                        ? `${githubAssignees.length} assignee${
                          githubAssignees.length > 1 ? "s" : ""
                        } selected`
                        : "Select assignees"}
                    </button>

                    {/* Selected Assignees Preview */}
                    {githubAssignees.length > 0 && (
                      <div class="mt-2 flex flex-wrap gap-2">
                        {githubAssignees.map((login) => {
                          const contributor = contributors.find((c) =>
                            c.login === login
                          );
                          return contributor && (
                            <div
                              key={login}
                              class="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-full pl-1 pr-2 py-1"
                            >
                              <img
                                src={contributor.avatar_url}
                                alt={login}
                                class="w-5 h-5 rounded-full"
                              />
                              <span class="text-sm text-gray-700 dark:text-gray-300">
                                {login}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleAssignee(login);
                                }}
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
                          );
                        })}
                      </div>
                    )}

                    {/* Contributors Dropdown */}
                    {isContributorsOpen && (
                      <div class="absolute z-[9999] w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {isLoadingContributors
                          ? (
                            <div class="p-3 text-center text-sm text-gray-500 dark:text-gray-400">
                              Loading contributors...
                            </div>
                          )
                          : contributorsError
                          ? (
                            <div class="p-3 text-center text-sm text-red-500">
                              {contributorsError}
                            </div>
                          )
                          : contributors.length === 0
                          ? (
                            <div class="p-3 text-center text-sm text-gray-500 dark:text-gray-400">
                              No contributors found
                            </div>
                          )
                          : (
                            contributors.map((contributor) => (
                              <div
                                key={contributor.login}
                                onClick={() =>
                                  toggleAssignee(contributor.login)}
                                class={`flex items-center gap-3 p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                                  githubAssignees.includes(contributor.login)
                                    ? "bg-blue-50 dark:bg-blue-900/30"
                                    : ""
                                }`}
                              >
                                <img
                                  src={contributor.avatar_url}
                                  alt={contributor.login}
                                  class="w-8 h-8 rounded-full"
                                />
                                <div class="flex-1">
                                  <div class="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {contributor.login}
                                  </div>
                                  <div class="text-xs text-gray-500 dark:text-gray-400">
                                    {contributor.contributions} contributions
                                  </div>
                                </div>
                                {githubAssignees.includes(contributor.login) &&
                                  (
                                    <svg
                                      class="w-5 h-5 text-blue-500"
                                      viewBox="0 0 24 24"
                                      fill="currentColor"
                                    >
                                      <path d="M20 6L9 17l-5-5 1.41-1.41L9 14.17l9.59-9.59L20 6z" />
                                    </svg>
                                  )}
                              </div>
                            ))
                          )}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={createGithubIssue}
                    disabled={!githubRepo}
                    class="w-full px-4 py-2 text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 disabled:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 dark:disabled:bg-gray-800 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <svg
                      class="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    Create GitHub Issue
                  </button>
                </div>
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
