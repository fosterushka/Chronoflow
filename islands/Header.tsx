import DarkModeToggle from "./DarkModeToggle.tsx";
import HeaderControls from "./HeaderControls.tsx";
import { useState } from "preact/hooks";

export function Header({ stats }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div
            id="header"
            class="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 shadow-sm sticky top-0 z-50"
        >
            <div class="flex items-center justify-between px-4 h-14">
                <div class="flex items-center gap-3">
                    <div class="w-6 h-6 flex-shrink-0 bg-indigo-500 rounded flex items-center justify-center">
                        <svg
                            class="w-4 h-4 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                        </svg>
                    </div>
                    <div class="flex items-center gap-2">
                        <h1 class="hidden sm:block font-semibold text-gray-700 dark:text-white text-sm">
                            Chronoflow
                        </h1>
                        <div id="greeting-container" class="hidden sm:block" />
                    </div>
                </div>

                {/* Desktop Menu */}
                <div class="hidden sm:flex items-center gap-4">
                    <div class="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <div class="flex items-center gap-1.5">
                            <div class="w-1.5 h-1.5 rounded-full bg-indigo-500">
                            </div>
                            <span>{stats.totalTasks} tasks</span>
                        </div>
                        <div class="flex items-center gap-1.5">
                            <div class="w-1.5 h-1.5 rounded-full bg-emerald-500">
                            </div>
                            <span>{stats.completedTasks} completed</span>
                        </div>
                        <div class="flex items-center gap-1.5">
                            <div class="w-1.5 h-1.5 rounded-full bg-blue-500">
                            </div>
                            <span>
                                {Math.floor(stats.totalTimeSpent / 3600)}h spent
                            </span>
                        </div>
                    </div>

                    <div class="flex items-center gap-2">
                        <HeaderControls />
                        <DarkModeToggle />
                    </div>
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    class="sm:hidden p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                    <svg
                        class="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        {isMobileMenuOpen
                            ? (
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            )
                            : (
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            )}
                    </svg>
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div class="fixed inset-0 bg-white dark:bg-gray-800 z-50">
                    <div class="flex flex-col h-full">
                        <div class="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
                            <h1 class="font-semibold text-gray-700 dark:text-white">
                                Chronoflow
                            </h1>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                class="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            >
                                <svg
                                    class="w-6 h-6"
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
                        <div class="flex-1 overflow-y-auto p-4">
                            <div class="space-y-6">
                                {/* Stats */}
                                <div class="space-y-4">
                                    <h2 class="text-sm font-medium text-gray-900 dark:text-white">
                                        Statistics
                                    </h2>
                                    <div class="space-y-3">
                                        <div class="flex items-center gap-2">
                                            <div class="w-2 h-2 rounded-full bg-indigo-500">
                                            </div>
                                            <span class="text-sm text-gray-600 dark:text-gray-300">
                                                {stats.totalTasks} tasks
                                            </span>
                                        </div>
                                        <div class="flex items-center gap-2">
                                            <div class="w-2 h-2 rounded-full bg-emerald-500">
                                            </div>
                                            <span class="text-sm text-gray-600 dark:text-gray-300">
                                                {stats.completedTasks} completed
                                            </span>
                                        </div>
                                        <div class="flex items-center gap-2">
                                            <div class="w-2 h-2 rounded-full bg-blue-500">
                                            </div>
                                            <span class="text-sm text-gray-600 dark:text-gray-300">
                                                {Math.floor(
                                                    stats.totalTimeSpent / 3600,
                                                )}h spent
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Controls */}
                                <div class="space-y-4">
                                    <h2 class="text-sm font-medium text-gray-900 dark:text-white">
                                        Controls
                                    </h2>
                                    <div class="flex flex-col gap-4">
                                        <HeaderControls />
                                        <DarkModeToggle />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
