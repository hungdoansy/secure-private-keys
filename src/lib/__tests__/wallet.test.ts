import CryptoJS from "crypto-js"
import { ethers } from "ethers"
import { type Mock, afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
    decryptPrivateKey,
    encryptPrivateKey,
    fetchWalletBalance,
    generateNewWallet,
} from "../wallet"

// Mock ethers
vi.mock("ethers", async () => {
    const actual = await vi.importActual("ethers")
    // Define a mocked provider class
    class MockedProvider {
        getBalance = vi.fn()
    }

    return {
        ...actual,
        Wallet: {
            createRandom: vi.fn(),
        },
        JsonRpcProvider: vi.fn(() => new MockedProvider()),
        formatEther: vi.fn(),
    }
})

describe("wallet.ts", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    afterEach(() => {
        vi.resetAllMocks()
    })

    describe("generateNewWallet", () => {
        it("should generate a new wallet with address and private key", () => {
            const mockWallet = {
                address: "0x1234567890123456789012345678901234567890",
                privateKey: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
            }

            vi.spyOn(ethers.Wallet, "createRandom").mockReturnValueOnce(mockWallet as any)

            const result = generateNewWallet()

            expect(ethers.Wallet.createRandom).toHaveBeenCalledTimes(1)
            expect(result).toEqual({
                address: mockWallet.address,
                privateKey: mockWallet.privateKey,
            })
        })
    })

    describe("encryptPrivateKey", () => {
        it("should encrypt a private key with the given password", () => {
            const privateKey = "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
            const password = "secure_password"
            const mockEncrypted = "encrypted_result"

            const encryptSpy = vi.spyOn(CryptoJS.AES, "encrypt").mockReturnValueOnce({
                toString: () => mockEncrypted,
            } as any)

            const result = encryptPrivateKey(privateKey, password)

            expect(encryptSpy).toHaveBeenCalledWith(privateKey, password)
            expect(result).toBe(mockEncrypted)
        })
    })

    describe("decryptPrivateKey", () => {
        it("should decrypt an encrypted private key with the correct password", () => {
            const encryptedKey = "encrypted_key"
            const password = "secure_password"
            const decryptedKey =
                "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"

            const decryptSpy = vi.spyOn(CryptoJS.AES, "decrypt").mockReturnValueOnce({
                toString: vi.fn().mockReturnValueOnce(decryptedKey),
            } as any)

            const result = decryptPrivateKey(encryptedKey, password)

            expect(decryptSpy).toHaveBeenCalledWith(encryptedKey, password)
            expect(result).toBe(decryptedKey)
        })

        it("should throw an error if password is incorrect", () => {
            const encryptedKey = "encrypted_key"
            const password = "wrong_password"

            vi.spyOn(CryptoJS.AES, "decrypt").mockReturnValueOnce({
                toString: vi.fn().mockReturnValueOnce(""),
            } as any)

            expect(() => decryptPrivateKey(encryptedKey, password)).toThrow("Incorrect password")
        })
    })

    describe("fetchWalletBalance", () => {
        it("should fetch wallet balance from Sepolia testnet", async () => {
            const address = "0x1234567890123456789012345678901234567890"
            const mockBalance = BigInt(1000000000000000000) // 1 ETH
            const mockFormattedBalance = "1.0"

            // https://soorria.com/snippets/mocking-classes-vitest
            const getBalanceMock = vi.spyOn(ethers.JsonRpcProvider.prototype, "getBalance")

            getBalanceMock.mockResolvedValueOnce(mockBalance)

            const result = await fetchWalletBalance(address)

            expect(getBalanceMock).toHaveBeenCalledWith(address)
            expect(result).toBe(mockFormattedBalance)
        })

        it("should throw error when fetching balance fails", async () => {
            const address = "0x1234567890123456789012345678901234567890"
            const errorMessage = "Network error"

            const provider = new ethers.JsonRpcProvider()

            // Cast getBalance so we can control it
            const getBalanceMock = provider.getBalance as Mock
            getBalanceMock.mockRejectedValueOnce(new Error(errorMessage))
            await expect(fetchWalletBalance(address)).rejects.toThrow()
        })
    })
})
