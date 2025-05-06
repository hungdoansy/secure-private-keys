import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { useAuthContext } from "@/contexts/auth-context"

import WalletManager from "../wallet-manager"

// Mock the wallet and auth contexts
vi.mock("@/contexts/auth-context", () => ({
    useAuthContext: vi.fn(),
    AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock("@/contexts/wallet-context", () => ({
    useWalletContext: vi.fn(),
    WalletProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

// Mock the components used by WalletManager
vi.mock("@/components/auth/login-screen", () => ({
    default: () => <div data-testid="login-screen">Login Screen</div>,
}))

vi.mock("@/components/auth/password-setup-screen", () => ({
    default: () => <div data-testid="password-setup">Password Setup</div>,
}))

vi.mock("@/components/auth/session-timer", () => ({
    default: () => <div data-testid="session-timer">Session Timer</div>,
}))

vi.mock("@/components/wallet/wallet-generator", () => ({
    default: () => <div data-testid="wallet-generator">Wallet Generator</div>,
}))

vi.mock("@/components/wallet/wallet-list", () => ({
    default: () => <div data-testid="wallet-list">Wallet List</div>,
}))

describe("WalletManager", () => {
    it("should render password setup screen when password not set", () => {
        vi.mocked(useAuthContext).mockReturnValue({
            isLocked: true,
            hasSetupPassword: false,
            password: null,
            unlockedTill: null,
            setPassword: vi.fn(),
            unlockApp: vi.fn(),
            setupPassword: vi.fn(),
            lockApp: vi.fn(),
            resetTimer: vi.fn(),
        })

        render(<WalletManager />)

        expect(screen.getByTestId("password-setup")).toBeInTheDocument()
        expect(screen.queryByTestId("login-screen")).not.toBeInTheDocument()
        expect(screen.queryByTestId("wallet-generator")).not.toBeInTheDocument()
    })

    it("should render login screen when app is locked", () => {
        vi.mocked(useAuthContext).mockReturnValue({
            isLocked: true,
            hasSetupPassword: true,
            password: null,
            unlockedTill: null,
            setPassword: vi.fn(),
            unlockApp: vi.fn(),
            setupPassword: vi.fn(),
            lockApp: vi.fn(),
            resetTimer: vi.fn(),
        })

        render(<WalletManager />)

        expect(screen.getByTestId("login-screen")).toBeInTheDocument()
        expect(screen.queryByTestId("password-setup")).not.toBeInTheDocument()
        expect(screen.queryByTestId("wallet-generator")).not.toBeInTheDocument()
    })

    it("should render wallet tools when app is unlocked", () => {
        vi.mocked(useAuthContext).mockReturnValue({
            isLocked: false,
            hasSetupPassword: true,
            password: "testpassword",
            unlockedTill: Date.now() + 300000,
            setPassword: vi.fn(),
            unlockApp: vi.fn(),
            setupPassword: vi.fn(),
            lockApp: vi.fn(),
            resetTimer: vi.fn(),
        })

        render(<WalletManager />)

        expect(screen.getByTestId("session-timer")).toBeInTheDocument()
        expect(screen.getByTestId("wallet-generator")).toBeInTheDocument()
        expect(screen.getByTestId("wallet-list")).toBeInTheDocument()
        expect(screen.queryByTestId("login-screen")).not.toBeInTheDocument()
    })
})
