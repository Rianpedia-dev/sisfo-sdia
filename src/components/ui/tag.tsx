"use client";

import * as React from "react";
import {
  Zap as IconBolt,
  CloudRain as IconCloudShowers,
  CircleDollarSign as IconCurrencyDollar,
  Flower2 as IconFlower2,
  Monitor as IconMonitor,
  Shield as IconShield,
} from "lucide-react";
import { motion, type HTMLMotionProps } from "framer-motion";

import { cn } from "@/lib/utils";

export type TagVariant =
  | "digital"
  | "finance"
  | "simple"
  | "fast"
  | "secure"
  | "fluid"
  | "emerald"
  | "primary"
  | "steel"
  | "olive";

export type TagSize = "xs" | "sm" | "md" | "lg";

type TagIcon = React.ComponentType<{ className?: string }>;

type TagVariantConfig = {
  label: string;
  icon: TagIcon;
  container: string;
  text: string;
  iconColor: string;
  shadowColor: string;
};

const TAG_VARIANTS = {
  primary: {
    label: "Primary",
    icon: IconBolt,
    container: "border-primary bg-primary/10 dark:bg-primary/20 dark:border-primary",
    text: "text-primary dark:text-primary-foreground",
    iconColor: "text-primary",
    shadowColor: "rgba(183,28,28,0.75)",
  },
  steel: {
    label: "Steel Blue",
    icon: IconMonitor,
    container: "border-accent bg-accent/10 dark:bg-accent/20 dark:border-accent",
    text: "text-accent dark:text-accent-foreground",
    iconColor: "text-accent",
    shadowColor: "rgba(70,130,180,0.75)",
  },
  olive: {
    label: "Olive",
    icon: IconFlower2,
    container: "border-secondary bg-secondary/10 dark:bg-secondary/20 dark:border-secondary",
    text: "text-secondary dark:text-secondary-foreground",
    iconColor: "text-secondary",
    shadowColor: "rgba(85,107,47,0.75)",
  },
  digital: {
    label: "Digital",
    icon: IconMonitor,
    container: "border-[#1e6ef0] bg-[#edf4ff] dark:bg-[#1e6ef0]/15 dark:border-[#1e6ef0]",
    text: "text-[#1560df] dark:text-[#60a5fa]",
    iconColor: "text-[#82abf5]",
    shadowColor: "rgba(30,110,240,0.85)",
  },
  finance: {
    label: "Finance",
    icon: IconCurrencyDollar,
    container: "border-[#10b877] bg-[#e8f8f2] dark:bg-[#10b877]/15 dark:border-[#10b877]",
    text: "text-[#07936a] dark:text-[#34d399]",
    iconColor: "text-[#22b37f]",
    shadowColor: "rgba(16,184,119,0.85)",
  },
  emerald: {
    label: "Al-Azhar",
    icon: IconFlower2,
    container: "border-primary bg-primary/10 dark:bg-primary/20 dark:border-primary",
    text: "text-primary dark:text-primary-foreground",
    iconColor: "text-primary",
    shadowColor: "rgba(183,28,28,0.75)",
  },
  simple: {
    label: "Simple",
    icon: IconFlower2,
    container: "border-[#8b5cf6] bg-[#f3efff] dark:bg-[#8b5cf6]/15 dark:border-[#8b5cf6]",
    text: "text-[#8456ef] dark:text-[#c084fc]",
    iconColor: "text-[#8e60f5]",
    shadowColor: "rgba(139,92,246,0.85)",
  },
  fast: {
    label: "Fast",
    icon: IconBolt,
    container: "border-[#ff7308] bg-[#fff3e7] dark:bg-[#ff7308]/15 dark:border-[#ff7308]",
    text: "text-[#d56a0f] dark:text-[#fb923c]",
    iconColor: "text-[#ff7a0f]",
    shadowColor: "rgba(255,115,8,0.85)",
  },
  secure: {
    label: "Secure",
    icon: IconShield,
    container: "border-[#2848a5] bg-[#e8eefc] dark:bg-[#2848a5]/15 dark:border-[#2848a5]",
    text: "text-[#193e9d] dark:text-[#93c5fd]",
    iconColor: "text-[#2848a5]",
    shadowColor: "rgba(40,72,165,0.85)",
  },
  fluid: {
    label: "Fluid",
    icon: IconCloudShowers,
    container: "border-[#11b9d8] bg-[#e6f8fc] dark:bg-[#11b9d8]/15 dark:border-[#11b9d8]",
    text: "text-[#0896b5] dark:text-[#38bdf8]",
    iconColor: "text-[#11b9d8]",
    shadowColor: "rgba(17,185,216,0.85)",
  },
} satisfies Record<TagVariant, TagVariantConfig>;

const sizeStyles: Record<
  TagSize,
  {
    container: string;
    icon: string;
    label: string;
    shadowOffset: { base: string; hover: string; tap: string };
  }
