import { useEffect, useRef, useState } from "preact/hooks";
import type { GitHubContributor } from "../core/types/index.ts";
import type { GitHubData } from "../core/types/ICardModal.ts";

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
  const [repoInput, setRepoInput] = useState(initialData?.repo || "");
  const [contributors, setContributors] = useState<GitHubContributor[]>([]);
  const [assignees, setAssignees] = useState<string[]>(
    initialData?.assignees || [],
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setRepoInput(initialData.repo || "");
      setAssignees(initialData.assignees || []);
    }
  }, [initialData]);

  function handleRepoInputChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const value = target.value;

    console.log("Input changed:", value);
    setRepoInput(value);

    onGithubDataChange({
      repo: value,
      assignees,
      cachedContributors: contributors as GitHubContributor[],
    });
  }

  useEffect(() => {
    if (!repoInput) {
      setContributors([]);
      setError("");
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setIsLoading(true);
        setError("");

        let owner = "";
        let repo = "";

        if (repoInput.includes("github.com")) {
          try {
            const url = new URL(repoInput);
            const parts = url.pathname.split("/").filter(Boolean);
            if (parts.length >= 2) {
              owner = parts[0];
              repo = parts[1];
            } else {
              setIsLoading(false);
              return;
            }
          } catch (_e) {
            setIsLoading(false);
            return;
          }
        } else {
          const parts = repoInput.split("/").filter(Boolean);
          if (parts.length === 2) {
            owner = parts[0];
            repo = parts[1];
          } else {
            setIsLoading(false);
            return;
          }
        }

        if (!owner || !repo) {
          setIsLoading(false);
          return;
        }

        const repoResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repo}`,
          { headers: { "Accept": "application/vnd.github.v3+json" } },
        );

        if (!repoResponse.ok) {
          if (repoResponse.status === 404) {
            throw new Error(`Repository '${owner}/${repo}' not found`);
          }
          throw new Error(`GitHub API error (${repoResponse.status})`);
        }

        const contributorsResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contributors`,
          { headers: { "Accept": "application/vnd.github.v3+json" } },
        );

        if (contributorsResponse.ok) {
          const contributorsData = await contributorsResponse.json();
          setContributors(contributorsData);

          onGithubDataChange({
            repo: repoInput,
            assignees,
            cachedContributors: contributorsData,
          });
        }
      } catch (err) {
        console.error("Error fetching repository data:", err);
        setError(err instanceof Error ? err.message : "Invalid repository");
      } finally {
        setIsLoading(false);
      }
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [repoInput, assignees]);

  function toggleAssignee(login: string) {
    const newAssignees = assignees.includes(login)
      ? assignees.filter((a) => a !== login)
      : [...assignees, login];

    setAssignees(newAssignees);

    onGithubDataChange({
      repo: repoInput,
      assignees: newAssignees,
      cachedContributors: contributors as GitHubContributor[],
    });
  }

  const filteredContributors = contributors.filter((contributor) =>
    contributor.login.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (!isDropdownOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  useEffect(() => {
    if (isDropdownOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isDropdownOpen]);

  function createGithubIssue() {
    if (!repoInput) return;

    const params = new URLSearchParams({
      title,
      body: description,
      labels: selectedLabels.join(","),
    });

    if (assignees.length > 0) {
      params.append("assignees", assignees.join(","));
    }

    if (checklist?.length) {
      const checklistMd = checklist
        .map((item) => `- [${item.isChecked ? "x" : " "}] ${item.text}`)
        .join("\n");
      params.set("body", `${description}\n\n### Checklist\n${checklistMd}`);
    }

    globalThis.open(`${repoInput}/issues/new?${params.toString()}`, "_blank");
  }

  return (
    <div class="p-4 space-y-4">
      <div>
        <div class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          GitHub Repository
        </div>
        <div class="relative">
          <input
            type="text"
            value={repoInput}
            onInput={handleRepoInputChange}
            placeholder="username/repo or full GitHub URL"
            class={`w-full text-sm bg-white/50 dark:bg-gray-700/50 border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 dark:text-white transition-colors ${
              error
                ? "border-red-500 focus:ring-red-500/50"
                : contributors.length > 0
                ? "border-green-500 focus:ring-green-500/50"
                : "border-gray-200 dark:border-gray-600 focus:ring-blue-500/50"
            }`}
          />

          {error && <div class="text-xs text-red-500 mt-0.5">{error}</div>}

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
      </div>

      <div ref={dropdownRef}>
        <div class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Assignees
        </div>

        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          disabled={!repoInput || contributors.length === 0}
          class={`w-full text-left text-sm bg-white/50 dark:bg-gray-700/50 border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed ${
            !repoInput || contributors.length === 0
              ? "bg-gray-100 dark:bg-gray-800"
              : ""
          }`}
        >
          {assignees.length > 0
            ? `${assignees.length} assignee${
              assignees.length > 1 ? "s" : ""
            } selected`
            : "Select assignees"}
        </button>

        {isDropdownOpen && (
          <div class="absolute z-10 mt-1 w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-64 overflow-y-auto">
            <div class="p-2 border-b border-gray-200 dark:border-gray-700">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onInput={(e) =>
                  setSearchQuery((e.target as HTMLInputElement).value)}
                placeholder="Search contributors..."
                class="w-full text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
              />
            </div>

            <div class="py-1">
              {filteredContributors.length > 0
                ? (
                  filteredContributors.map((contributor) => {
                    const isSelected = assignees.includes(contributor.login);
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
      </div>

      <div class="pt-2">
        <button
          type="button"
          onClick={createGithubIssue}
          disabled={!repoInput}
          class="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed"
        >
          <svg
            class="w-4 h-4"
            viewBox="0 0 16 16"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zm9 3a1 1 0 11-2 0 1 1 0 012 0zm-.25-6.25a.75.75 0 00-1.5 0v3.5a.75.75 0 001.5 0v-3.5z"
            />
          </svg>
          Create GitHub Issue
        </button>
      </div>
    </div>
  );
}
