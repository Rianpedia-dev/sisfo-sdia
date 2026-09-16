// notification - from AnimateIcons / Hugeicons (https://animateicons.in)
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

export interface NotificationIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

export interface NotificationIconProps
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
  strokeWidth?: number;
  duration?: number;
  isAnimated?: boolean;
  color?: string;
  isHovered?: boolean;
}

const NotificationIcon = forwardRef<
  NotificationIconHandle,
  NotificationIconProps
>(
  (
    {
      onMouseEnter,
      onMouseLeave,
      className,
      size = 24,
      strokeWidth = 2,
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

    useImperativeHandle(ref, () => {
      isControlled.current = true;
      return {
        startAnimation: () =>
          reduced ? controls.start("normal") : controls.start("animate"),
        stopAnimation: () => controls.start("normal"),
      };
    });

    const handleEnter = useCallback(
      (e?: React.MouseEvent<HTMLDivElement>) => {
        if (!isAnimated || reduced) return;
        controls.start("animate");
        onMouseEnter?.(e as any);
      },
      [controls, reduced, isAnimated, onMouseEnter]
    );

    const handleLeave = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isControlled.current) {
          controls.start("normal");
        }
        onMouseLeave?.(e as any);
      },
      [controls, onMouseLeave]
    );

    // Trigger animation when parent is hovered
    useEffect(() => {
      if (isHovered && isAnimated && !reduced) {
        controls.start("animate");
      }
    }, [isHovered, isAnimated, reduced, controls]);

    const bellVariants: Variants = {
      normal: { rotate: 0 },
      animate: {
        rotate: [0, 7, -18, 14, -9, 5, -2, 0],
        transition: {
          duration: 1.3 * duration,
          ease: "easeInOut",
          times: [0, 0.09, 0.26, 0.45, 0.62, 0.78, 0.9, 1],
        },
      },
    };

    const clapperVariants: Variants = {
      normal: { x: 0 },
      animate: {
        x: [0, 1.5, -5, 4, -2.5, 1.5, -1, 0],
        transition: {
          duration: 1.3 * duration,
          ease: "easeInOut",
          times: [0, 0.09, 0.26, 0.45, 0.62, 0.78, 0.9, 1],
          delay: 0.08 * duration,
        },
      },
    };

    return (
      <LazyMotion features={domMin} strict>
        <m.div
          className={cn("relative inline-flex items-center justify-center", className)}
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
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-full w-full"
            animate={controls}
            initial="normal"
            variants={bellVariants}
            style={{ originX: 0.5, originY: 0.12 }}
          >
            <m.path
              d="M15.5 18C15.5 19.933 13.933 21.5 12 21.5C10.067 21.5 8.5 19.933 8.5 18"
              variants={clapperVariants}
            />
            <path d="M19.2311 18H4.76887C3.79195 18 3 17.208 3 16.2311C3 15.762 3.18636 15.3121 3.51809 14.9803L4.12132 14.3771C4.68393 13.8145 5 13.0514 5 12.2558V9.5C5 5.63401 8.13401 2.5 12 2.5C15.866 2.5 19 5.634 19 9.5V12.2558C19 13.0514 19.3161 13.8145 19.8787 14.3771L20.4819 14.9803C20.8136 15.3121 21 15.762 21 16.2311C21 17.208 20.208 18 19.2311 18Z" />
          </m.svg>
        </m.div>
      </LazyMotion>
    );
  }
);

NotificationIcon.displayName = "NotificationIcon";
export { NotificationIcon };
