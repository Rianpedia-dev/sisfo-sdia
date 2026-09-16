"use client";

import { useState, useEffect, useRef, useCallback, type SVGProps } from "react";

export function ClipboardCheckIcon({
  size = 24,
  className,
  isHovered,
  onMouseEnter,
  ...props
}: SVGProps<SVGSVGElement> & { size?: number; isHovered?: boolean }) {
  const [animKey, setAnimKey] = useState(0);
  const lastTriggerRef = useRef(0);

  const replay = useCallback(() => {
    setAnimKey((prev) => prev + 1);
  }, []);

  // Replay when parent menu item is hovered (icon or name)
  useEffect(() => {
    if (isHovered) {
      replay();
    }
  }, [isHovered, replay]);

  const handleMouseEnter = (e: React.MouseEvent<SVGSVGElement>) => {
    const now = Date.now();
    if (now - lastTriggerRef.current > 1200) {
      lastTriggerRef.current = now;
      replay();
    }
    onMouseEnter?.(e);
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
      <g
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          strokeDasharray="66"
          strokeDashoffset="66"
          strokeWidth="2"
          d="M12 3h7v18h-14v-18h7Z"
        >
          <animate
            fill="freeze"
            attributeName="stroke-dashoffset"
            dur="0.6s"
            values="66;0"
          />
        </path>
        <path
          strokeDasharray="14"
          strokeDashoffset="14"
          d="M14.5 3.5v3h-5v-3"
        >
          <animate
            fill="freeze"
            attributeName="stroke-dashoffset"
            begin="0.7s"
            dur="0.2s"
            to="0"
          />
        </path>
        <path
          strokeDasharray="12"
          strokeDashoffset="12"
          strokeWidth="2"
          d="M9 13l2 2l4 -4"
        >
          <animate
            fill="freeze"
            attributeName="stroke-dashoffset"
            begin="0.9s"
            dur="0.2s"
            to="0"
          />
        </path>
      </g>
    </svg>
  );
}
