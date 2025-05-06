import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { act } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { useAuthContext } from "@/contexts/auth-context"
import { useWalletContext } from "@/contexts/wallet-context"
import { fetchWalletBalance } from "@/lib/wallet"
import type { Wallet } from "@/types/wallet"

import WalletDisplay from "../wallet-display"

// Mock dependencies
vi.mock("@/contexts/auth-context", () => ({
    useAuthContext: vi.fn(),
}))

vi.mock("@/contexts/wallet-context", () => ({
    useWalletContext: vi.fn(),
}))

// Mock external libraries and components
vi.mock("dayjs", () => ({
    default: (_date: Date) => ({
        fromNow: () => "a few seconds ago",
    }),
}))

vi.mock("@/components/copy-button", () => ({
    default: ({ content }: { content: string }) => (
        <button data-testid="copy-button" data-content={content}>
            Copy
        </button>
    ),
}))

vi.mock("@/hooks/use-render-every-interval", () => ({
    default: vi.fn(),
}))

// Mock wallet functions
vi.mock("@/lib/wallet", () => ({
    fetchWalletBalance: vi.fn().mockResolvedValue("1.5"),
}))

describe("WalletDisplay", () => {
    const mockWallet: Wallet = {
        address: "0x1234567890abcdef1234567890abcdef12345678",
        encryptedPrivateKey: "encryptedPrivateKey123",
        createdAt: "2023-01-01T00:00:00.000Z",
    }

    const mockPrivateKey = "0xprivatekey123456789"

    beforeEach(() => {
        vi.resetAllMocks()

        vi.mocked(useAuthContext).mockReturnValue({
            password: "testpassword",
            resetTimer: vi.fn(),
            isLocked: false,
            hasSetupPassword: true,
            unlockedTill: Date.now() + 300000,
            unlockApp: vi.fn(),
            setPassword: vi.fn(),
            setupPassword: vi.fn(),
            lockApp: vi.fn(),
        })

        vi.mocked(useWalletContext).mockReturnValue({
            wallets: [mockWallet],
            generateWallet: vi.fn(),
            decryptPrivateKey: vi.fn().mockReturnValue(mockPrivateKey),
        })

        // Mock the fetch balance function
        vi.mocked(fetchWalletBalance).mockResolvedValue("1.5")
    })

    it("should render wallet details correctly", async () => {
        render(<WalletDisplay wallet={mockWallet} index={1} />)

        // Basic wallet info
        expect(screen.getByText("Wallet 1")).toBeInTheDocument()
        expect(screen.getByText(mockWallet.address)).toBeInTheDocument()

        // Wait for balance to be fetched
        await waitFor(() => {
            expect(screen.getByText("1.5 ETH (Sepolia Testnet)")).toBeInTheDocument()
        })

        // Etherscan link
        const etherscanLink = screen.getByText("View on Etherscan")
        expect(etherscanLink.closest("a")).toHaveAttribute(
            "href",
            `https://sepolia.etherscan.io/address/${mockWallet.address}`
        )

        // Copy button for address
        const copyButton = screen.getByTestId("copy-button")
        expect(copyButton).toHaveAttribute("data-content", mockWallet.address)
    })

    it("should show loading state when fetching balance", () => {
        // Delay the promise resolution
        vi.mocked(fetchWalletBalance).mockImplementation(() => new Promise(() => {}))

        render(<WalletDisplay wallet={mockWallet} index={1} />)

        expect(screen.getByText("fetching...")).toBeInTheDocument()
    })

    it("should handle balance fetch error", async () => {
        vi.mocked(fetchWalletBalance).mockRejectedValue(new Error("Network error"))

        render(<WalletDisplay wallet={mockWallet} index={1} />)

        await waitFor(() => {
            expect(screen.getByText("Error ETH (Sepolia Testnet)")).toBeInTheDocument()
        })
    })

    it("should show password input initially for private key", async () => {
        await act(async () => {
            render(<WalletDisplay wallet={mockWallet} index={1} />)
        })

        expect(screen.getByText("View private key")).toBeInTheDocument()
        expect(screen.getByPlaceholderText("Confirm your password")).toBeInTheDocument()

        // Private key should not be visible
        expect(screen.queryByText(mockPrivateKey)).not.toBeInTheDocument()
    })

    it("should show error for empty password when trying to reveal private key", async () => {
        render(<WalletDisplay wallet={mockWallet} index={1} />)

        // Try to reveal private key without entering password
        await act(async () => {
            fireEvent.click(screen.getByTitle("Show private key"))
        })

        expect(screen.getByText("Please confirm your password")).toBeInTheDocument()
    })

    it("should show error for incorrect password", async () => {
        // Setup decryptPrivateKey to throw an error when called with incorrect password
        const mockDecrypt = vi.fn().mockImplementation(() => {
            throw new Error("Incorrect password")
        })

        vi.mocked(useWalletContext).mockReturnValue({
            wallets: [mockWallet],
            generateWallet: vi.fn(),
            decryptPrivateKey: mockDecrypt,
        })

        render(<WalletDisplay wallet={mockWallet} index={1} />)

        await act(async () => {
            // Enter password
            fireEvent.change(screen.getByPlaceholderText("Confirm your password"), {
                target: { value: "wrongpassword" },
            })

            // Try to reveal private key
            fireEvent.click(screen.getByTitle("Show private key"))
        })

        expect(screen.getByText("Incorrect password")).toBeInTheDocument()
    })

    it("should reveal private key with correct password", async () => {
        const mockResetTimer = vi.fn()
        vi.mocked(useAuthContext).mockReturnValue({
            password: "testpassword",
            resetTimer: mockResetTimer,
            isLocked: false,
            hasSetupPassword: true,
            unlockedTill: Date.now() + 300000,
            unlockApp: vi.fn(),
            setPassword: vi.fn(),
            setupPassword: vi.fn(),
            lockApp: vi.fn(),
        })

        render(<WalletDisplay wallet={mockWallet} index={1} />)

        await act(async () => {
            // Enter password
            fireEvent.change(screen.getByPlaceholderText("Confirm your password"), {
                target: { value: "testpassword" },
            })

            // Reveal private key
            fireEvent.click(screen.getByTitle("Show private key"))
        })

        // Private key should be visible
        expect(screen.getByText(mockPrivateKey)).toBeInTheDocument()

        // Should have called resetTimer
        expect(mockResetTimer).toHaveBeenCalled()
    })

    it("should hide private key when hide button is clicked", async () => {
        render(<WalletDisplay wallet={mockWallet} index={1} />)

        await act(async () => {
            // Enter password
            fireEvent.change(screen.getByPlaceholderText("Confirm your password"), {
                target: { value: "testpassword" },
            })

            // Reveal private key
            fireEvent.click(screen.getByTitle("Show private key"))
        })

        // Private key should be visible
        expect(screen.getByText(mockPrivateKey)).toBeInTheDocument()

        await act(async () => {
            // Hide private key
            fireEvent.click(screen.getByTitle("Hide private key"))
        })

        // Private key should not be visible anymore
        expect(screen.queryByText(mockPrivateKey)).not.toBeInTheDocument()
    })

    it("should automatically hide private key when app is locked", async () => {
        const { rerender } = render(<WalletDisplay wallet={mockWallet} index={1} />)

        await act(async () => {
            // Enter password
            fireEvent.change(screen.getByPlaceholderText("Confirm your password"), {
                target: { value: "testpassword" },
            })

            // Reveal private key
            fireEvent.click(screen.getByTitle("Show private key"))
        })

        // Private key should be visible
        expect(screen.getByText(mockPrivateKey)).toBeInTheDocument()

        // Update auth context to simulate app being locked
        vi.mocked(useAuthContext).mockReturnValue({
            password: null,
            resetTimer: vi.fn(),
            isLocked: true,
            hasSetupPassword: true,
            unlockedTill: null,
            unlockApp: vi.fn(),
            setPassword: vi.fn(),
            setupPassword: vi.fn(),
            lockApp: vi.fn(),
        })

        // Re-render component
        await act(async () => {
            rerender(<WalletDisplay wallet={mockWallet} index={1} />)
        })

        // Private key should not be visible
        expect(screen.queryByText(mockPrivateKey)).not.toBeInTheDocument()
    })
})
