import { useEffect, useRef, useState } from "preact/hooks";
import { Card } from "../core/types/index.ts";
import { Signal } from "@preact/signals";
import { handleCardTracking } from "../core/services/boardService.ts";

interface CardPreviewPipProps {
  card: Card;
  formatTime: (seconds: number) => string;
  getElapsedTime: (startTime: number) => number;
  currentElapsedTime: Signal<number>;
  getTimeBasedColor: (card: Card) => string;
  hasExceededEstimatedTime: (card: Card) => boolean;
  columnId: string;
}

export default function CardPreviewPip({
  card,
  formatTime,
  getElapsedTime,
  currentElapsedTime,
  hasExceededEstimatedTime,
  columnId,
}: CardPreviewPipProps) {
  const pipRef = useRef<Window | null>(null);
  const timeIntervalRef = useRef<number | null>(null);
  const updateTimeRef = useRef<(() => void) | null>(null);
  const [cardState, setCardState] = useState(card);

  // Update the local card state when the prop changes
  useEffect(() => {
    setCardState(card);
  }, [card]);

  // Effect to update PiP window when card state or elapsed time changes
  useEffect(() => {
    if (pipRef.current && !pipRef.current.closed && updateTimeRef.current) {
      updateTimeRef.current();
    }
  }, [cardState, currentElapsedTime.value]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current);
        timeIntervalRef.current = null;
      }

      if (pipRef.current) {
        pipRef.current.close();
        pipRef.current = null;
      }
    };
  }, []);

  interface IPipWindow extends Window {
    documentPictureInPicture: {
      requestWindow(
        options: { width: number; height: number },
      ): Promise<Window>;
    };
  }

  const openPictureInPicture = async () => {
    if (pipRef.current) {
      pipRef.current.close();
      pipRef.current = null;
      return;
    }

    if (!("documentPictureInPicture" in window)) {
      console.error("Picture-in-Picture API not supported");
      return;
    }

    const documentPictureInPicture =
      (window as IPipWindow).documentPictureInPicture;

    // Fixed size for non-resizable PiP window
    const pipWindow = await documentPictureInPicture.requestWindow({
      width: 380,
      height: 208,
    });

    pipRef.current = pipWindow;

    const style = document.createElement("style");
    style.textContent = `
        body {
          margin: 0;
          background-color: #f9fafb;
          font-family: system-ui, -apple-system, sans-serif;
          overflow: hidden;
        }
        .pip-card {
          height: 100%;
          display: flex;
          flex-direction: column;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          background-color: white;
        }
        .dark .pip-card {
          background-color: #1f2937;
          color: white;
        }
        .pip-header {
          padding: 10px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .dark .pip-header {
          border-color: #374151;
        }
        .pip-title {
          font-weight: 600;
          font-size: 14px;
          margin: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .pip-content {
          flex: 1;
          padding: 10px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        .pip-time {
          font-size: 32px;
          font-weight: 600;
          margin-bottom: 10px;
        }
        .pip-status {
          font-size: 14px;
          color: #6b7280;
        }
        .dark .pip-status {
          color: #9ca3af;
        }
        .tracking {
          color: #10b981;
        }
        .dark .tracking {
          color: #34d399;
        }
        .exceeded {
          color: #ef4444;
        }
        .dark .exceeded {
          color: #f87171;
        }
        .warning {
          color: #f59e0b;
        }
        .dark .warning {
          color: #fbbf24;
        }
        .pip-controls {
          display: flex;
          gap: 8px;
          margin-top: 10px;
        }
        .pip-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 6px;
          background-color: #f3f4f6;
          cursor: pointer;
          transition: all 0.2s;
        }
        .dark .pip-button {
          background-color: #374151;
        }
        .pip-button:hover {
          background-color: #e5e7eb;
        }
        .dark .pip-button:hover {
          background-color: #4b5563;
        }
        .pip-button.tracking {
          background-color: #d1fae5;
          color: #059669;
        }
        .dark .pip-button.tracking {
          background-color: rgba(16, 185, 129, 0.2);
          color: #34d399;
        }
        .pip-estimated-time {
          font-size: 14px;
          color: #9ca3af;
          margin-top: 4px;
        }
        .pip-progress-container {
          width: 100%;
          height: 4px;
          background-color: #e5e7eb;
          border-radius: 2px;
          margin-top: 16px;
          overflow: hidden;
        }
        .dark .pip-progress-container {
          background-color: #4b5563;
        }
        .pip-progress-bar {
          height: 100%;
          background-color: #10b981;
          transition: width 0.3s ease;
        }
        .pip-progress-bar.warning {
          background-color: #f59e0b;
        }
        .pip-progress-bar.exceeded {
          background-color: #ef4444;
        }
      `;

    pipWindow.document.head.appendChild(style);

    const prefersDarkMode =
      globalThis.matchMedia("(prefers-color-scheme: dark)").matches;
    if (prefersDarkMode) {
      pipWindow.document.body.classList.add("dark");
    }

    const pipCard = document.createElement("div");
    pipCard.className = "pip-card";

    const pipHeader = document.createElement("div");
    pipHeader.className = "pip-header";

    const pipTitle = document.createElement("h1");
    pipTitle.className = "pip-title";
    pipTitle.textContent = card.title;

    pipHeader.appendChild(pipTitle);
    pipCard.appendChild(pipHeader);

    const pipContent = document.createElement("div");
    pipContent.className = "pip-content";

    const pipTime = document.createElement("div");
    pipTime.className = "pip-time";

    const pipStatus = document.createElement("div");
    pipStatus.className = "pip-status";
    pipStatus.textContent = card.isTracking ? "Tracking" : "Not tracking";
    if (card.isTracking) {
      pipStatus.classList.add("tracking");
    }

    // Add estimated time if available
    if (card.estimatedTime) {
      const pipEstimatedTime = document.createElement("div");
      pipEstimatedTime.className = "pip-estimated-time";
      pipEstimatedTime.textContent = `Estimated: ${
        formatTime(card.estimatedTime * 60)
      }`;
      pipContent.appendChild(pipEstimatedTime);
    }

    // Add progress bar if estimated time is available
    if (card.estimatedTime) {
      const progressContainer = document.createElement("div");
      progressContainer.className = "pip-progress-container";

      const progressBar = document.createElement("div");
      progressBar.className = "pip-progress-bar";
      progressBar.id = "pip-progress-bar";

      progressContainer.appendChild(progressBar);
      pipContent.appendChild(progressContainer);
    }

    // Add tracking controls
    const pipControls = document.createElement("div");
    pipControls.className = "pip-controls";

    const trackButton = document.createElement("button");
    trackButton.className = `pip-button ${card.isTracking ? "tracking" : ""}`;
    trackButton.innerHTML = card.isTracking
      ? '<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
      : '<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';

    trackButton.addEventListener("click", () => {
      if (card.id) {
        handleCardTracking(columnId, card.id);
        // Update local state immediately for better UX
        setCardState((prev) => ({
          ...prev,
          isTracking: !prev.isTracking,
          lastTrackingStart: !prev.isTracking
            ? Date.now()
            : prev.lastTrackingStart,
        }));
      }
    });

    pipControls.appendChild(trackButton);

    pipContent.appendChild(pipTime);
    pipContent.appendChild(pipStatus);
    pipContent.appendChild(pipControls);
    pipCard.appendChild(pipContent);

    pipWindow.document.body.appendChild(pipCard);

    const updateTime = () => {
      if (!pipWindow || pipWindow.closed) return;

      // Get the latest card state
      const currentCard = cardState;

      // Calculate current elapsed time
      let displayTime = currentCard.timeSpent ?? 0;
      if (currentCard.isTracking && currentCard.lastTrackingStart) {
        displayTime += getElapsedTime(currentCard.lastTrackingStart);
      }

      // Update time display
      pipTime.textContent = formatTime(displayTime || 0);

      // Update status text and class
      pipStatus.textContent = currentCard.isTracking
        ? "Tracking"
        : "Not tracking";
      pipStatus.className = "pip-status";

      // Apply color based on time status
      if (hasExceededEstimatedTime(currentCard)) {
        pipStatus.classList.add("exceeded");
      } else if (
        currentCard.estimatedTime && displayTime &&
        displayTime >= (currentCard.estimatedTime * 60) / 2
      ) {
        pipStatus.classList.add("warning");
      } else if (currentCard.isTracking) {
        pipStatus.classList.add("tracking");
      }

      // Update tracking button
      const trackButton = pipControls.querySelector(".pip-button");
      if (trackButton) {
        trackButton.className = `pip-button ${
          currentCard.isTracking ? "tracking" : ""
        }`;
        trackButton.innerHTML = currentCard.isTracking
          ? '<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
          : '<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
      }

      // Update progress bar if estimated time exists
      if (currentCard.estimatedTime) {
        const progressBar = document.getElementById("pip-progress-bar");
        if (progressBar) {
          const percentage = Math.min(
            ((displayTime || 0) / (currentCard.estimatedTime * 60)) * 100,
            100,
          );
          progressBar.style.width = `${percentage}%`;

          // Reset classes
          progressBar.className = "pip-progress-bar";

          // Add appropriate class based on progress
          if (percentage >= 100) {
            progressBar.classList.add("exceeded");
          } else if (percentage >= 50) {
            progressBar.classList.add("warning");
          }
        }
      }
    };

    // Store the updateTime function in the ref so it can be called from outside
    updateTimeRef.current = updateTime;

    // Initial update
    updateTime();

    // Set up interval for regular updates
    timeIntervalRef.current = globalThis.setInterval(updateTime, 1000);

    // Clean up when PiP window is closed
    pipWindow.addEventListener("unload", () => {
      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current);
        timeIntervalRef.current = null;
      }
      updateTimeRef.current = null;
      pipRef.current = null;
    });
  };

  return {
    isPipOpen: !!pipRef.current,
    openPictureInPicture,
  };
}
