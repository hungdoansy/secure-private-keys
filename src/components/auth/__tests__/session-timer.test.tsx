import { fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { SESSION_TIMEOUT } from "@/constants"
// Import after mocks
import { useAuthContext } from "@/contexts/auth-context"
import useRenderEveryInterval from "@/hooks/use-render-every-interval"

import SessionTimer from "../session-timer"

// Mock the hook and auth context
vi.mock("@/hooks/use-render-every-interval", () => ({
    default: vi.fn(),
}))

vi.mock("@/contexts/auth-context", () => ({
    useAuthContext: vi.fn(),
}))

describe("SessionTimer", () => {
    const now = 1625097600000 // Fixed timestamp for testing

    beforeEach(() => {
        vi.setSystemTime(now)

        vi.mocked(useAuthContext).mockReturnValue({
            unlockedTill: now + SESSION_TIMEOUT,
            resetTimer: vi.fn(),
            isLocked: false,
            hasSetupPassword: true,
            password: "password123",
            unlockApp: vi.fn(),
            setPassword: vi.fn(),
            setupPassword: vi.fn(),
            lockApp: vi.fn(),
        })

        vi.mocked(useRenderEveryInterval).mockImplementation(() => {})
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it("renders correctly with a valid timer", () => {
        render(<SessionTimer />)

        // Format for 5 minutes remaining (SESSION_TIMEOUT = 5 * 60 * 1000)
        expect(screen.getByText("05:00")).toBeInTheDocument()
        expect(screen.getByText("Reset")).toBeInTheDocument()
    })

    it("calls resetTimer when Reset button is clicked", () => {
        const mockResetTimer = vi.fn()
        vi.mocked(useAuthContext).mockReturnValue({
            unlockedTill: now + SESSION_TIMEOUT,
            resetTimer: mockResetTimer,
            isLocked: false,
            hasSetupPassword: true,
            password: "password123",
            unlockApp: vi.fn(),
            setPassword: vi.fn(),
            setupPassword: vi.fn(),
            lockApp: vi.fn(),
        })

        render(<SessionTimer />)

        fireEvent.click(screen.getByText("Reset"))

        expect(mockResetTimer).toHaveBeenCalled()
    })

    it("shows 00:00 when timer is expired", () => {
        vi.mocked(useAuthContext).mockReturnValue({
            unlockedTill: now - 60000, // Set to the past
            resetTimer: vi.fn(),
            isLocked: false,
            hasSetupPassword: true,
            password: "password123",
            unlockApp: vi.fn(),
            setPassword: vi.fn(),
            setupPassword: vi.fn(),
            lockApp: vi.fn(),
        })

        render(<SessionTimer />)

        expect(screen.getByText("00:00")).toBeInTheDocument()
    })

    it("applies different color classes based on percentage", () => {
        // Full timer (green)
        vi.mocked(useAuthContext).mockReturnValue({
            unlockedTill: now + SESSION_TIMEOUT,
            resetTimer: vi.fn(),
            isLocked: false,
            hasSetupPassword: true,
            password: "password123",
            unlockApp: vi.fn(),
            setPassword: vi.fn(),
            setupPassword: vi.fn(),
            lockApp: vi.fn(),
        })

        const { rerender } = render(<SessionTimer />)

        // Green progress bar for > 50%
        const progressBar = screen.getByTestId("progress-bar")
        expect(progressBar).toHaveClass("bg-green-500")

        // Medium timer (yellow)
        vi.mocked(useAuthContext).mockReturnValue({
            unlockedTill: now + SESSION_TIMEOUT * 0.3, // 30% remaining
            resetTimer: vi.fn(),
            isLocked: false,
            hasSetupPassword: true,
            password: "password123",
            unlockApp: vi.fn(),
            setPassword: vi.fn(),
            setupPassword: vi.fn(),
            lockApp: vi.fn(),
        })

        rerender(<SessionTimer />)

        // Yellow progress bar for 20-50%
        expect(progressBar).toHaveClass("bg-yellow-500")

        // Low timer (red)
        vi.mocked(useAuthContext).mockReturnValue({
            unlockedTill: now + SESSION_TIMEOUT * 0.1, // 10% remaining
            resetTimer: vi.fn(),
            isLocked: false,
            hasSetupPassword: true,
            password: "password123",
            unlockApp: vi.fn(),
            setPassword: vi.fn(),
            setupPassword: vi.fn(),
            lockApp: vi.fn(),
        })

        rerender(<SessionTimer />)

        // Red progress bar for < 20%
        expect(progressBar).toHaveClass("bg-red-500")
    })

    it("calls useRenderEveryInterval with correct parameters", () => {
        const expectedDate = new Date(now + SESSION_TIMEOUT)

        render(<SessionTimer />)

        expect(useRenderEveryInterval).toHaveBeenCalledWith(1000, expectedDate)
    })
})
