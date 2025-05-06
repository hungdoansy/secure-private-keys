"use client"

import { type ReactNode, createContext, useContext, useEffect, useState } from "react"

import { useAuthContext } from "@/contexts/auth-context"
import { decryptPrivateKey, encryptPrivateKey, generateNewWallet } from "@/lib/wallet"
import type { Wallet } from "@/types/wallet"

type WalletContextType = {
    wallets: Wallet[]
    generateWallet: () => void
    decryptPrivateKey: (encryptedKey: string, password: string) => string
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
    const [wallets, setWallets] = useState<Wallet[]>([])
    const auth = useAuthContext()

    // Safely access auth properties
    const password = auth?.password
    const resetTimer = auth?.resetTimer || (() => {})

    // Load wallets from localStorage on initial render
    useEffect(() => {
        const storedWallets = localStorage.getItem("wallets")
        if (storedWallets) {
            try {
                setWallets(JSON.parse(storedWallets))
            } catch (error) {
                console.error("Failed to parse stored wallets:", error)
            }
        }
    }, [])

    const generateWallet = () => {
        if (!password) return

        resetTimer() // Reset timer on wallet generation

        const { address, privateKey } = generateNewWallet()
        const encryptedKey = encryptPrivateKey(privateKey, password)

        const newWallet: Wallet = {
            address,
            encryptedPrivateKey: encryptedKey,
            createdAt: new Date().toISOString(),
        }

        const newWallets = [...wallets, newWallet]
        setWallets(newWallets)
        localStorage.setItem("wallets", JSON.stringify(newWallets))
    }

    return (
        <WalletContext.Provider
            value={{
                wallets,
                generateWallet,
                decryptPrivateKey,
            }}
        >
            {children}
        </WalletContext.Provider>
    )
}

export function useWalletContext() {
    const context = useContext(WalletContext)
    if (context === undefined) {
        throw new Error("useWalletContext must be used within a WalletProvider")
    }
    return context
}
