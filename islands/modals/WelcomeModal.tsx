import { useState } from "preact/hooks";
import { memo } from "preact/compat";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (name: string) => void;
}

const features = [
  {
    title: "Intuitive Task Management",
    description:
      "Effortlessly organize and prioritize your tasks with our user-friendly interface",
    icon: "📋",
  },
  {
    title: "Seamless GitHub Integration",
    description:
      "Create, track, and manage GitHub issues without leaving the app",
    icon: "🔄",
  },
  {
    title: "Time Tracking & Analytics",
    description:
      "Monitor project progress and optimize productivity with built-in time tracking",
    icon: "⏱️",
  },
  {
    title: "Community Driven",
    description:
      "Help shape Chronoflow by sharing your ideas and feedback through GitHub issues",
    icon: "🤝",
  },
];

const WelcomeModal = memo(
  function WelcomeModal({ isOpen, onClose, onComplete }: WelcomeModalProps) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [name, setName] = useState("");

    if (!isOpen) return null;

    const handleNext = () => {
      if (currentSlide < features.length) {
        setCurrentSlide((prev) => prev + 1);
      } else if (name.trim()) {
        onComplete(name);
      }
    };

    return (
      <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl transform transition-all duration-300 animate-fade-scale-up">
          {currentSlide < features.length
            ? (
              <div class="space-y-6">
                {/* Icon container moved inside the modal */}
                <div class="w-20 h-20 mx-auto bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-full flex items-center justify-center shadow-lg transform-gpu animate-float">
                  <span class="text-4xl">{features[currentSlide].icon}</span>
                </div>

                <div>
                  <h2 class="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-400 dark:to-purple-400 mb-4">
                    {features[currentSlide].title}
                  </h2>
                  <p class="text-base text-center text-gray-600 dark:text-gray-300 leading-relaxed">
                    {features[currentSlide].description}
                  </p>
                </div>

                <div class="flex justify-center gap-2">
                  {features.map((_, index) => (
                    <div
                      class={`h-1.5 rounded-full transition-all duration-300 ${
                        index === currentSlide
                          ? "w-6 bg-blue-500"
                          : "w-1.5 bg-gray-200 dark:bg-gray-700"
                      }`}
                    />
                  ))}
                </div>

                <div class="flex justify-between items-center pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    class="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
                  >
                    Skip
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    class="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium rounded-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )
            : (
              <div class="space-y-6">
                {/* Welcome icon container */}
                <div class="w-20 h-20 mx-auto bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-full flex items-center justify-center shadow-lg transform-gpu animate-float">
                  <span class="text-4xl">👋</span>
                </div>

                <div>
                  <h2 class="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-400 dark:to-purple-400 mb-4">
                    Welcome to Chronoflow
                  </h2>
                  <p class="text-base text-center text-gray-600 dark:text-gray-300 mb-6">
                    Have an idea or suggestion? Share it with us!
                  </p>
                  <a
                    href="https://github.com/fosterushka/Chronoflow/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="block w-full p-4 mb-6 text-center bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xl transition-colors duration-200 text-gray-700 dark:text-gray-300"
                  >
                    <span class="flex items-center justify-center gap-2">
                      <svg
                        class="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                      Create an Issue
                    </span>
                  </a>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) =>
                      setName((e.target as HTMLInputElement).value)}
                    class="w-full p-4 border rounded-xl bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200"
                    placeholder="Enter your name to continue"
                  />
                </div>

                <div class="flex justify-between items-center pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    class="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
                  >
                    Skip
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!name.trim()}
                    class={`px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-xl transform transition-all duration-200 shadow-lg ${
                      name.trim()
                        ? "hover:from-blue-600 hover:to-purple-600 hover:scale-[1.02] active:scale-[0.98]"
                        : "opacity-50 cursor-not-allowed"
                    }`}
                  >
                    Get Started
                  </button>
                </div>
              </div>
            )}
        </div>
      </div>
    );
  },
);

export default WelcomeModal;
