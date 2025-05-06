import { fireEvent, render, screen } from "@testing-library/react"
import { useEffect } from "react"
import { type Mock, afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { decryptPrivateKey, encryptPrivateKey, generateNewWallet } from "@/lib/wallet"
import type { Wallet } from "@/types/wallet"

import { AuthProvider, useAuthContext } from "../auth-context"
import { WalletProvider, useWalletContext } from "../wallet-context"

// Mock the wallet library functions
vi.mock("@/lib/wallet", () => ({
    encryptPrivateKey: vi.fn(),
    decryptPrivateKey: vi.fn(),
    generateNewWallet: vi.fn(),
}))

// Mock localStorage
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

// Mock AuthContext
vi.mock("../auth-context", () => ({
    useAuthContext: vi.fn().mockReturnValue({
        isLocked: false,
        hasSetupPassword: true,
        password: "testpassword",
        unlockedTill: Date.now() + 300000,
        setPassword: vi.fn(),
        unlockApp: vi.fn(),
        setupPassword: vi.fn(),
        lockApp: vi.fn(),
        resetTimer: vi.fn(),
    }),
    AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

// Test component that uses the context
function TestComponent() {
    const { wallets, generateWallet, decryptPrivateKey } = useWalletContext()
    return (
        <div>
            <div data-testid="wallet-count">{wallets.length}</div>
            <button data-testid="generate-wallet-btn" onClick={() => generateWallet()}>
                Generate
            </button>
            <button
                data-testid="decrypt-key-btn"
                onClick={() => {
                    if (wallets.length > 0) {
                        decryptPrivateKey(wallets[0].encryptedPrivateKey, "testpassword")
                    }
                }}
            >
                Decrypt
            </button>
        </div>
    )
}

// A component that captures the wallet context value
function WalletValueCapture({ onValue }: { onValue: (val: any) => void }) {
    const wallet = useWalletContext()

    useEffect(() => {
        onValue(wallet)
    }, [wallet, onValue])

    return null
}

describe("WalletContext", () => {
    beforeEach(() => {
        localStorageMock.clear()
        vi.clearAllMocks()

        // Reset mock of useAuthContext
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
    })

    afterEach(() => {
        vi.resetAllMocks()
    })

    it("should initialize with empty wallets array", () => {
        render(
            <AuthProvider>
                <WalletProvider>
                    <TestComponent />
                </WalletProvider>
            </AuthProvider>
        )

        expect(screen.getByTestId("wallet-count")).toHaveTextContent("0")
    })

    it("should load wallets from localStorage on initial render", () => {
        const mockWallets: Wallet[] = [
            {
                address: "0x123",
                encryptedPrivateKey: "encrypted123",
                createdAt: new Date().toISOString(),
            },
        ]

        localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(mockWallets))

        render(
            <AuthProvider>
                <WalletProvider>
                    <TestComponent />
                </WalletProvider>
            </AuthProvider>
        )

        expect(screen.getByTestId("wallet-count")).toHaveTextContent("1")
    })

    it("should handle JSON parse error when loading wallets", () => {
        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})
        localStorageMock.getItem.mockReturnValueOnce("invalid-json")

        render(
            <AuthProvider>
                <WalletProvider>
                    <TestComponent />
                </WalletProvider>
            </AuthProvider>
        )

        expect(consoleSpy).toHaveBeenCalledWith(
            "Failed to parse stored wallets:",
            expect.any(Error)
        )
        expect(screen.getByTestId("wallet-count")).toHaveTextContent("0")

        consoleSpy.mockRestore()
    })

    it("should generate a new wallet and store it", () => {
        const mockWallet = {
            address: "0xabc",
            privateKey: "privateKey123",
        }

        // Set mock returns for this test
        ;(generateNewWallet as Mock).mockReturnValue(mockWallet)
        ;(encryptPrivateKey as Mock).mockReturnValue("encryptedKey123")

        const capture = vi.fn()

        render(
            <AuthProvider>
                <WalletProvider>
                    <TestComponent />
                    <WalletValueCapture onValue={capture} />
                </WalletProvider>
            </AuthProvider>
        )

        // Generate wallet
        fireEvent.click(screen.getByTestId("generate-wallet-btn"))

        // Verify wallet was added
        expect(generateNewWallet).toHaveBeenCalled()
        expect(screen.getByTestId("wallet-count")).toHaveTextContent("1")
        expect(encryptPrivateKey).toHaveBeenCalledWith("privateKey123", "testpassword")

        // Verify localStorage was updated
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
            "wallets",
            expect.stringContaining("0xabc")
        )

        // Check that the wallet context has been updated
        expect(capture).toHaveBeenCalledWith(
            expect.objectContaining({
                wallets: expect.arrayContaining([
                    expect.objectContaining({
                        address: "0xabc",
                        encryptedPrivateKey: "encryptedKey123",
                    }),
                ]),
            })
        )
    })

    it("should not generate wallet if password is not available", () => {
        // Override mock to return null password for this test only
        vi.mocked(useAuthContext).mockReturnValueOnce({
            password: null,
            resetTimer: vi.fn(),
            isLocked: true,
            hasSetupPassword: false,
            unlockedTill: 0,
            setupPassword: vi.fn(),
            unlockApp: vi.fn(),
            lockApp: vi.fn(),
            setPassword: vi.fn(),
        })

        render(
            <AuthProvider>
                <WalletProvider>
                    <TestComponent />
                </WalletProvider>
            </AuthProvider>
        )

        fireEvent.click(screen.getByTestId("generate-wallet-btn"))

        expect(generateNewWallet).not.toHaveBeenCalled()
        expect(screen.getByTestId("wallet-count")).toHaveTextContent("0")
    })

    it("should decrypt a private key correctly", () => {
        const mockWallets: Wallet[] = [
            {
                address: "0x123",
                encryptedPrivateKey: "encrypted123",
                createdAt: new Date().toISOString(),
            },
        ]

        localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(mockWallets))
        ;(decryptPrivateKey as Mock).mockReturnValueOnce("decrypted-private-key")

        render(
            <AuthProvider>
                <WalletProvider>
                    <TestComponent />
                </WalletProvider>
            </AuthProvider>
        )

        fireEvent.click(screen.getByTestId("decrypt-key-btn"))

        expect(decryptPrivateKey).toHaveBeenCalledWith("encrypted123", "testpassword")
    })

    it("should throw error when useWallet is used outside WalletProvider", () => {
        // Mock console.error to prevent error from being logged in tests
        const consoleErrorMock = vi.spyOn(console, "error").mockImplementation(() => {})

        expect(() => {
            render(<TestComponent />)
        }).toThrow("useWalletContext must be used within a WalletProvider")

        consoleErrorMock.mockRestore()
    })
})
