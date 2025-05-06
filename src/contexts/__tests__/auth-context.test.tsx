import { fireEvent, render, screen } from "@testing-library/react"
import { act, useEffect } from "react"
import { type Mock, afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { SESSION_TIMEOUT, SYSTEM_MESSAGE } from "@/constants"
import { decryptPrivateKey, encryptPrivateKey } from "@/lib/wallet"

import { AuthProvider, useAuthContext } from "../auth-context"

vi.mock("@/lib/wallet", () => ({
    encryptPrivateKey: vi.fn(),
    decryptPrivateKey: vi.fn(),
}))

const localStorageMock = (() => {
    let store: Record<string, string> = {}
    return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => {
            store[key] = value
        }),
        clear: vi.fn(() => {
            store = {}
        }),
        removeItem: vi.fn((key: string) => {
            delete store[key]
        }),
    }
})()

Object.defineProperty(window, "localStorage", { value: localStorageMock })

function TestComponent() {
    const auth = useAuthContext()
    return (
        <div>
            <div data-testid="locked-status">{auth.isLocked ? "locked" : "unlocked"}</div>
            <div data-testid="setup-status">{auth.hasSetupPassword ? "setup" : "not-setup"}</div>
            <button data-testid="setup-btn" onClick={() => auth.setupPassword("testpassword")}>
                Setup
            </button>
            <button data-testid="unlock-btn" onClick={() => auth.unlockApp("testpassword")}>
                Unlock
            </button>
            <button data-testid="lock-btn" onClick={() => auth.lockApp()}>
                Lock
            </button>
            <button data-testid="reset-timer-btn" onClick={() => auth.resetTimer()}>
                Reset Timer
            </button>
        </div>
    )
}

function AuthValueCapture({ onValue }: { onValue: (val: any) => void }) {
    const auth = useAuthContext()

    useEffect(() => {
        onValue(auth)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [auth])

    return null
}

describe("AuthContext", () => {
    beforeEach(() => {
        localStorageMock.clear()
        vi.clearAllMocks()
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.runOnlyPendingTimers()
        vi.useRealTimers()
    })

    it("should initialize with default values", () => {
        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        )

        expect(screen.getByTestId("locked-status")).toHaveTextContent("locked")
        expect(screen.getByTestId("setup-status")).toHaveTextContent("not-setup")
    })

    it("should initialize with hasSetupPassword=true if system_message exists", () => {
        localStorageMock.getItem.mockReturnValueOnce("encryptedMessage")

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        )

        expect(screen.getByTestId("locked-status")).toHaveTextContent("locked")
        expect(screen.getByTestId("setup-status")).toHaveTextContent("setup")
    })

    it("should setup password correctly", () => {
        ;(encryptPrivateKey as Mock).mockReturnValueOnce("encryptedMessage")

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        )

        fireEvent.click(screen.getByTestId("setup-btn"))

        expect(encryptPrivateKey).toHaveBeenCalledWith(SYSTEM_MESSAGE, "testpassword")
        expect(localStorageMock.setItem).toHaveBeenCalledWith("system_message", "encryptedMessage")
        expect(screen.getByTestId("locked-status")).toHaveTextContent("unlocked")
        expect(screen.getByTestId("setup-status")).toHaveTextContent("setup")
    })

    it("should unlock app with correct password", () => {
        localStorageMock.getItem.mockReturnValue("encryptedMessage")
        ;(decryptPrivateKey as Mock).mockReturnValueOnce(SYSTEM_MESSAGE)

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        )

        fireEvent.click(screen.getByTestId("unlock-btn"))

        expect(decryptPrivateKey).toHaveBeenCalledWith("encryptedMessage", "testpassword")
        expect(screen.getByTestId("locked-status")).toHaveTextContent("unlocked")
    })

    it("should not unlock with incorrect password", () => {
        localStorageMock.getItem.mockReturnValue("encryptedMessage")
        ;(decryptPrivateKey as Mock).mockReturnValueOnce("wrongMessage")

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        )

        fireEvent.click(screen.getByTestId("unlock-btn"))

        expect(decryptPrivateKey).toHaveBeenCalledWith("encryptedMessage", "testpassword")
        expect(screen.getByTestId("locked-status")).toHaveTextContent("locked")
    })

    it("should lock the app", () => {
        ;(encryptPrivateKey as Mock).mockReturnValueOnce("encryptedMessage")

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        )

        fireEvent.click(screen.getByTestId("setup-btn"))

        fireEvent.click(screen.getByTestId("lock-btn"))

        expect(screen.getByTestId("locked-status")).toHaveTextContent("locked")
    })

    it("should reset the timer", () => {
        const capture = vi.fn()

        const now = Date.now()
        vi.setSystemTime(now)
        ;(encryptPrivateKey as Mock).mockReturnValueOnce("encryptedMessage")

        render(
            <AuthProvider>
                <TestComponent />
                <AuthValueCapture onValue={capture} />
            </AuthProvider>
        )

        fireEvent.click(screen.getByTestId("setup-btn"))

        vi.setSystemTime(now + 10_000)

        fireEvent.click(screen.getByTestId("reset-timer-btn"))

        expect(capture).toHaveBeenCalledWith(
            expect.objectContaining({
                unlockedTill: now + 10000 + SESSION_TIMEOUT,
            })
        )
    })

    it("should auto lock after SESSION_TIMEOUT", () => {
        const now = Date.now()
        vi.setSystemTime(now)
        ;(encryptPrivateKey as Mock).mockReturnValueOnce("encryptedMessage")

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        )

        fireEvent.click(screen.getByTestId("setup-btn"))
        expect(screen.getByTestId("locked-status")).toHaveTextContent("unlocked")

        vi.setSystemTime(now + SESSION_TIMEOUT + 1000)
        vi.runOnlyPendingTimers()

        expect(screen.getByTestId("locked-status")).toHaveTextContent("locked")
    })

    it("should clear password when locking app", () => {
        const capture = vi.fn()

        ;(encryptPrivateKey as Mock).mockReturnValueOnce("encryptedMessage")
        ;(decryptPrivateKey as Mock).mockReturnValueOnce(SYSTEM_MESSAGE)

        render(
            <AuthProvider>
                <TestComponent />
                <AuthValueCapture onValue={capture} />
            </AuthProvider>
        )

        act(() => {
            fireEvent.click(screen.getByTestId("setup-btn"))
        })
        expect(screen.getByTestId("locked-status")).toHaveTextContent("unlocked")
        expect(capture).toHaveBeenCalledWith(
            expect.objectContaining({
                password: "testpassword",
            })
        )

        act(() => {
            fireEvent.click(screen.getByTestId("lock-btn"))
            vi.runOnlyPendingTimers()
        })
        expect(screen.getByTestId("locked-status")).toHaveTextContent("locked")

        expect(capture).toHaveBeenCalledWith(
            expect.objectContaining({
                password: null,
            })
        )
    })

    it("should throw error when useAuth is used outside AuthProvider", () => {
        const consoleErrorMock = vi.spyOn(console, "error").mockImplementation(() => {})

        expect(() => {
            render(<TestComponent />)
        }).toThrow("useAuthContext must be used within an AuthProvider")

        consoleErrorMock.mockRestore()
    })
})
