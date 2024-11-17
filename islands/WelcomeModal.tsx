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
  },
  {
    title: "Seamless GitHub Integration",
    description:
      "Create, track, and manage GitHub issues without leaving the app",
  },
  {
    title: "Time Tracking & Analytics",
    description:
      "Monitor project progress and optimize productivity with built-in time tracking",
  },
  {
    title: "Continuous Improvement",
    description:
      "We're constantly adding new features based on user feedback - your ideas shape our future!",
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
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
        {currentSlide < features.length
          ? (
            <>
              <h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                {features[currentSlide].title}
              </h2>
              <p class="mb-6 text-gray-600 dark:text-gray-300">
                {features[currentSlide].description}
              </p>
              <div class="flex justify-between items-center">
                <button
                  onClick={handleSkip}
                  class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Skip
                </button>
                <button
                  onClick={handleNext}
                  class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Next
                </button>
              </div>
            </>
          )
          : (
            <>
              <h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                Welcome!
              </h2>
              <p class="mb-4 text-gray-600 dark:text-gray-300">
                Please enter your name to get started:
              </p>
              <input
                type="text"
                value={name}
                onChange={(e) => setName((e.target as HTMLInputElement).value)}
                class="w-full p-2 border rounded mb-4 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                placeholder="Your name"
              />
              <div class="flex justify-between items-center">
                <button
                  onClick={handleSkip}
                  class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Skip
                </button>
                <button
                  onClick={handleNext}
                  disabled={!name.trim()}
                  class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  Get Started
                </button>
              </div>
            </>
          )}
      </div>
    </div>
  );
});

export default WelcomeModal;
