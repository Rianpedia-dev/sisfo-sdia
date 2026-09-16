import Link from "next/link";
import Image from "next/image";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  icon?: LucideIcon | React.ComponentType<{ className?: string; size?: number }>;
  imageSrc?: string;
  description?: string;
  variant?: "emerald" | "blue" | "amber" | "rose" | "purple" | "primary" | "secondary" | "accent";
  href?: string;
  valueClassName?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  imageSrc,
  description,
  variant = "primary",
  href,
  valueClassName,
}: StatCardProps) {
  const variantStyles = {
    // Primary: Crimson Red
    primary: {
      card: "border-primary/30 bg-card hover:border-primary hover:shadow-lg",
      glow: "bg-primary/20",
      iconBg: "bg-primary/10 text-primary border border-primary/30 shadow-xs",
      dot: "bg-primary shadow-xs",
      titleHover: "group-hover:text-primary",
      accent: "text-primary",
    },
    emerald: {
      card: "border-primary/30 bg-card hover:border-primary hover:shadow-lg",
      glow: "bg-primary/20",
      iconBg: "bg-primary/10 text-primary border border-primary/30 shadow-xs",
      dot: "bg-primary shadow-xs",
      titleHover: "group-hover:text-primary",
      accent: "text-primary",
    },
    // Accent: Steel Blue
    accent: {
      card: "border-accent/30 bg-card hover:border-accent hover:shadow-lg",
      glow: "bg-accent/20",
      iconBg: "bg-accent/15 text-accent border border-accent/30 shadow-xs",
      dot: "bg-accent shadow-xs",
      titleHover: "group-hover:text-accent",
      accent: "text-accent",
    },
    blue: {
      card: "border-accent/30 bg-card hover:border-accent hover:shadow-lg",
      glow: "bg-accent/20",
      iconBg: "bg-accent/15 text-accent border border-accent/30 shadow-xs",
      dot: "bg-accent shadow-xs",
      titleHover: "group-hover:text-accent",
      accent: "text-accent",
    },
    // Secondary: Olive Green
    secondary: {
      card: "border-secondary/30 bg-card hover:border-secondary hover:shadow-lg",
      glow: "bg-secondary/20",
      iconBg: "bg-secondary/15 text-secondary border border-secondary/30 shadow-xs",
      dot: "bg-secondary shadow-xs",
      titleHover: "group-hover:text-secondary",
      accent: "text-secondary",
    },
    // Destructive: Amber / Orange
    amber: {
      card: "border-destructive/30 bg-card hover:border-destructive hover:shadow-lg",
      glow: "bg-destructive/20",
      iconBg: "bg-destructive/15 text-destructive border border-destructive/30 shadow-xs",
      dot: "bg-destructive shadow-xs",
      titleHover: "group-hover:text-destructive",
      accent: "text-destructive",
    },
    rose: {
      card: "border-primary/40 bg-card hover:border-primary hover:shadow-lg",
      glow: "bg-primary/20",
      iconBg: "bg-primary/15 text-primary border border-primary/30 shadow-xs",
      dot: "bg-primary shadow-xs",
      titleHover: "group-hover:text-primary",
      accent: "text-primary",
    },
    purple: {
      card: "border-border bg-card hover:border-accent hover:shadow-lg",
      glow: "bg-accent/15",
      iconBg: "bg-muted text-foreground border border-border shadow-xs",
      dot: "bg-accent shadow-xs",
      titleHover: "group-hover:text-accent",
      accent: "text-accent",
    },
  };

  const current = variantStyles[variant as keyof typeof variantStyles] || variantStyles.primary;

  const cardContent = (
    <Card
      className={cn(
        "group relative overflow-hidden rounded-xl border transition-all duration-300 h-full",
        href
          ? "cursor-pointer hover:-translate-y-1 hover:shadow-lg active:scale-[0.99]"
          : "hover:-translate-y-0.5 hover:shadow-sm",
        current.card
      )}
    >
      {/* Ambient background glow */}
      <div
        className={cn(
          "pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full blur-2xl transition-opacity duration-300 opacity-50 group-hover:opacity-100",
          current.glow
        )}
      />

      <CardContent className="relative p-4 sm:p-5 flex flex-col justify-between h-full">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", current.dot)} />
              <p
                className={cn(
                  "text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate transition-colors",
                  href && current.titleHover
                )}
              >
                {title}
              </p>
            </div>
            <div
              className={cn(
                "tracking-tight text-foreground",
                valueClassName || "text-xl sm:text-2xl lg:text-3xl font-extrabold truncate"
              )}
              title={typeof value === "string" ? value : undefined}
            >
              {value}
            </div>
          </div>

          {Icon ? (
            <div
              className={cn(
                "flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3",
                current.iconBg
              )}
            >
              <span className="menu-icon-wrapper shrink-0 flex items-center justify-center">
                <Icon className="h-5 w-5 sm:h-6 sm:w-6 stroke-[2.2]" />
              </span>
            </div>
          ) : imageSrc ? (
            <div className="relative h-11 w-11 sm:h-12 sm:w-12 shrink-0 rounded-xl overflow-hidden border border-border bg-muted/60 flex items-center justify-center shadow-xs">
              <Image
                src={imageSrc}
                alt={title}
                fill
                sizes="48px"
                className="object-contain p-1.5 transition-transform duration-300 group-hover:scale-110"
              />
            </div>
          ) : null}
        </div>

        {description && (
          <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-muted-foreground truncate">
              {description}
            </p>
            {href && (
              <span className={cn("text-[11px] font-semibold flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0", current.accent)}>
                Lihat &rarr;
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block group focus:outline-hidden h-full">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
