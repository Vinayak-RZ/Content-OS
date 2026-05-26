import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-[transform,background-color,border-color,color,box-shadow] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "rounded-md bg-brand text-brand-foreground shadow-pill hover:bg-brand/90",
        secondary:
          "rounded-md bg-forest text-forest-foreground shadow-pill hover:bg-forest/90",
        tertiary:
          "rounded-md bg-muted-foreground text-white shadow-pill hover:bg-muted-foreground/90",
        outline:
          "rounded-md border border-subtle bg-card text-foreground shadow-pill hover:bg-muted/60",
        brandOutline:
          "rounded-md border border-brand-border bg-brand-muted text-brand hover:bg-brand-muted/80",
        ghost:
          "rounded-md border border-subtle bg-transparent text-foreground hover:bg-muted/50",
        destructive:
          "rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-6 text-sm",
        pill: "h-9 px-5 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      ref={ref}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export { Button, buttonVariants };