> = {
  xs: {
    container: "gap-1.5 rounded-[var(--radius)] border-[2px] px-2.5 py-1",
    icon: "size-3.5",
    label: "text-xs",
    shadowOffset: {
      base: "-2px 3px 0 0",
      hover: "-1px 1.5px 0 0",
      tap: "0px 0px 0 0",
    },
  },
  sm: {
    container: "gap-2 rounded-[var(--radius)] border-[2px] px-3 py-2",
    icon: "size-4",
    label: "text-base",
    shadowOffset: {
      base: "-2.5px 4.5px 0 0",
      hover: "-1.5px 2px 0 0",
      tap: "0px 0px 0 0",
    },
  },
  md: {
    container: "gap-3 rounded-[var(--radius)] border-[3px] px-4 py-2.5",
    icon: "size-5",
    label: "text-[2rem] leading-none",
    shadowOffset: {
      base: "-3px 6px 0 0",
      hover: "-1.5px 3px 0 0",
      tap: "0px 0px 0 0",
    },
  },
  lg: {
    container: "gap-4 rounded-[var(--radius)] border-[3px] px-5 py-3",
    icon: "size-6",
    label: "text-[2.25rem] leading-none",
    shadowOffset: {
      base: "-3.5px 7px 0 0",
      hover: "-2px 3.5px 0 0",
      tap: "0px 0px 0 0",
    },
  },
};

export interface TagProps extends Omit<HTMLMotionProps<"div">, "style"> {
  label?: React.ReactNode;
  variant?: TagVariant;
  size?: TagSize;
  icon?: React.ReactNode;
  animated?: boolean;
}

export type TagGroupItem = {
  id?: string;
  label?: string;
  variant: TagVariant;
  icon?: React.ReactNode;
};

export interface TagGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: TagGroupItem[];
  size?: TagSize;
  animated?: boolean;
  staggerDelay?: number;
}

export const defaultTagItems: TagGroupItem[] = [
  { variant: "digital" },
  { variant: "finance" },
  { variant: "simple" },
  { variant: "fast" },
  { variant: "secure" },
  { variant: "fluid" },
];

export const tagVariants = Object.keys(TAG_VARIANTS) as TagVariant[];

export function Tag({
  label,
  variant = "finance",
  size = "md",
  icon,
  animated = true,
  className,
  children,
  ...props
}: Readonly<TagProps>) {
  const config = TAG_VARIANTS[variant] || TAG_VARIANTS.finance;
  const sizeStyle = sizeStyles[size] || sizeStyles.md;
  const Icon = config.icon;
  const baseShadow = `${sizeStyle.shadowOffset.base} ${config.shadowColor}`;
  const hoverShadow = `${sizeStyle.shadowOffset.hover} ${config.shadowColor}`;
  const pressedShadow = `0px 0px 0 0 ${config.shadowColor}`;

  return (
    <motion.div
      initial={
        animated
          ? {
              x: 0,
              y: 0,
              boxShadow: baseShadow,
            }
          : undefined
      }
      animate={
        animated
          ? {
              x: 0,
              y: 0,
              boxShadow: baseShadow,
            }
          : undefined
      }
      whileHover={
        animated
          ? {
              x: -2,
              y: 3,
              boxShadow: hoverShadow,
            }
          : undefined
      }
      whileTap={
        animated
          ? {
              x: -4,
              y: 5,
              boxShadow: pressedShadow,
            }
          : undefined
      }
      transition={{ type: "spring", stiffness: 360, damping: 24, mass: 0.6 }}
      className={cn(
        "inline-flex w-fit items-center font-medium tracking-[-0.045em]",
        "select-none border-solid backdrop-blur-sm",
        sizeStyle.container,
        config.container,
        className
      )}
      {...props}
    >
      {children ? (
        children
      ) : (
        <>
          {icon !== null && (
            <motion.span
              animate={
                animated
                  ? {
                      rotate: [0, -4, 0],
                      y: [0, -2, 0],
                    }
                  : undefined
              }
              transition={{ duration: 3, ease: "easeInOut", repeat: Infinity }}
              className="inline-flex shrink-0 items-center justify-center"
            >
              {icon ?? <Icon className={cn(sizeStyle.icon, config.iconColor)} />}
            </motion.span>
          )}

          <span className={cn("truncate", sizeStyle.label, config.text)}>
            {label ?? config.label}
          </span>
        </>
      )}
    </motion.div>
  );
}

export function TagGroup({
  items = defaultTagItems,
  size = "md",
  animated = true,
  staggerDelay = 0.08,
  className,
  ...props
}: Readonly<TagGroupProps>) {
  return (
    <div
      className={cn("flex w-full flex-col items-start gap-10", className)}
      {...props}
    >
      {items.map((item, index) => {
        const key = item.id ?? `${item.variant}-${item.label ?? index}`;

        return (
          <motion.div
            key={key}
            initial={animated ? { opacity: 0, x: -18, scale: 0.96 } : false}
            animate={animated ? { opacity: 1, x: 0, scale: 1 } : undefined}
            transition={{
              delay: index * staggerDelay,
              duration: 0.45,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <Tag
              variant={item.variant}
              label={item.label}
              icon={item.icon}
              size={size}
              animated={animated}
            />
          </motion.div>
        );
      })}
    </div>
  );
}

export default Tag;
