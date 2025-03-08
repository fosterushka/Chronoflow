import { JSX } from "preact";
import { useMemo } from "preact/hooks";
import type { AuditEntry } from "../core/types/ICardModal.ts";
import { formatRelativeTime } from "../core/utils/timeUtils.ts";

interface AuditTabProps {
  auditHistory?: AuditEntry[];
}

const getAuditIcon = (type: AuditEntry["type"]): JSX.Element => {
  const baseClass = "w-4 h-4";

  switch (type) {
    case "create":
      return (
        <svg
          class={baseClass}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
      );
    case "update":
      return (
        <svg
          class={baseClass}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      );
    case "move":
      return (
        <svg
          class={baseClass}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
      );
    case "status_change":
      return (
        <svg
          class={baseClass}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      );
    default:
      return (
        <svg
          class={baseClass}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
  }
};

export default function AuditTab(
  { auditHistory = [] }: AuditTabProps,
): JSX.Element {
  const sortedHistory = useMemo(() => {
    return [...auditHistory].sort((a, b) => b.timestamp - a.timestamp);
  }, [auditHistory]);

  const formatTimestamp = formatRelativeTime;

  const getAuditColor = (type: AuditEntry["type"]): string => {
    switch (type) {
      case "create":
        return "text-emerald-500 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20";
      case "update":
        return "text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20";
      case "move":
        return "text-purple-500 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20";
      case "status_change":
        return "text-amber-500 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20";
      default:
        return "text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50";
    }
  };

  const formatChange = (entry: AuditEntry): string => {
    switch (entry.type) {
      case "create":
        return "Card created";
      case "move":
        return `Moved from ${entry.oldValue} to ${entry.newValue}`;
      case "status_change":
        return `Status changed from "${entry.oldValue}" to "${entry.newValue}"`;
      case "update":
        if (entry.field) {
          return `Updated ${entry.field}`;
        }
        return "Card updated";
      case "comment":
        return "Comment added";
      default:
        return "Unknown change";
    }
  };

  return (
    <div class="flex flex-col h-full max-h-[calc(85vh-12rem)] overflow-hidden">
      <div class="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 flex items-center justify-center">
            <svg
              class="w-4 h-4 text-blue-500 dark:text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Audit History
          </h3>
        </div>
        <span class="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
          {sortedHistory.length}{" "}
          {sortedHistory.length === 1 ? "entry" : "entries"}
        </span>
      </div>

      <div class="flex-1 overflow-y-auto">
        {sortedHistory.length === 0
          ? (
            <div class="flex flex-col items-center justify-center h-full p-8 text-center">
              <div class="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <svg
                  class="w-6 h-6 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <p class="text-gray-500 dark:text-gray-400 mb-2">
                No audit history available
              </p>
              <p class="text-sm text-gray-400 dark:text-gray-500">
                Changes to this card will appear here
              </p>
            </div>
          )
          : (
            <div class="p-4 space-y-3">
              {sortedHistory.map((entry, index) => {
                const isLast = index === sortedHistory.length - 1;
                const colorClass = getAuditColor(entry.type);

                return (
                  <div
                    key={entry.id}
                    class={`relative flex items-start ${!isLast ? "pb-3" : ""}`}
                  >
                    {/* Timeline line */}
                    {!isLast && (
                      <div class="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
                    )}

                    {/* Icon */}
                    <div
                      class={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full ${colorClass} mr-4`}
                    >
                      {getAuditIcon(entry.type)}
                    </div>

                    {/* Content */}
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center justify-between mb-1">
                        <p class={`font-medium ${colorClass.split(" ")[0]}`}>
                          {formatChange(entry)}
                        </p>
                        <time class="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-4">
                          {formatTimestamp(entry.timestamp)}
                        </time>
                      </div>

                      {entry.field && entry.type === "update" && (
                        <div class="mt-2">
                          <div class="grid grid-cols-2 gap-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-sm">
                            <div>
                              <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Previous
                              </p>
                              <p class="text-gray-700 dark:text-gray-300 break-words">
                                {JSON.stringify(entry.oldValue)}
                              </p>
                            </div>
                            <div>
                              <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                New
                              </p>
                              <p class="text-gray-700 dark:text-gray-300 break-words">
                                {JSON.stringify(entry.newValue)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {entry.userId && (
                        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          by {entry.userId}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
      </div>
    </div>
  );
}
