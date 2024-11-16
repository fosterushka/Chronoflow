interface StatisticsProps {
  totalTasks: number;
  completedTasks: number;
  totalEstimatedTime: number;
  totalTimeSpent: number;
}

export default function Statistics(
  { totalTasks, completedTasks, totalEstimatedTime, totalTimeSpent }:
    StatisticsProps,
) {
  const formatTime = (seconds: number = 0) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div class="space-y-3">
      <div class="flex items-center gap-2">
        <div class="w-2 h-2 rounded-full bg-blue-500"></div>
        <div class="flex flex-col">
          <span class="text-sm font-medium text-gray-900 dark:text-white">
            {completedTasks}/{totalTasks}
          </span>
          <span class="text-xs text-gray-500 dark:text-gray-400">Tasks</span>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <div class="w-2 h-2 rounded-full bg-green-500"></div>
        <div class="flex flex-col">
          <span class="text-sm font-medium text-gray-900 dark:text-white">
            {formatTime(totalEstimatedTime * 60)}
          </span>
          <span class="text-xs text-gray-500 dark:text-gray-400">
            Estimated
          </span>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <div class="w-2 h-2 rounded-full bg-purple-500"></div>
        <div class="flex flex-col">
          <span class="text-sm font-medium text-gray-900 dark:text-white">
            {formatTime(totalTimeSpent)}
          </span>
          <span class="text-xs text-gray-500 dark:text-gray-400">
            Time Spent
          </span>
        </div>
      </div>
    </div>
  );
}
