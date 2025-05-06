import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

// Import after mock
import { useAuthContext } from "@/contexts/auth-context"

import LoginScreen from "../login-screen"

// Mock the auth context
vi.mock("@/contexts/auth-context", () => ({
    useAuthContext: vi.fn(),
}))

describe("LoginScreen", () => {
    beforeEach(() => {
        vi.mocked(useAuthContext).mockReturnValue({
            unlockApp: vi.fn(),
            isLocked: true,
            hasSetupPassword: false,
            password: null,
            unlockedTill: null,
            setPassword: vi.fn(),
            setupPassword: vi.fn(),
            lockApp: vi.fn(),
            resetTimer: vi.fn(),
        })
    })

    it("renders correctly", () => {
        render(<LoginScreen />)

        expect(screen.getByText("Unlock Wallet Manager")).toBeInTheDocument()
        expect(screen.getByLabelText("Password")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Unlock" })).toBeInTheDocument()
    })

    it("shows error when submitting empty password", () => {
        render(<LoginScreen />)

        fireEvent.click(screen.getByRole("button", { name: "Unlock" }))

        expect(screen.getByText("Password is required")).toBeInTheDocument()
    })

    it("shows error when password is too short", () => {
        render(<LoginScreen />)

        const passwordInput = screen.getByLabelText("Password")
        fireEvent.change(passwordInput, { target: { value: "short" } })
        fireEvent.click(screen.getByRole("button", { name: "Unlock" }))

        expect(screen.getByText("Password must be at least 8 characters")).toBeInTheDocument()
    })

    it("calls unlockApp when valid password is submitted", () => {
        const mockUnlockApp = vi.fn().mockReturnValue(true)
        vi.mocked(useAuthContext).mockReturnValue({
            unlockApp: mockUnlockApp,
            isLocked: true,
            hasSetupPassword: true,
            password: null,
            unlockedTill: null,
            setPassword: vi.fn(),
            setupPassword: vi.fn(),
            lockApp: vi.fn(),
            resetTimer: vi.fn(),
        })

        render(<LoginScreen />)

        const passwordInput = screen.getByLabelText("Password")
        fireEvent.change(passwordInput, { target: { value: "validpassword" } })
        fireEvent.click(screen.getByRole("button", { name: "Unlock" }))

        expect(mockUnlockApp).toHaveBeenCalledWith("validpassword")
    })

    it("shows error when password is incorrect", () => {
        const mockUnlockApp = vi.fn().mockReturnValue(false)
        vi.mocked(useAuthContext).mockReturnValue({
            unlockApp: mockUnlockApp,
            isLocked: true,
            hasSetupPassword: true,
            password: null,
            unlockedTill: null,
            setPassword: vi.fn(),
            setupPassword: vi.fn(),
            lockApp: vi.fn(),
            resetTimer: vi.fn(),
        })

        render(<LoginScreen />)

        const passwordInput = screen.getByLabelText("Password")
        fireEvent.change(passwordInput, { target: { value: "wrongpassword" } })
        fireEvent.click(screen.getByRole("button", { name: "Unlock" }))

        expect(mockUnlockApp).toHaveBeenCalledWith("wrongpassword")
        expect(screen.getByText("Incorrect password")).toBeInTheDocument()
    })
})
