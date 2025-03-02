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
    title: "Continuous Improvement",
    description:
      "We're constantly adding new features based on user feedback - your ideas shape our future!",
    icon: "🚀",
  },
];

const WelcomeModal = memo(function WelcomeModal(
  { isOpen, onClose, onComplete }: WelcomeModalProps,
) {
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

  const handleSkip = () => {
    onClose();
  };

  return (
    <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md w-full shadow-2xl transform transition-all duration-300 ease-in-out">
        {currentSlide < features.length
          ? (
            <div class="space-y-6">
              <div class="flex justify-center mb-8 text-4xl">
                {features[currentSlide].icon}
              </div>
              <h2 class="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-400 dark:to-purple-400">
                {features[currentSlide].title}
              </h2>
              <p class="text-lg text-center text-gray-600 dark:text-gray-300 leading-relaxed">
                {features[currentSlide].description}
              </p>
              <div class="flex justify-center gap-2 mt-4 mb-6">
                {features.map((_, index) => (
                  <div
                    class={`h-2 rounded-full transition-all duration-300 ${
                      index === currentSlide
                        ? "w-8 bg-blue-500"
                        : "w-2 bg-gray-300 dark:bg-gray-600"
                    }`}
                  />
                ))}
              </div>
              <div class="flex justify-between items-center pt-4">
                <button
                  type="button"
                  onClick={handleSkip}
                  class="px-6 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
                >
                  Skip
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  class="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-lg transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  Next
                </button>
              </div>
            </div>
          )
          : (
            <div class="space-y-6">
              <div class="flex justify-center mb-6 text-4xl">
                👋
              </div>
              <h2 class="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-400 dark:to-purple-400">
                Welcome!
              </h2>
              <p class="text-lg text-center text-gray-600 dark:text-gray-300 mb-6">
                Please enter your name to get started:
              </p>
              <input
                type="text"
                value={name}
                onChange={(e) => setName((e.target as HTMLInputElement).value)}
                class="w-full p-4 border-2 rounded-lg mb-6 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200 text-lg"
                placeholder="Your name"
              />
              <div class="flex justify-between items-center pt-4">
                <button
                  type="button"
                  onClick={handleSkip}
                  class="px-6 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
                >
                  Skip
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  class={`px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg transform transition-all duration-200 shadow-lg ${
                    name.trim()
                      ? "hover:from-blue-600 hover:to-purple-600 hover:scale-105"
                      : "opacity-50 cursor-not-allowed"
                  }`}
                  disabled={!name.trim()}
                >
                  Get Started
                </button>
              </div>
            </div>
          )}
      </div>
    </div>
  );
});

export default WelcomeModal;
