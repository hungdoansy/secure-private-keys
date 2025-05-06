import { useEffect, useReducer, useRef } from "react"

export default function useRenderEveryInterval(interval = 1000, until?: Date) {
    const [, forceRender] = useReducer((x) => x + 1, 0)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)

    const needToRefresh = typeof until !== "undefined" ? Date.now() < until.getTime() : true
    useEffect(() => {
        if (needToRefresh) {
            intervalRef.current = setInterval(forceRender, interval)
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [interval, needToRefresh])
}
