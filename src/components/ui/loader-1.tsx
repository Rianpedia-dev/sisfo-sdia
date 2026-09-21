import React from "react";
import { cn } from "@/lib/utils";

export interface PencilLoaderProps {
  className?: string;
  size?: "sm" | "md" | "lg" | number;
}

export function PencilLoader({ className, size = "md" }: PencilLoaderProps) {
  const sizeMap = {
    sm: "h-24 w-24",
    md: "h-36 w-36 sm:h-44 sm:w-44",
    lg: "h-52 w-52 sm:h-60 sm:w-60",
  };

  const sizeClass = typeof size === "string" ? sizeMap[size] || sizeMap.md : "";
  const customStyle = typeof size === "number" ? { width: `${size}px`, height: `${size}px` } : undefined;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      className={cn("pencil drop-shadow-sm select-none", sizeClass, className)}
      style={customStyle}
      aria-label="Memuat..."
      role="status"
    >
      <defs>
        <clipPath id="pencil-eraser">
          <rect height="30" width="30" ry="5" rx="5" />
        </clipPath>
      </defs>
      <circle
        transform="rotate(-113,100,100)"
        strokeLinecap="round"
        strokeDashoffset="439.82"
        strokeDasharray="439.82 439.82"
        strokeWidth="2"
        stroke="currentColor"
        fill="none"
        r="70"
        className="pencil__stroke text-primary/70"
      />
      <g transform="translate(100,100)" className="pencil__rotate">
        <g fill="none">
          <circle
            transform="rotate(-90)"
            strokeDashoffset="402"
            strokeDasharray="402.12 402.12"
            strokeWidth="30"
            stroke="hsl(223,90%,50%)"
            r="64"
            className="pencil__body1"
          />
          <circle
            transform="rotate(-90)"
            strokeDashoffset="465"
            strokeDasharray="464.96 464.96"
            strokeWidth="10"
            stroke="hsl(223,90%,60%)"
            r="74"
            className="pencil__body2"
          />
          <circle
            transform="rotate(-90)"
            strokeDashoffset="339"
            strokeDasharray="339.29 339.29"
            strokeWidth="10"
            stroke="hsl(223,90%,40%)"
            r="54"
            className="pencil__body3"
          />
        </g>
        <g transform="rotate(-90) translate(49,0)" className="pencil__eraser">
          <g className="pencil__eraser-skew">
            <rect height="30" width="30" ry="5" rx="5" fill="hsl(223,90%,70%)" />
            <rect clipPath="url(#pencil-eraser)" height="30" width="5" fill="hsl(223,90%,60%)" />
            <rect height="20" width="30" fill="hsl(223,10%,90%)" />
            <rect height="20" width="15" fill="hsl(223,10%,70%)" />
            <rect height="20" width="5" fill="hsl(223,10%,80%)" />
            <rect height="2" width="30" y="6" fill="hsla(223,10%,10%,0.2)" />
            <rect height="2" width="30" y="13" fill="hsla(223,10%,10%,0.2)" />
          </g>
        </g>
        <g transform="rotate(-90) translate(49,-30)" className="pencil__point">
          <polygon points="15 0,30 30,0 30" fill="hsl(33,90%,70%)" />
          <polygon points="15 0,6 30,0 30" fill="hsl(33,90%,50%)" />
          <polygon points="15 0,20 10,10 10" fill="hsl(223,10%,10%)" />
        </g>
      </g>
    </svg>
  );
}

export const Component = PencilLoader;
export default PencilLoader;
