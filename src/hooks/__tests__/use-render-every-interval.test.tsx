import { renderHook } from "@testing-library/react"
import { act } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import useRenderEveryInterval from "../use-render-every-interval"

describe("useRenderEveryInterval", () => {
    beforeEach(() => {
        vi.useFakeTimers()
        vi.resetAllMocks()
    })

    afterEach(() => {
        vi.clearAllTimers()
        vi.useRealTimers()
        vi.clearAllMocks()
        vi.restoreAllMocks()
    })

    it("should set up an interval that forces re-renders", () => {
        const setIntervalSpy = vi.spyOn(globalThis, "setInterval")
        const clearIntervalSpy = vi.spyOn(globalThis, "clearInterval")

        const { rerender, unmount } = renderHook(
            ({ interval }) => useRenderEveryInterval(interval),
            { initialProps: { interval: 1000 } }
        )

        // Check if setInterval was called with the right interval
        expect(setIntervalSpy).toHaveBeenCalledTimes(1)
        expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 1000)

        // Change the interval and rerender
        act(() => {
            rerender({ interval: 2000 })
        })

        // The previous interval should have been cleared and a new one created
        expect(clearIntervalSpy).toHaveBeenCalledTimes(1)
        expect(setIntervalSpy).toHaveBeenCalledTimes(2)
        expect(setIntervalSpy).toHaveBeenLastCalledWith(expect.any(Function), 2000)

        // Cleanup on unmount
        act(() => {
            unmount()
        })
        expect(clearIntervalSpy).toHaveBeenCalledTimes(2)
    })

    it("should stop rendering after the 'until' date is reached", () => {
        const now = new Date()
        vi.setSystemTime(now)

        const futureDate = new Date(now.getTime() + 10000) // 10 seconds in the future
        const setIntervalSpy = vi.spyOn(globalThis, "setInterval")

        const { unmount } = renderHook(() => useRenderEveryInterval(1000, futureDate))

        // Should set up interval because until date is in the future
        expect(setIntervalSpy).toHaveBeenCalledTimes(1)

        // Set time beyond the until date
        vi.setSystemTime(now.getTime() + 20000) // 20 seconds in the future

        // Rerender with the same props but now the current time is after the until date
        const { unmount: unmount2 } = renderHook(() => useRenderEveryInterval(1000, futureDate))

        // Should not set up a new interval
        expect(setIntervalSpy).toHaveBeenCalledTimes(1) // Still only called once from before

        act(() => {
            unmount()
            unmount2()
        })
    })

    it("should force re-renders on the specified interval", async () => {
        let renderCount = 0

        // Use a mock function that captures each render
        renderHook(() => {
            renderCount++
            return useRenderEveryInterval(1000)
        })

        expect(renderCount).toBe(1) // Initial render

        // Fast-forward time by 1 second
        await act(async () => {
            await vi.advanceTimersByTimeAsync(1000)
        })
        expect(renderCount).toBe(2) // Should have re-rendered

        // Fast-forward time by 1 more second
        await act(async () => {
            await vi.advanceTimersByTimeAsync(1000)
        })
        expect(renderCount).toBe(3) // Should have re-rendered again
    })
})
