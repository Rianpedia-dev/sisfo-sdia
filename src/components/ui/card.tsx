"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Tiles } from "@/components/ui/tiles";

// ─── Card Background (Interactive Grid) ─────────────────────────────────────

function CardBackground({
  rows = 12,
  cols = 8,
  tileSize = "md",
  className,
}: {
  rows?: number;
  cols?: number;
  tileSize?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden pointer-events-none z-0 select-none opacity-25",
        className
      )}
      aria-hidden="true"
    >
      <Tiles rows={rows} cols={cols} tileSize={tileSize} />
    </div>
  );
}

// ─── Card ────────────────────────────────────────────────────────────────────

interface CardProps extends React.ComponentProps<"div"> {
  enableTiles?: boolean;
  tileRows?: number;
  tileCols?: number;
  tileSize?: "sm" | "md" | "lg";
  elevationSize?: "default" | "sm";
  enableHover?: boolean;
}

function Card({
  className,
  enableTiles = false,
  tileRows = 12,
  tileCols = 8,
  tileSize = "md",
  elevationSize = "default",
  enableHover = false,
  children,
  ...props
}: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(
        "card-elevation text-card-foreground relative overflow-hidden flex flex-col",
        enableHover && "card-elevation-hover",
        elevationSize === "sm" && "card-elevation-sm",
        className
      )}
      {...props}
    >
      {enableTiles && (
        <CardBackground rows={tileRows} cols={tileCols} tileSize={tileSize} />
      )}
      <div className="relative z-10 flex-1 flex flex-col">{children}</div>
    </div>
  );
}

// ─── Card Sub-Components ─────────────────────────────────────────────────────

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 p-5 sm:p-6 pb-2 sm:pb-3 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-4",
        className
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-snug font-semibold text-base sm:text-lg tracking-tight text-foreground", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-xs sm:text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("p-5 sm:p-6 pt-0", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center p-5 sm:p-6 pt-0 [.border-t]:pt-4", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  CardBackground,
};

export default Card;

