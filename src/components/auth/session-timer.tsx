"use client"

import { AlarmClockIcon } from "lucide-react"

import { SESSION_TIMEOUT } from "@/constants"
import { useAuthContext } from "@/contexts/auth-context"
import useRenderEveryInterval from "@/hooks/use-render-every-interval"
import { cn } from "@/lib/utils"

export default function SessionTimer() {
    const { unlockedTill, resetTimer } = useAuthContext()

    const timeRemaining = unlockedTill ? unlockedTill - Date.now() : 0
    const percentage = Math.max(0, Math.min(100, (timeRemaining / SESSION_TIMEOUT) * 100))

    useRenderEveryInterval(1000, unlockedTill ? new Date(unlockedTill) : undefined)

    // Format remaining time in mm:ss
    const formatTime = (ms: number) => {
        const totalSeconds = Math.max(0, Math.round(ms / 1000))
        const minutes = Math.floor(totalSeconds / 60)
        const seconds = totalSeconds % 60
        return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    }

    // Determine color based on remaining time
    const getColorClass = () => {
        if (percentage > 50) return "bg-green-500"
        if (percentage > 20) return "bg-yellow-500"
        return "bg-red-500"
    }

    return (
        <div className="w-full flex flex-col gap-2 text-white">
            <div className="flex items-center justify-between">
                <div className="flex items-center text-xs text-gray-300">
                    <AlarmClockIcon className="h-3 w-3 mr-1.5" />
                    <span>Session expires in: </span>
                    <span className="font-mono ml-1.5 text-white">{formatTime(timeRemaining)}</span>
                </div>
                <button
                    onClick={resetTimer}
                    title="Reset timer"
                    className="text-xs hover:underline hover:text-gray-200 transition-colors"
                >
                    Reset
                </button>
            </div>
            <div className="w-full h-1.5 bg-[#2c2c2d] rounded-full overflow-hidden">
                <div
                    className={cn("h-full transition-all duration-300 ease-out", getColorClass())}
                    style={{ width: `${percentage}%` }}
                    data-testid="progress-bar"
                />
            </div>
        </div>
    )
}
