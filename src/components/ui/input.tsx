import React from "react"

import { cn } from "@/lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
    label?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ label, className = "", ...props }, ref) => {
        return (
            <div className="flex flex-col space-y-1 w-full">
                {label && <label className="text-sm font-medium text-gray-300">{label}</label>}
                <input
                    ref={ref}
                    className={cn(
                        "w-full px-4 h-9 rounded-md border bg-[#1a1a1a] text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#48ff91] focus:border-[#48ff91] transition-all duration-200",
                        className
                    )}
                    {...props}
                />
            </div>
        )
    }
)

Input.displayName = "Input"
