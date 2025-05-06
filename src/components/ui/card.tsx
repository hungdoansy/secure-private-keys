import React from "react"

import { cn } from "@/lib/utils"

export type CardProps = React.HTMLAttributes<HTMLDivElement>

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div ref={ref} className={cn("p-4 sm:p-6 rounded-xl border", className)} {...props}>
                {children}
            </div>
        )
    }
)

Card.displayName = "Card"
