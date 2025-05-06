import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { useWalletContext } from "@/contexts/wallet-context"
import type { Wallet } from "@/types/wallet"

import WalletList from "../wallet-list"

// Mock dependencies
vi.mock("@/contexts/wallet-context", () => ({
    useWalletContext: vi.fn(),
}))

vi.mock("../wallet-display", () => ({
    default: ({ wallet, index }: { wallet: Wallet; index: number }) => (
        <div data-testid={`wallet-display-${index}`}>
            Wallet Display {index}: {wallet.address}
        </div>
    ),
}))

describe("WalletList", () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    it("should render empty state when no wallets exist", () => {
        vi.mocked(useWalletContext).mockReturnValue({
            wallets: [],
            generateWallet: vi.fn(),
            decryptPrivateKey: vi.fn(),
        })

        render(<WalletList />)

        expect(screen.getByText("Your Wallets")).toBeInTheDocument()
        expect(screen.getByText("Generate a wallet to get started")).toBeInTheDocument()
        expect(screen.getByText("No wallets yet. Create one to get started.")).toBeInTheDocument()
    })

    it("should render wallet count when wallets exist", () => {
        const mockWallets: Wallet[] = [
            {
                address: "0x123",
                encryptedPrivateKey: "encrypted123",
                createdAt: new Date().toISOString(),
            },
        ]

        vi.mocked(useWalletContext).mockReturnValue({
            wallets: mockWallets,
            generateWallet: vi.fn(),
            decryptPrivateKey: vi.fn(),
        })

        render(<WalletList />)

        expect(screen.getByText("Your Wallets")).toBeInTheDocument()
        expect(screen.getByText("You have 1 wallet")).toBeInTheDocument()
    })

    it("should render multiple wallets", () => {
        const mockWallets: Wallet[] = [
            {
                address: "0x123",
                encryptedPrivateKey: "encrypted123",
                createdAt: new Date().toISOString(),
            },
            {
                address: "0x456",
                encryptedPrivateKey: "encrypted456",
                createdAt: new Date().toISOString(),
            },
        ]

        vi.mocked(useWalletContext).mockReturnValue({
            wallets: mockWallets,
            generateWallet: vi.fn(),
            decryptPrivateKey: vi.fn(),
        })

        render(<WalletList />)

        expect(screen.getByText("You have 2 wallets")).toBeInTheDocument()
        expect(screen.getByTestId("wallet-display-1")).toBeInTheDocument()
        expect(screen.getByTestId("wallet-display-2")).toBeInTheDocument()
    })
})
