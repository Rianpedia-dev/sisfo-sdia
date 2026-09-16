// video - from AnimateIcons / Lucide (https://animateicons.in)
// Author: Avijit Dey (@avijit07x)
// License: MIT. Source: https://github.com/Avijit07x/animateicons
// Requires: framer-motion, a `cn` helper at @/lib/utils (clsx + tailwind-merge)
"use client";

import { cn } from "@/lib/utils";
import type { Variants } from "framer-motion";
import {
  LazyMotion,
  domMin,
  m,
  useAnimation,
  useReducedMotion,
} from "framer-motion";
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useEffect,
  type HTMLAttributes,
} from "react";

export interface VideoIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

export interface VideoIconProps
  extends Omit<
    HTMLAttributes<HTMLDivElement>,
    | "color"
    | "onDrag"
    | "onDragStart"
    | "onDragEnd"
    | "onAnimationStart"
    | "onAnimationEnd"
    | "onAnimationIteration"
  > {
  size?: number;
  duration?: number;
  isAnimated?: boolean;
  color?: string;
  isHovered?: boolean;
}

const VideoIcon = forwardRef<VideoIconHandle, VideoIconProps>(
  (
    {
      onMouseEnter,
      onMouseLeave,
      className,
      size = 24,
      duration = 1,
      isAnimated = true,
      color,
      isHovered,
      ...props
    },
    ref
  ) => {
    const controls = useAnimation();
    const reduced = useReducedMotion();
    const isControlled = useRef(false);

    const start = useCallback(() => {
      if (reduced) return;
      controls.start("pan");
    }, [controls, reduced]);

    const stop = useCallback(() => {
      controls.start("rest");
    }, [controls]);

    useImperativeHandle(ref, () => {
      isControlled.current = true;
      return {
        startAnimation: start,
        stopAnimation: stop,
      };
    });

    const handleEnter = useCallback(
      (e?: React.MouseEvent<HTMLDivElement>) => {
        if (!isAnimated || reduced) return;
        if (!isControlled.current) start();
        else onMouseEnter?.(e as any);
      },
      [isAnimated, reduced, start, onMouseEnter]
    );

    const handleLeave = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isControlled.current) stop();
        else onMouseLeave?.(e);
      },
      [stop, onMouseLeave]
    );

    // Trigger animation when parent menu item is hovered
    useEffect(() => {
      if (isHovered && isAnimated && !reduced) {
        start();
      }
    }, [isHovered, isAnimated, reduced, start]);

    const cameraVariants: Variants = {
      rest: { rotate: 0 },
      pan: {
        rotate: [0, -6, -6, 2.5, 0],
        transition: {
          duration: 0.75 * duration,
          ease: "easeInOut",
          times: [0, 0.32, 0.5, 0.8, 1],
        },
      },
    };

    return (
      <LazyMotion features={domMin} strict>
        <m.div
          className={cn("inline-flex items-center justify-center", className)}
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
          {...props}
          style={{ color, ...props.style }}
        >
          <m.svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-full w-full"
            animate={controls}
            initial="rest"
          >
            <m.g
              variants={cameraVariants}
              style={{
                transformBox: "view-box",
                originX: "9px",
                originY: "18px",
              }}
            >
              <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5" />
              <rect x="2" y="6" width="14" height="12" rx="2" />
            </m.g>
          </m.svg>
        </m.div>
      </LazyMotion>
    );
  }
);

VideoIcon.displayName = "VideoIcon";
export { VideoIcon };
