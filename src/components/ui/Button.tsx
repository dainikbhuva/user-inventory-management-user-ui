import * as React from "react"
import { cn } from "../../shared/utils/cn"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-sm text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer"

    const variants = {
      default: "bg-primary text-white hover:bg-primary-dark focus-visible:ring-primary",
      destructive: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-300",
      outline: "border border-base bg-surface text-body hover:bg-surface-2 focus-visible:ring-primary",
      secondary: "bg-surface-2 text-body hover:bg-surface-3 focus-visible:ring-primary",
      ghost: "hover:bg-surface-2 text-body focus-visible:ring-primary",
      link: "text-primary underline-offset-4 hover:underline focus-visible:ring-primary",
    }

    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-sm px-3",
      lg: "h-11 rounded-sm px-8",
      icon: "h-10 w-10 rounded-sm",
    }

    return (
      <button
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
