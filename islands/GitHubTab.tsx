import { useEffect, useState } from "preact/hooks";
import type { GitHubContributor, GitHubData } from "../types/index.ts";

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
  const [githubRepo, setGithubRepo] = useState(initialData?.repo || "");
  const [githubAssignees, setGithubAssignees] = useState<string[]>(
    initialData?.assignees || [],
  );
  const [contributors, setContributors] = useState<GitHubContributor[]>(
    initialData?.cachedContributors || [],
  );
  const [isContributorsOpen, setIsContributorsOpen] = useState(false);
  const [isLoadingContributors, setIsLoadingContributors] = useState(false);
  const [contributorsError, setContributorsError] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [isValidRepo, setIsValidRepo] = useState<boolean | null>(
    initialData?.repo ? true : null,
  );
  const [typingTimeout, setTypingTimeout] = useState<number | null>(null);
  const [dropdownRef, setDropdownRef] = useState<HTMLDivElement | null>(null);

  const validateRepo = async (repo: string) => {
    if (!repo) {
      setIsValidRepo(null);
      setContributorsError("");
      return;
    }

    try {
      setIsValidating(true);
      const repoUrl = new URL(repo);
      const [, owner, repoName] = repoUrl.pathname.split("/");
      if (!owner || !repoName) {
        setIsValidRepo(false);
        setContributorsError("");
        return;
      }

      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repoName}`,
      );

      if (response.status === 404) {
        setIsValidRepo(false);
        setContributorsError("");
        return;
      }

      if (response.status === 403) {
        setIsValidRepo(null);
        setContributorsError(
          "API rate limit exceeded. Please try again later.",
        );
        return;
      }

      if (!response.ok) {
        setIsValidRepo(null);
        setContributorsError(`GitHub API Error: ${response.statusText}`);
        return;
      }

      setIsValidRepo(true);
      setContributorsError("");

      // Notify parent of changes
      onGithubDataChange({
        repo,
        assignees: githubAssignees,
        cachedContributors: contributors,
      });
    } catch (error) {
      setIsValidRepo(false);
      setContributorsError(
        error instanceof Error ? error.message : "Invalid repository URL",
      );
    } finally {
      setIsValidating(false);
    }
  };

  const fetchContributors = async () => {
    if (!githubRepo || !isValidRepo) return;

    try {
      setIsLoadingContributors(true);
      const repoUrl = new URL(githubRepo);
      const [, owner, repoName] = repoUrl.pathname.split("/");

      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repoName}/contributors`,
      );

      if (response.status === 403) {
        setContributorsError(
          "API rate limit exceeded. Please try again later.",
        );
        return;
      }

      if (!response.ok) {
        setContributorsError("Failed to load contributors");
        return;
      }

      const data = await response.json();
      setContributors(data);
      setContributorsError("");

      // Update parent with new contributors
      onGithubDataChange({
        repo: githubRepo,
        assignees: githubAssignees,
        cachedContributors: data,
      });
    } catch (error) {
      setContributorsError("Failed to load contributors");
    } finally {
      setIsLoadingContributors(false);
    }
  };

  useEffect(() => {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Always validate initial repo on mount
    if (initialData?.repo && !githubRepo) {
      setGithubRepo(initialData.repo);
      validateRepo(initialData.repo);
      return;
    }

    // Don't revalidate if we're just setting the initial value
    if (githubRepo === initialData?.repo) {
      return;
    }

    const newTimeout = setTimeout(() => validateRepo(githubRepo), 2000);
    setTypingTimeout(Number(newTimeout));

    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [githubRepo, initialData?.repo]);

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

  const handleRefresh = async () => {
    setIsLoadingContributors(true);
    await fetchContributors();
  };

  const formatChecklistForGithub = () => {
    let checklistMd = "";

    // Add description if exists
    if (description) {
      checklistMd = "\n\n### Description\n" + description;
    }

    // Add checklist if exists
    if (checklist?.length > 0) {
      checklistMd += "\n\n### Checklist\n";
      checklist.forEach((item) => {
        checklistMd += `\n- [${item.isChecked ? 'x' : ' '}] ${item.text}`;
      });
    }

    return checklistMd;
  };

  const createGithubIssue = () => {
    if (!githubRepo || !isValidRepo) return;

    const checklistMd = formatChecklistForGithub();
    const params = new URLSearchParams({
      title,
      body: checklistMd,
      labels: selectedLabels.join(","),
    });

    // Only add assignees if we have them
    if (githubAssignees.length > 0) {
      params.append("assignees", githubAssignees.join(","));
    }

    globalThis.open(`${githubRepo}/issues/new?${params.toString()}`, "_blank");
  };

  return (
    <div class="p-4 space-y-4 min-h-[50vh]">
      <div>
        <div class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          GitHub Repository URL
        </div>
        <div class="relative">
          <input
            type="url"
            value={githubRepo}
            onInput={(e) => {
              const newRepo = e.currentTarget.value;
              setGithubRepo(newRepo);
            }}
            placeholder="https://github.com/username/repository"
            class={`w-full text-sm bg-white/50 dark:bg-gray-700/50 border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 dark:text-white transition-colors ${
              isValidRepo === false
                ? "border-red-500 dark:border-red-500 focus:ring-red-500/50"
                : isValidRepo === true
                ? "border-green-500 dark:border-green-500 focus:ring-green-500/50"
                : "border-gray-200 dark:border-gray-600 focus:ring-blue-500/50"
            }`}
          />
          {isValidating && (
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
                >
                </circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                >
                </path>
              </svg>
            </div>
          )}
        </div>
        {isValidRepo === false && (
          <p class="mt-1 text-xs text-red-500">
            Invalid repository URL. Please check the URL and try again.
          </p>
        )}
        {contributorsError && (
          <p class="mt-1 text-xs text-red-500">
            {contributorsError}
          </p>
        )}
      </div>

      {/* Contributors Dropdown */}
      <div class="relative" ref={setDropdownRef}>
        <div class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Assignees
        </div>
        <div class="relative">
          <button
            type="button"
            onClick={() => setIsContributorsOpen(!isContributorsOpen)}
            disabled={!isValidRepo}
            class={`w-full text-left text-sm bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed ${
              !isValidRepo ? "bg-gray-100 dark:bg-gray-800" : ""
            }`}
          >
            {githubAssignees.length > 0
              ? `${githubAssignees.length} assignee${
                githubAssignees.length > 1 ? "s" : ""
              } selected`
              : "Select assignees"}
          </button>
          {isValidRepo && !isLoadingContributors && (
            <button
              onClick={fetchContributors}
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              title="Refresh contributors list"
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
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          )}
          {isLoadingContributors && (
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
                >
                </circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                >
                </path>
              </svg>
            </div>
          )}
        </div>

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
                )
              );
            })}
          </div>
        )}

        {/* Contributors Dropdown */}
        {isContributorsOpen && (
          <div class="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
            <div class="max-h-48 overflow-y-auto">
              {isLoadingContributors
                ? (
                  <div class="flex items-center justify-center p-4">
                    <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-500">
                    </div>
                  </div>
                )
                : contributorsError
                ? (
                  <div class="p-4 text-sm text-red-500">
                    {contributorsError}
                  </div>
                )
                : contributors.length === 0
                ? (
                  <div class="p-4 text-sm text-gray-500">
                    No contributors found
                  </div>
                )
                : (
                  contributors.map((contributor) => (
                    <div
                      key={contributor.login}
                      class="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                      onClick={() => toggleAssignee(contributor.login)}
                    >
                      <img
                        src={contributor.avatar_url}
                        alt={contributor.login}
                        class="w-6 h-6 rounded-full"
                      />
                      <span class="flex-1 text-sm text-gray-700 dark:text-gray-300">
                        {contributor.login}
                      </span>
                      {githubAssignees.includes(contributor.login) && (
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
                  ))
                )}
            </div>
          </div>
        )}
      </div>

      <div class="mt-8 flex justify-end">
        <button
          type="button"
          onClick={createGithubIssue}
          disabled={!isValidRepo}
          class="w-full px-4 py-2 text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 disabled:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 dark:disabled:bg-gray-800 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          Create GitHub Issue
        </button>
      </div>
    </div>
  );
}
