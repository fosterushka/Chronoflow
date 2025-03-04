import { JSX } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";

interface TooltipProps {
  text: string;
  children: JSX.Element;
  className?: string;
}

export default function Tooltip(
  { text, children, className = "" }: TooltipProps,
) {
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    placement: "bottom",
  });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const calculatePosition = () => {
      if (!tooltipRef.current || !containerRef.current) return;

      const tooltip = tooltipRef.current;
      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();

      const viewportWidth = globalThis.innerWidth;
      const viewportHeight = globalThis.innerHeight;

      // Default bottom placement
      let placement = "bottom";
      let top = containerRect.bottom + 8; // 8px gap
      let left = containerRect.left + (containerRect.width / 2) -
        (tooltipRect.width / 2);

      // Check if tooltip would go below viewport
      if (top + tooltipRect.height > viewportHeight) {
        // Place above if there's room
        top = containerRect.top - tooltipRect.height - 8;
        placement = "top";
      }

      // Check horizontal overflow
      if (left + tooltipRect.width > viewportWidth) {
        // Align to right
        left = viewportWidth - tooltipRect.width - 8;
      }

      // Check left overflow
      if (left < 8) {
        // Align to left
        left = 8;
      }

      setPosition({ top, left, placement });
    };

    // Initial calculation
    calculatePosition();

    // Recalculate on resize
    globalThis.addEventListener("resize", calculatePosition);

    // Recalculate after a short delay to ensure proper positioning
    const timeout = setTimeout(calculatePosition, 100);

    return () => {
      globalThis.removeEventListener("resize", calculatePosition);
      clearTimeout(timeout);
    };
  }, [text]); // Recalculate when text changes as it might affect tooltip size

  return (
    <div ref={containerRef} class="relative group">
      {children}
      <div
        ref={tooltipRef}
        class={`fixed px-2 py-1 bg-gray-900/90 text-white text-xs rounded
          opacity-0 invisible group-hover:opacity-100 group-hover:visible
          transition-all whitespace-nowrap z-50 pointer-events-none
          ${className}`}
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
      >
        {text}
      </div>
    </div>
  );
}
