import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

// Import after mock
import { useAuthContext } from "@/contexts/auth-context"

import PasswordSetupScreen from "../password-setup-screen"

// Mock the auth context
vi.mock("@/contexts/auth-context", () => ({
    useAuthContext: vi.fn(),
}))

describe("PasswordSetupScreen", () => {
    beforeEach(() => {
        vi.mocked(useAuthContext).mockReturnValue({
            setupPassword: vi.fn(),
            isLocked: true,
            hasSetupPassword: false,
            password: null,
            unlockedTill: null,
            unlockApp: vi.fn(),
            setPassword: vi.fn(),
            lockApp: vi.fn(),
            resetTimer: vi.fn(),
        })
    })

    it("renders correctly", () => {
        render(<PasswordSetupScreen />)

        expect(screen.getAllByText("Create Password")).toHaveLength(2)
        expect(screen.getByLabelText("Password")).toBeInTheDocument()
        expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Create Password" })).toBeInTheDocument()
    })

    it("shows error when submitting empty password", () => {
        render(<PasswordSetupScreen />)

        fireEvent.click(screen.getByRole("button", { name: "Create Password" }))

        expect(screen.getByText("Password is required")).toBeInTheDocument()
    })

    it("shows error when password is too short", () => {
        render(<PasswordSetupScreen />)

        const passwordInput = screen.getByLabelText("Password")
        fireEvent.change(passwordInput, { target: { value: "short" } })

        const confirmPasswordInput = screen.getByLabelText("Confirm Password")
        fireEvent.change(confirmPasswordInput, { target: { value: "short" } })

        fireEvent.click(screen.getByRole("button", { name: "Create Password" }))

        expect(screen.getByText("Password must be at least 8 characters")).toBeInTheDocument()
    })

    it("shows error when passwords don't match", () => {
        render(<PasswordSetupScreen />)

        const passwordInput = screen.getByLabelText("Password")
        fireEvent.change(passwordInput, { target: { value: "password123" } })

        const confirmPasswordInput = screen.getByLabelText("Confirm Password")
        fireEvent.change(confirmPasswordInput, { target: { value: "password456" } })

        fireEvent.click(screen.getByRole("button", { name: "Create Password" }))

        expect(screen.getByText("Passwords do not match")).toBeInTheDocument()
    })

    it("calls setupPassword when valid passwords are submitted", () => {
        const mockSetupPassword = vi.fn()
        vi.mocked(useAuthContext).mockReturnValue({
            setupPassword: mockSetupPassword,
            isLocked: true,
            hasSetupPassword: false,
            password: null,
            unlockedTill: null,
            unlockApp: vi.fn(),
            setPassword: vi.fn(),
            lockApp: vi.fn(),
            resetTimer: vi.fn(),
        })

        render(<PasswordSetupScreen />)

        const passwordInput = screen.getByLabelText("Password")
        fireEvent.change(passwordInput, { target: { value: "password123" } })

        const confirmPasswordInput = screen.getByLabelText("Confirm Password")
        fireEvent.change(confirmPasswordInput, { target: { value: "password123" } })

        fireEvent.click(screen.getByRole("button", { name: "Create Password" }))

        expect(mockSetupPassword).toHaveBeenCalledWith("password123")
    })
})
