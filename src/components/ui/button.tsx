import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-[var(--radius)] border border-transparent text-sm font-semibold whitespace-nowrap transition-all duration-150 outline-none select-none cursor-pointer focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // Default Primary: Theme Crimson
        default:
          "bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs hover:shadow-sm active:scale-[0.98]",

        // Secondary: Theme Olive Green
        secondary:
          "bg-secondary hover:bg-secondary/85 text-secondary-foreground shadow-xs active:scale-[0.98]",

        // Accent: Theme Steel Blue
        accent:
          "bg-accent hover:bg-accent/90 text-accent-foreground shadow-xs active:scale-[0.98]",

        // Destructive: Theme Orange/Amber
        destructive:
          "bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-xs active:scale-[0.98]",

        // Outline: Theme Border
        outline:
          "border border-border bg-card text-foreground hover:bg-muted hover:text-foreground active:scale-[0.98]",

        // Ghost: Flat
        ghost:
          "hover:bg-muted hover:text-foreground active:scale-[0.98]",

        // Link
        link: "text-primary underline-offset-4 hover:underline",

        // Launch / Amber
        launch:
          "bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-xs hover:shadow-sm active:scale-[0.98]",

        amber:
          "bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-xs hover:shadow-sm active:scale-[0.98]",

        // Emerald alias
        emerald:
          "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs hover:shadow-sm active:scale-[0.98]",
      },
      size: {
        default: "h-9.5 gap-2 px-4 rounded-[var(--radius)] text-sm",
        xs: "h-7 gap-1 rounded-[var(--radius)] px-2 text-xs",
        sm: "h-8.5 gap-1.5 rounded-[var(--radius)] px-3 text-xs",
        lg: "h-11 gap-2.5 px-5 text-sm sm:text-base rounded-[var(--radius)] font-semibold",
        xl: "h-12.5 gap-3 px-6 sm:px-8 text-base sm:text-lg rounded-[var(--radius)] font-bold",
        icon: "size-9 rounded-[var(--radius)]",
        "icon-xs": "size-6 rounded-[var(--radius)]",
        "icon-sm": "size-8 rounded-[var(--radius)]",
        "icon-lg": "size-10 rounded-[var(--radius)]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
