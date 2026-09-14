"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface TilesProps {
  className?: string;
  rows?: number;
  cols?: number;
  tileClassName?: string;
  tileSize?: "sm" | "md" | "lg";
}

const tileSizes = {
  sm: "w-8 h-8",
  md: "w-9 h-9 md:w-12 md:h-12",
  lg: "w-12 h-12 md:w-16 md:h-16",
};

export function Tiles({
  className,
  rows = 15,
  cols = 8,
  tileClassName,
  tileSize = "md",
}: TilesProps) {
  const rowsArray = new Array(rows).fill(1);
  const colsArray = new Array(cols).fill(1);

  return (
    <div
      className={cn(
        "relative z-0 flex w-full h-full justify-center pointer-events-auto",
        className
      )}
    >
      {rowsArray.map((_, i) => (
        <motion.div
          key={`row-${i}`}
          className={cn(
            tileSizes[tileSize],
            "border-l border-neutral-300/50 relative shrink-0",
            tileClassName
          )}
        >
          {colsArray.map((_, j) => (
            <motion.div
              whileHover={{
                backgroundColor: `var(--tile, rgba(59, 130, 246, 0.12))`,
                transition: { duration: 0 },
              }}
              animate={{
                transition: { duration: 1.5 },
              }}
              key={`col-${j}`}
              className={cn(
                tileSizes[tileSize],
                "border-r border-t border-neutral-300/50 relative shrink-0",
                tileClassName
              )}
            />
          ))}
        </motion.div>
      ))}
    </div>
  );
}

export default Tiles;
