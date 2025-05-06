import { fireEvent, render, screen } from "@testing-library/react"
import { act } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { useAuthContext } from "@/contexts/auth-context"
import { useWalletContext } from "@/contexts/wallet-context"

import WalletGenerator from "../wallet-generator"

// Mock the contexts
vi.mock("@/contexts/auth-context", () => ({
    useAuthContext: vi.fn(),
}))

vi.mock("@/contexts/wallet-context", () => ({
    useWalletContext: vi.fn(),
}))

describe("WalletGenerator", () => {
    beforeEach(() => {
        vi.resetAllMocks()

        vi.mocked(useAuthContext).mockReturnValue({
            resetTimer: vi.fn(),
            isLocked: false,
            hasSetupPassword: true,
            password: "testpassword",
            unlockedTill: Date.now() + 300000,
            setPassword: vi.fn(),
            unlockApp: vi.fn(),
            setupPassword: vi.fn(),
            lockApp: vi.fn(),
        })

        vi.mocked(useWalletContext).mockReturnValue({
            wallets: [],
            generateWallet: vi.fn(),
            decryptPrivateKey: vi.fn(),
        })
    })

    it("should render correctly", () => {
        render(<WalletGenerator />)

        expect(screen.getByText("Generate New Wallet")).toBeInTheDocument()
        expect(
            screen.getByText("Your private key is securely encrypted with your password")
        ).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Generate Wallet" })).toBeInTheDocument()
    })

    it("should call generateWallet and resetTimer when button is clicked", () => {
        const mockGenerateWallet = vi.fn()
        const mockResetTimer = vi.fn()

        vi.mocked(useWalletContext).mockReturnValue({
            wallets: [],
            generateWallet: mockGenerateWallet,
            decryptPrivateKey: vi.fn(),
        })

        vi.mocked(useAuthContext).mockReturnValue({
            resetTimer: mockResetTimer,
            isLocked: false,
            hasSetupPassword: true,
            password: "testpassword",
            unlockedTill: Date.now() + 300000,
            setPassword: vi.fn(),
            unlockApp: vi.fn(),
            setupPassword: vi.fn(),
            lockApp: vi.fn(),
        })

        render(<WalletGenerator />)

        act(() => {
            fireEvent.click(screen.getByRole("button", { name: "Generate Wallet" }))
        })

        expect(mockGenerateWallet).toHaveBeenCalledTimes(1)
        expect(mockResetTimer).toHaveBeenCalledTimes(1)
    })

    it("should display error message when wallet generation fails", () => {
        const mockGenerateWallet = vi.fn().mockImplementation(() => {
            throw new Error("Failed to generate")
        })

        vi.mocked(useWalletContext).mockReturnValue({
            wallets: [],
            generateWallet: mockGenerateWallet,
            decryptPrivateKey: vi.fn(),
        })

        render(<WalletGenerator />)

        act(() => {
            fireEvent.click(screen.getByRole("button", { name: "Generate Wallet" }))
        })

        expect(screen.getByText("Failed to generate wallet. Please try again.")).toBeInTheDocument()
    })
})
