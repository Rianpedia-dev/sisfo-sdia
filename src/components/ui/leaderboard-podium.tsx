"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Crown } from "lucide-react"

import { cn } from "@/lib/utils"
import { UserAvatar } from "@/components/ui/user-avatar"

// Types
interface LeaderboardRanking {
  userId: string
  userName: string | null
  rank: number
  value: number
  avatarUrl?: string | null
  gender?: string | null
}


// Variants
const podiumVariants = cva("flex items-end justify-center", {
  variants: {
    size: {
      sm: "gap-2 sm:gap-4",
      default: "gap-3 sm:gap-6 md:gap-8",
      lg: "gap-4 sm:gap-8 md:gap-12",
    },
  },
  defaultVariants: {
    size: "default",
  },
})

// Podium styles for each position
const PODIUM_CONFIG = {
  1: {
    icon: Crown,
    color: "text-rank-1",
    bg: "bg-rank-1/60 border-t-4 border-rank-1 shadow-lg shadow-rank-1/20",
    ringColor: "ring-rank-1/50",
    heightSm: "h-24 sm:h-28",
    heightDefault: "h-36 sm:h-44 md:h-48",
    heightLg: "h-44 sm:h-52 md:h-60",
    avatarSm: "h-12 w-12 text-sm",
    avatarDefault: "h-16 w-16 sm:h-20 sm:w-20 ring-4 ring-rank-1/40",
    avatarLg: "h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 ring-4 ring-rank-1/50 shadow-md",
    crownBadgeSize: "h-6 w-6 sm:h-8 sm:w-8",
    crownIconSize: "h-3.5 w-3.5 sm:h-5 sm:w-5",
    crownColor: "text-amber-500",
  },
  2: {
    icon: Crown,
    color: "text-rank-2",
    bg: "bg-rank-2/30 border-t-4 border-rank-2/70 shadow-md",
    ringColor: "ring-rank-2/50",
    heightSm: "h-18 sm:h-20",
    heightDefault: "h-28 sm:h-32 md:h-36",
    heightLg: "h-32 sm:h-40 md:h-44",
    avatarSm: "h-10 w-10 text-xs",
    avatarDefault: "h-14 w-14 sm:h-16 sm:w-16 ring-2 ring-rank-2/40",
    avatarLg: "h-16 w-16 sm:h-20 sm:w-20 md:h-22 md:w-22 ring-4 ring-rank-2/40 shadow-sm",
    crownBadgeSize: "h-5 w-5 sm:h-7 sm:w-7",
    crownIconSize: "h-3 w-3 sm:h-4 sm:w-4",
    crownColor: "text-slate-400 dark:text-slate-300",
  },
  3: {
    icon: Crown,
    color: "text-rank-3",
    bg: "bg-rank-3/50 border-t-4 border-rank-3/70 shadow-md",
    ringColor: "ring-rank-3/50",
    heightSm: "h-14 sm:h-16",
    heightDefault: "h-20 sm:h-24 md:h-28",
    heightLg: "h-24 sm:h-30 md:h-34",
    avatarSm: "h-10 w-10 text-xs",
    avatarDefault: "h-14 w-14 sm:h-16 sm:w-16 ring-2 ring-rank-3/40",
    avatarLg: "h-16 w-16 sm:h-20 sm:w-20 md:h-22 md:w-22 ring-4 ring-rank-3/40 shadow-sm",
    crownBadgeSize: "h-5 w-5 sm:h-7 sm:w-7",
    crownIconSize: "h-3 w-3 sm:h-4 sm:w-4",
    crownColor: "text-amber-700 dark:text-amber-500",
  },
} as const

// Props
interface LeaderboardPodiumProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof podiumVariants> {
  /** Top 3 rankings (expects at least 1, ideally 3) */
  rankings: LeaderboardRanking[]
  /** Show value below name */
  showValue?: boolean
  /** Show avatar */
  showAvatar?: boolean
  /** Crown badge style variant */
  medalStyle?: "classic" | "modern" | "minimal"
  /** Optional suffix for value display, e.g. "Poin" */
  valueSuffix?: string
}

const LeaderboardPodium = React.forwardRef<
  HTMLDivElement,
  LeaderboardPodiumProps
