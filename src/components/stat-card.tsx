import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  variant?: "emerald" | "blue" | "amber" | "rose" | "purple";
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  variant = "emerald",
}: StatCardProps) {
  const variantStyles = {
    emerald: {
      card: "border-emerald-500/30 dark:border-emerald-500/20 bg-gradient-to-br from-emerald-500/15 via-card/90 to-card/75",
      iconBg: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/30",
    },
    blue: {
      card: "border-sky-500/30 dark:border-sky-500/20 bg-gradient-to-br from-sky-500/15 via-card/90 to-card/75",
      iconBg: "bg-sky-500/20 text-sky-700 dark:text-sky-300 ring-1 ring-sky-500/30",
    },
    amber: {
      card: "border-amber-500/30 dark:border-amber-500/20 bg-gradient-to-br from-amber-500/15 via-card/90 to-card/75",
      iconBg: "bg-amber-500/20 text-amber-700 dark:text-amber-300 ring-1 ring-amber-500/30",
    },
    rose: {
      card: "border-rose-500/30 dark:border-rose-500/20 bg-gradient-to-br from-rose-500/15 via-card/90 to-card/75",
      iconBg: "bg-rose-500/20 text-rose-700 dark:text-rose-300 ring-1 ring-rose-500/30",
    },
    purple: {
      card: "border-purple-500/30 dark:border-purple-500/20 bg-gradient-to-br from-purple-500/15 via-card/90 to-card/75",
      iconBg: "bg-purple-500/20 text-purple-700 dark:text-purple-300 ring-1 ring-purple-500/30",
    },
  };

  const current = variantStyles[variant];

  return (
    <Card className={cn("overflow-hidden py-0 gap-0 transition-all duration-300 hover:scale-[1.015]", current.card)}>
      <CardContent className="p-3.5 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <div className="space-y-0.5 sm:space-y-1 min-w-0">
            <p className="text-[11px] sm:text-xs font-medium uppercase tracking-wider text-muted-foreground truncate">{title}</p>
            <div className="text-xl sm:text-2xl font-bold tracking-tight truncate">{value}</div>
            {description && <p className="text-[11px] sm:text-xs text-muted-foreground truncate">{description}</p>}
          </div>
          <div className={cn("flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl", current.iconBg)}>
            <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
