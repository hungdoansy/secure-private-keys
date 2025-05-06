import React from "react"

import { cn } from "@/lib/utils"

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    "px-4 py-2 rounded-lg font-semibold text-black bg-accent hover:bg-accent/80 transition-colors",
                    className
                )}
                {...props}
            >
                {children}
            </button>
        )
    }
)

Button.displayName = "Button"
