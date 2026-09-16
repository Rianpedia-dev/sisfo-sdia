"use client";

import { useState, useEffect, useRef, useCallback, type SVGProps } from "react";

export function ClipboardListIcon({
  size = 24,
  className,
  isHovered,
  ...props
}: SVGProps<SVGSVGElement> & { size?: number; isHovered?: boolean }) {
  const [animKey, setAnimKey] = useState(0);
  const lastTriggerRef = useRef(0);

  const replay = useCallback(() => {
    setAnimKey((prev) => prev + 1);
  }, []);

  // Replay when parent menu item is hovered
  useEffect(() => {
    if (isHovered) {
      replay();
    }
  }, [isHovered, replay]);

  useEffect(() => {
    // Replay animation every 2 minutes (120,000ms)
    const interval = setInterval(() => {
      replay();
    }, 120000);

    return () => clearInterval(interval);
  }, [replay]);

  const handleMouseEnter = () => {
    const now = Date.now();
    if (now - lastTriggerRef.current > 2500) {
      lastTriggerRef.current = now;
      replay();
    }
  };

  return (
    <svg
      key={animKey}
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={className}
      onMouseEnter={handleMouseEnter}
      {...props}
    >
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path strokeDasharray="66" strokeWidth="2" d="M12 3h7v18h-14v-18h7Z">
          <animate fill="freeze" attributeName="stroke-dashoffset" dur="0.6s" values="66;0" />
        </path>
        <path strokeDasharray="14" strokeDashoffset="14" d="M14.5 3.5v3h-5v-3">
          <animate fill="freeze" attributeName="stroke-dashoffset" begin="0.7s" dur="0.2s" to="0" />
        </path>
        <g strokeWidth="2">
          <path strokeDasharray="6" strokeDashoffset="6" d="M9 10h3">
            <animate fill="freeze" attributeName="stroke-dashoffset" begin="0.9s" dur="0.2s" to="0" />
          </path>
          <g strokeDasharray="8" strokeDashoffset="8">
            <path d="M9 13h5">
              <animate fill="freeze" attributeName="stroke-dashoffset" begin="1.1s" dur="0.2s" to="0" />
            </path>
            <path d="M9 16h6">
              <animate fill="freeze" attributeName="stroke-dashoffset" begin="1.3s" dur="0.2s" to="0" />
            </path>
          </g>
        </g>
      </g>
    </svg>
  );
}
