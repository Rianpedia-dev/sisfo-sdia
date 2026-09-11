import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl border border-transparent text-sm font-semibold whitespace-nowrap transition-all duration-150 outline-none select-none cursor-pointer focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // Default Primary: 3D Tactile Emerald (Identitas Resmi Al-Azhar)
        default:
          "bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.25),0_0_0_1px_rgba(52,211,153,0.5),0_3px_0_#065f46,0_8px_12px_-3px_rgba(0,0,0,0.35)] hover:shadow-[0_0_22px_rgba(16,185,129,0.5),0_0_0_1px_rgba(52,211,153,0.65),0_3px_0_#065f46,0_10px_16px_-3px_rgba(0,0,0,0.45)] active:translate-y-[2px] active:shadow-[0_0_12px_rgba(16,185,129,0.35),0_0_0_1px_rgba(52,211,153,0.5),0_1px_0_#065f46,0_4px_6px_-2px_rgba(0,0,0,0.3)]",

        // Launch / Amber: 3D Glossy Amber Gradient (1:1 dengan LaunchButton User)
        launch:
          "bg-gradient-to-b from-amber-200 via-amber-300 to-amber-500 text-amber-950 font-bold shadow-[0_0_14px_rgba(245,158,11,0.3),0_0_0_1px_rgba(251,191,36,0.6),0_3px_0_#b45309,0_8px_12px_-3px_rgba(0,0,0,0.4)] hover:shadow-[0_0_24px_rgba(245,158,11,0.6),0_0_0_1px_rgba(251,191,36,0.7),0_3px_0_#b45309,0_10px_16px_-3px_rgba(0,0,0,0.5)] active:translate-y-[2px] active:shadow-[0_0_12px_rgba(245,158,11,0.4),0_0_0_1px_rgba(251,191,36,0.5),0_1px_0_#b45309,0_4px_6px_-2px_rgba(0,0,0,0.35)]",

        amber:
          "bg-gradient-to-b from-amber-200 via-amber-300 to-amber-500 text-amber-950 font-bold shadow-[0_0_14px_rgba(245,158,11,0.3),0_0_0_1px_rgba(251,191,36,0.6),0_3px_0_#b45309,0_8px_12px_-3px_rgba(0,0,0,0.4)] hover:shadow-[0_0_24px_rgba(245,158,11,0.6),0_0_0_1px_rgba(251,191,36,0.7),0_3px_0_#b45309,0_10px_16px_-3px_rgba(0,0,0,0.5)] active:translate-y-[2px] active:shadow-[0_0_12px_rgba(245,158,11,0.4),0_0_0_1px_rgba(251,191,36,0.5),0_1px_0_#b45309,0_4px_6px_-2px_rgba(0,0,0,0.35)]",

        // Emerald alias
        emerald:
          "bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.25),0_0_0_1px_rgba(52,211,153,0.5),0_3px_0_#065f46,0_8px_12px_-3px_rgba(0,0,0,0.35)] hover:shadow-[0_0_22px_rgba(16,185,129,0.5),0_0_0_1px_rgba(52,211,153,0.65),0_3px_0_#065f46,0_10px_16px_-3px_rgba(0,0,0,0.45)] active:translate-y-[2px] active:shadow-[0_0_12px_rgba(16,185,129,0.35),0_0_0_1px_rgba(52,211,153,0.5),0_1px_0_#065f46,0_4px_6px_-2px_rgba(0,0,0,0.3)]",

        // Destructive: 3D Rose/Crimson
        destructive:
          "bg-gradient-to-b from-rose-500 via-rose-600 to-rose-700 text-white shadow-[0_0_12px_rgba(244,63,94,0.25),0_0_0_1px_rgba(251,113,133,0.5),0_3px_0_#9f1239,0_8px_12px_-3px_rgba(0,0,0,0.35)] hover:shadow-[0_0_22px_rgba(244,63,94,0.5),0_0_0_1px_rgba(251,113,133,0.65),0_3px_0_#9f1239,0_10px_16px_-3px_rgba(0,0,0,0.45)] active:translate-y-[2px] active:shadow-[0_0_12px_rgba(244,63,94,0.35),0_0_0_1px_rgba(251,113,133,0.5),0_1px_0_#9f1239,0_4px_6px_-2px_rgba(0,0,0,0.3)]",

        // Secondary: 3D Subtle Bevel
        secondary:
          "bg-gradient-to-b from-secondary/90 to-secondary text-secondary-foreground shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_2px_0_rgba(0,0,0,0.12),0_4px_6px_-2px_rgba(0,0,0,0.06)] hover:bg-secondary active:translate-y-[1.5px] active:shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_0_0_rgba(0,0,0,0.1)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_2px_0_rgba(0,0,0,0.4)]",

        // Outline: Tactile Border with Bottom Edge
        outline:
          "border border-border/80 bg-background text-foreground shadow-[0_2px_0_rgba(0,0,0,0.05),0_3px_6px_-2px_rgba(0,0,0,0.05)] hover:bg-muted/80 active:translate-y-[1px] active:shadow-none dark:shadow-[0_2px_0_rgba(255,255,255,0.05)]",

        // Ghost: Flat for navbars, dropdown triggers, and tight toolbars
        ghost:
          "hover:bg-muted/70 hover:text-foreground active:translate-y-px",

        // Link
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 gap-1.5 px-3.5 rounded-xl text-sm",
        xs: "h-6 gap-1 rounded-lg px-2 text-xs",
        sm: "h-8 gap-1 rounded-lg px-2.5 text-xs",
        lg: "h-11 gap-2 px-5 text-base rounded-xl font-bold",
        xl: "h-13 gap-3 px-8 text-lg rounded-2xl font-bold",
        icon: "size-9 rounded-xl",
        "icon-xs": "size-6 rounded-md",
        "icon-sm": "size-7 rounded-lg",
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
