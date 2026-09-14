import Link from "next/link";
import Image from "next/image";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  imageSrc?: string;
  description?: string;
  variant?: "emerald" | "blue" | "amber" | "rose" | "purple";
  href?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  imageSrc,
  description,
  variant = "emerald",
  href,
}: StatCardProps) {
  const variantStyles = {
    emerald: {
      card: "border-emerald-500/20 hover:border-emerald-500/50 hover:shadow-emerald-500/5",
      iconBg: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 ring-1 ring-emerald-500/20",
      titleHover: "group-hover:text-emerald-700 dark:group-hover:text-emerald-400",
    },
    blue: {
      card: "border-sky-500/20 hover:border-sky-500/50 hover:shadow-sky-500/5",
      iconBg: "bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 ring-1 ring-sky-500/20",
      titleHover: "group-hover:text-sky-700 dark:group-hover:text-sky-400",
    },
    amber: {
      card: "border-amber-500/20 hover:border-amber-500/50 hover:shadow-amber-500/5",
      iconBg: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 ring-1 ring-amber-500/20",
      titleHover: "group-hover:text-amber-700 dark:group-hover:text-amber-400",
    },
    rose: {
      card: "border-rose-500/20 hover:border-rose-500/50 hover:shadow-rose-500/5",
      iconBg: "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 ring-1 ring-rose-500/20",
      titleHover: "group-hover:text-rose-700 dark:group-hover:text-rose-400",
    },
    purple: {
      card: "border-purple-500/20 hover:border-purple-500/50 hover:shadow-purple-500/5",
      iconBg: "bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 ring-1 ring-purple-500/20",
      titleHover: "group-hover:text-purple-700 dark:group-hover:text-purple-400",
    },
  };

  const current = variantStyles[variant];

  const cardContent = (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-200",
        href
          ? "cursor-pointer hover:-translate-y-1 hover:shadow-md active:scale-[0.99]"
          : "hover:-translate-y-0.5 hover:shadow-sm",
        current.card
      )}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <p
              className={cn(
                "text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate transition-colors",
                href && current.titleHover
              )}
            >
              {title}
            </p>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground truncate">
              {value}
            </div>
            {description && <p className="text-xs text-muted-foreground truncate">{description}</p>}
          </div>
          {imageSrc ? (
            <div className="flex shrink-0 items-center justify-center">
              <Image
                src={imageSrc}
                alt={title}
                width={64}
                height={64}
                className={cn(
                  "h-12 w-12 sm:h-14 sm:w-14 object-contain drop-shadow-xs transition-transform duration-200",
                  href ? "group-hover:scale-110" : "hover:scale-105"
                )}
              />
            </div>
          ) : Icon ? (
            <div
              className={cn(
                "flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl transition-transform duration-200",
                href && "group-hover:scale-110",
                current.iconBg
              )}
            >
              <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block group focus:outline-hidden">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