>(
  (
    {
      className,
      size = "default",
      rankings,
      showValue = true,
      showAvatar = true,
      medalStyle = "modern",
      valueSuffix,
      ...props
    },
    ref
  ) => {
    // Get top 3, reorder for podium display: 2nd, 1st, 3rd
    const top3 = rankings.slice(0, 3)
    const podiumOrder = [
      top3.find((r) => r.rank === 2),
      top3.find((r) => r.rank === 1),
      top3.find((r) => r.rank === 3),
    ].filter(Boolean) as LeaderboardRanking[]

    if (podiumOrder.length === 0) {
      return null
    }

    const pillarWidth = {
      sm: "w-20 sm:w-24",
      default: "w-24 sm:w-32 md:w-36",
      lg: "w-28 sm:w-36 md:w-44",
    }[size ?? "default"]

    const textSize = {
      sm: "text-xs",
      default: "text-xs sm:text-sm",
      lg: "text-xs sm:text-sm md:text-base",
    }[size ?? "default"]

    const rankNumberSize = {
      sm: "text-xl font-black",
      default: "text-2xl sm:text-3xl font-black",
      lg: "text-3xl sm:text-4xl md:text-5xl font-black",
    }[size ?? "default"]

    return (
      <div
        ref={ref}
        className={cn(podiumVariants({ size }), className)}
        role="list"
        aria-label="Top 3 rankings"
        {...props}
      >
        {podiumOrder.map((ranking) => {
          const config = PODIUM_CONFIG[ranking.rank as 1 | 2 | 3]
          if (!config) return null

          const displayName =
            ranking.userName || `User ${ranking.userId.slice(0, 6)}`
          const defaultAvatar =
            ranking.gender === "P" || ranking.gender?.toLowerCase() === "perempuan"
              ? "/profil-default-perempuan.avif"
              : "/profil-default-laki-laki.avif"
          const avatarSrc = ranking.avatarUrl || defaultAvatar

          const podiumHeight = {
            sm: config.heightSm,
            default: config.heightDefault,
            lg: config.heightLg,
          }[size ?? "default"]

          const avatarSize = {
            sm: config.avatarSm,
            default: config.avatarDefault,
            lg: config.avatarLg,
          }[size ?? "default"]

          const formattedValue = valueSuffix
            ? `${ranking.value.toLocaleString()} ${valueSuffix}`
            : ranking.value.toLocaleString()

          const itemLabel = `Rank ${ranking.rank}: ${displayName}${showValue ? `, ${formattedValue}` : ""}`

          return (
            <div
              key={ranking.userId}
              role="listitem"
              aria-label={itemLabel}
              className="flex flex-col items-center"
            >
              <div className="relative mb-2.5">
                {showAvatar ? (
                  <UserAvatar
                    src={avatarSrc}
                    gender={ranking.gender}
                    alt={displayName}
                    className={cn("rounded-full object-cover transition-transform duration-200 hover:scale-105", avatarSize)}
                  />
                ) : (
                  <div
                    className={cn(
                      "flex items-center justify-center rounded-full shadow-sm",
                      avatarSize,
                      config.bg
                    )}
                  >
                    <config.icon className={cn("size-6 sm:size-8", config.color)} />
                  </div>
                )}

                {/* Crown badge */}
                {medalStyle !== "minimal" && (
                  <div
                    className={cn(
                      "bg-background absolute -right-1 -bottom-1 flex items-center justify-center rounded-full shadow-md border-2 border-background",
                      config.crownBadgeSize
                    )}
                  >
                    <config.icon
                      className={cn(
                        config.crownColor,
                        config.crownIconSize
                      )}
                    />
                  </div>
                )}
              </div>

              {/* Name - Tidak Terpotong, Rapi & Elegan */}
              <div className={cn("min-h-[2.5rem] sm:min-h-[3rem] flex items-center justify-center px-1 my-1", pillarWidth)}>
                <span
                  className={cn(
                    "text-center font-bold leading-snug line-clamp-2 text-foreground break-words",
                    textSize
                  )}
                  title={displayName}
                >
                  {displayName}
                </span>
              </div>

              {/* Value / Points */}
              {showValue && (
                <div className="mt-0.5 mb-2.5 inline-flex items-center gap-1 rounded-full bg-muted/80 px-2.5 py-0.5 sm:px-3 sm:py-1 border border-border/50 text-xs sm:text-sm font-semibold text-foreground tabular-nums shadow-xs">
                  {formattedValue}
                </div>
              )}

              {/* Podium block */}
              <div
                aria-hidden="true"
                className={cn(
                  "mt-1 rounded-t-2xl shadow-inner transition-all flex flex-col items-center justify-start pt-3 sm:pt-4",
                  pillarWidth,
                  podiumHeight,
                  config.bg
                )}
              >
                <span
                  className={cn(
                    "drop-shadow-xs",
                    config.color,
                    rankNumberSize
                  )}
                >
                  {ranking.rank}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    )
  }
)
LeaderboardPodium.displayName = "LeaderboardPodium"

export { LeaderboardPodium, podiumVariants }
export type { LeaderboardPodiumProps, LeaderboardRanking }
