import { useEffect, useRef, useState } from "preact/hooks";
import type { GitHubContributor, GitHubData } from "../core/types/index.ts";

interface GitHubTabProps {
  description: string;
  selectedLabels: string[];
  title: string;
  checklist?: { text: string; isChecked: boolean }[];
  initialData?: GitHubData;
  onGithubDataChange: (data: GitHubData) => void;
}

export default function GitHubTab({
  description,
  selectedLabels,
  title,
  checklist,
  initialData,
  onGithubDataChange,
}: GitHubTabProps) {
  // Core states
  const [githubRepo, setGithubRepo] = useState("");
  const [contributors, setContributors] = useState<GitHubContributor[]>([]);
  const [githubAssignees, setGithubAssignees] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // UI states
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Refs
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Initialize data when component mounts or initialData changes
  useEffect(() => {
    if (initialData) {
      setGithubRepo(initialData.repo || "");
      setContributors(initialData.cachedContributors || []);
      setGithubAssignees(initialData.assignees || []);
    }
  }, [initialData]);

  // Filter contributors based on search query
  const filteredContributors = contributors.filter(
    (contributor) =>
      contributor.login.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        dropdownMenuRef.current &&
        !dropdownMenuRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isDropdownOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isDropdownOpen]);

  // Validate and fetch contributors when repo URL changes
  useEffect(() => {
    let timeoutId: number;

    const validateAndFetch = async () => {
      if (!githubRepo) {
        setError("");
        return;
      }

      try {
        setIsLoading(true);
        setError("");

        // Parse repo URL
        const url = new URL(githubRepo);
        const [, owner, repo] = url.pathname.split("/");
        if (!owner || !repo) throw new Error("Invalid repository URL");

        // Check if repo exists
        const repoResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repo}`,
        );
        if (!repoResponse.ok) {
          throw new Error(
            repoResponse.status === 404
              ? "Repository not found"
              : "Failed to validate repository",
          );
        }

        // Fetch contributors
        const contributorsResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contributors`,
        );
        if (!contributorsResponse.ok) {
          throw new Error("Failed to fetch contributors");
        }

        const contributorsData = await contributorsResponse.json();
        setContributors(contributorsData);

        // Update parent
        onGithubDataChange({
          repo: githubRepo,
          assignees: githubAssignees,
          cachedContributors: contributorsData,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Invalid repository URL");
        setContributors([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce validation
    if (githubRepo) {
      timeoutId = setTimeout(validateAndFetch, 1000);
    }

    return () => clearTimeout(timeoutId);
  }, [githubRepo]);

  // Handle assignee selection
  const toggleAssignee = (login: string) => {
    const newAssignees = githubAssignees.includes(login)
      ? githubAssignees.filter((a) => a !== login)
      : [...githubAssignees, login];

    setGithubAssignees(newAssignees);
    onGithubDataChange({
      repo: githubRepo,
      assignees: newAssignees,
      cachedContributors: contributors,
    });
  };

  // Create GitHub issue URL with parameters
  const createGithubIssue = () => {
    if (!githubRepo) return;

    const params = new URLSearchParams({
      title,
      body: description,
      labels: selectedLabels.join(","),
    });

    if (githubAssignees.length > 0) {
      params.append("assignees", githubAssignees.join(","));
    }

    if (checklist?.length) {
      const checklistMd = checklist
        .map((item) => `- [${item.isChecked ? "x" : " "}] ${item.text}`)
        .join("\n");
      params.set("body", `${description}\n\n### Checklist\n${checklistMd}`);
    }

    globalThis.open(`${githubRepo}/issues/new?${params.toString()}`, "_blank");
  };

  return (
    <div class="p-4 space-y-4">
      {/* Repository URL Input */}
      <div>
        <div class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          GitHub Repository URL
        </div>
        <input
          type="url"
          value={githubRepo}
          onInput={(e) => setGithubRepo(e.currentTarget.value)}
          placeholder="https://github.com/username/repository"
          class={`w-full text-sm bg-white/50 dark:bg-gray-700/50 border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 dark:text-white transition-colors ${
            error
              ? "border-red-500 focus:ring-red-500/50"
              : contributors.length > 0
              ? "border-green-500 focus:ring-green-500/50"
              : "border-gray-200 dark:border-gray-600 focus:ring-blue-500/50"
          }`}
        />
        {isLoading && (
          <div class="absolute right-3 top-1/2 -translate-y-1/2">
            <svg
              class="animate-spin h-4 w-4 text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Assignees Selection */}
      <div ref={dropdownRef}>
        <div class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Assignees
        </div>

        {/* Dropdown Trigger Button */}
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          disabled={!githubRepo || contributors.length === 0}
          class={`w-full text-left text-sm bg-white/50 dark:bg-gray-700/50 border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed ${
            !githubRepo || contributors.length === 0
              ? "bg-gray-100 dark:bg-gray-800"
              : ""
          }`}
        >
          {githubAssignees.length > 0
            ? `${githubAssignees.length} assignee${
              githubAssignees.length > 1 ? "s" : ""
            } selected`
            : "Select assignees"}
        </button>
      </div>

      {/* Dropdown Menu - Rendered at root level */}
      {isDropdownOpen && (
        <div
          ref={dropdownMenuRef}
          style={{
            position: "fixed",
            width: dropdownRef.current?.getBoundingClientRect().width + "px",
            left: dropdownRef.current?.getBoundingClientRect().left + "px",
            top: dropdownRef.current?.getBoundingClientRect().bottom + 4 + "px",
          }}
          class="z-[100] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input */}
          <div class="p-2 border-b border-gray-200 dark:border-gray-700">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onInput={(e) => setSearchQuery(e.currentTarget.value)}
              placeholder="Search contributors..."
              class="w-full text-sm bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
            />
          </div>

          {/* Contributors List */}
          <div class="max-h-64 overflow-y-auto py-1">
            {filteredContributors.length > 0
              ? (
                filteredContributors.map((contributor) => {
                  const isSelected = githubAssignees.includes(
                    contributor.login,
                  );
                  return (
                    <div
                      key={contributor.login}
                      onClick={() => toggleAssignee(contributor.login)}
                      class={`flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                        isSelected ? "bg-gray-100 dark:bg-gray-700" : ""
                      }`}
                    >
                      <img
                        src={contributor.avatar_url}
                        alt={contributor.login}
                        class="w-6 h-6 rounded-full"
                      />
                      <span class="flex-1 text-sm text-gray-700 dark:text-gray-300">
                        {contributor.login}
                      </span>
                      {isSelected && (
                        <svg
                          class="w-4 h-4 text-blue-500"
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
                    </div>
                  );
                })
              )
              : (
                <div class="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                  {searchQuery
                    ? "No matching contributors"
                    : "No contributors found"}
                </div>
              )}
          </div>
        </div>
      )}

      {/* Selected Assignees Preview */}
      {githubAssignees.length > 0 && (
        <div class="mt-2 flex flex-wrap gap-2">
          {githubAssignees.map((login) => {
            const contributor = contributors.find((c) => c.login === login);
            return (
              contributor && (
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
                    onClick={() => toggleAssignee(login)}
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
              )
            );
          })}
        </div>
      )}

      {/* Create Issue Button */}
      <div class="mt-8 flex justify-end">
        <button
          type="button"
          onClick={createGithubIssue}
          disabled={!githubRepo || contributors.length === 0}
          class="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Create GitHub Issue
        </button>
      </div>
    </div>
  );
}
