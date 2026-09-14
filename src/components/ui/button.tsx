import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl border border-transparent text-sm font-semibold whitespace-nowrap transition-all duration-150 outline-none select-none cursor-pointer focus-visible:ring-3 focus-visible:ring-emerald-500/30 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // Default Primary: Clean Emerald (Identitas Resmi Al-Azhar)
        default:
          "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs hover:shadow-sm active:scale-[0.98]",

        // Launch / Amber: Warm Gold / Amber
        launch:
          "bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-xs hover:shadow-sm active:scale-[0.98]",

        amber:
          "bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-xs hover:shadow-sm active:scale-[0.98]",

        // Emerald alias
        emerald:
          "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs hover:shadow-sm active:scale-[0.98]",

        // Destructive: Rose/Crimson
        destructive:
          "bg-rose-600 hover:bg-rose-700 text-white shadow-xs hover:shadow-sm active:scale-[0.98]",

        // Secondary: Clean Slate
        secondary:
          "bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 active:scale-[0.98]",

        // Outline: Clean Border
        outline:
          "border border-border/80 bg-background text-foreground hover:bg-muted/70 hover:text-foreground active:scale-[0.98]",

        // Ghost: Flat for navbars, dropdown triggers, and tight toolbars
        ghost:
          "hover:bg-muted/70 hover:text-foreground active:scale-[0.98]",

        // Link
        link: "text-emerald-600 dark:text-emerald-400 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9.5 gap-2 px-4 rounded-xl text-sm",
        xs: "h-7 gap-1 rounded-lg px-2 text-xs",
        sm: "h-8.5 gap-1.5 rounded-lg px-3 text-xs",
        lg: "h-11 gap-2.5 px-5 text-sm sm:text-base rounded-xl font-semibold",
        xl: "h-12.5 gap-3 px-6 sm:px-8 text-base sm:text-lg rounded-2xl font-bold",
        icon: "size-9 rounded-xl",
        "icon-xs": "size-6 rounded-md",
        "icon-sm": "size-8 rounded-lg",
        "icon-lg": "size-10 rounded-xl",
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
