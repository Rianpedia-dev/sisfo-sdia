// layout dashboard - from AnimateIcons / Lucide (https://animateicons.in)
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

export interface LayoutDashboardIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

export interface LayoutDashboardIconProps
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

const LayoutDashboardIcon = forwardRef<
  LayoutDashboardIconHandle,
  LayoutDashboardIconProps
>(
  (
    {
      onMouseEnter,
      onMouseLeave,
      className,
      size = 24,
      duration = 0.6,
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
        if (!isControlled.current) controls.start("animate");
        else onMouseEnter?.(e as any);
      },
      [controls, reduced, isAnimated, onMouseEnter]
    );

    const handleLeave = useCallback(
      (e?: React.MouseEvent<HTMLDivElement>) => {
        if (!isControlled.current) controls.start("normal");
        else onMouseLeave?.(e as any);
      },
      [controls, onMouseLeave]
    );

    // Trigger animation when parent menu item is hovered
    useEffect(() => {
      if (isHovered && isAnimated && !reduced) {
        controls.start("animate");
      }
    }, [isHovered, isAnimated, reduced, controls]);

    // Auto-animate every 2 minutes (120,000ms)
    useEffect(() => {
      if (!isAnimated || reduced) return;

      const initialTimer = setTimeout(() => {
        if (!isControlled.current) {
          controls.start("animate");
        }
      }, 700);

      const interval = setInterval(() => {
        if (!isControlled.current) {
          controls.start("animate");
        }
      }, 120000); // 2 minutes

      return () => {
        clearTimeout(initialTimer);
        clearInterval(interval);
      };
    }, [controls, isAnimated, reduced]);

    const iconVariants: Variants = {
      normal: { scale: 1, rotate: 0 },
      animate: {
        scale: [1, 1.06, 0.98, 1],
        rotate: [0, -1.5, 1.5, 0],
        transition: { duration: 1.1 * duration, ease: "easeInOut" },
      },
    };

    const tileVariants: Variants = {
      normal: { opacity: 1, scale: 1, y: 0 },
      animate: (i: number) => ({
        opacity: [0.6, 1],
        scale: [0.95, 1.04, 1],
        y: [3, -2, 0],
        transition: {
          duration: 0.9 * duration,
          ease: "easeInOut",
          delay: i * 0.08,
        },
      }),
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
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-full w-full"
            animate={controls}
            initial="normal"
            variants={iconVariants}
          >
            <m.rect
              width="7"
              height="9"
              x="3"
              y="3"
              rx="1"
              variants={tileVariants}
              custom={0}
              initial="normal"
              animate={controls}
            />
            <m.rect
              width="7"
              height="5"
              x="14"
              y="3"
              rx="1"
              variants={tileVariants}
              custom={1}
              initial="normal"
              animate={controls}
            />
            <m.rect
              width="7"
              height="9"
              x="14"
              y="12"
              rx="1"
              variants={tileVariants}
              custom={2}
              initial="normal"
              animate={controls}
            />
            <m.rect
              width="7"
              height="5"
              x="3"
              y="16"
              rx="1"
              variants={tileVariants}
              custom={3}
              initial="normal"
              animate={controls}
            />
          </m.svg>
        </m.div>
      </LazyMotion>
    );
  }
);

LayoutDashboardIcon.displayName = "LayoutDashboardIcon";
export { LayoutDashboardIcon };
