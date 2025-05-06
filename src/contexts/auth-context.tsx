"use client"

import { ReactNode, createContext, useContext, useEffect, useState } from "react"

import { SESSION_TIMEOUT, SYSTEM_MESSAGE, SYSTEM_MESSAGE_LOCALSTORAGE_KEY } from "@/constants"
import { decryptPrivateKey, encryptPrivateKey } from "@/lib/wallet"

type AuthContextType = {
    isLocked: boolean
    hasSetupPassword: boolean
    password: string | null
    unlockedTill: number | null
    setPassword: (password: string | null) => void
    unlockApp: (password: string) => boolean
    setupPassword: (password: string) => void
    lockApp: () => void
    resetTimer: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isLocked, setIsLocked] = useState(true)
    const [hasSetupPassword, setHasSetupPassword] = useState(() => {
        const encryptedMessage = localStorage.getItem(SYSTEM_MESSAGE_LOCALSTORAGE_KEY)
        return encryptedMessage !== null
    })
    const [password, setPassword] = useState<string | null>(null)
    const [unlockedTill, setUnlockedTill] = useState<number | null>(null)

    const setupPassword = (newPassword: string) => {
        if (!newPassword) return

        const encryptedMessage = encryptPrivateKey(SYSTEM_MESSAGE, newPassword)
        localStorage.setItem(SYSTEM_MESSAGE_LOCALSTORAGE_KEY, encryptedMessage)

        setPassword(newPassword)
        setHasSetupPassword(true)
        setIsLocked(false)
        setUnlockedTill(Date.now() + SESSION_TIMEOUT)
    }

    const unlockApp = (enteredPassword: string) => {
        if (!enteredPassword || !hasSetupPassword) return false

        try {
            const encryptedMessage = localStorage.getItem(SYSTEM_MESSAGE_LOCALSTORAGE_KEY)
            if (!encryptedMessage) return false

            const decrypted = decryptPrivateKey(encryptedMessage, enteredPassword)

            if (decrypted === SYSTEM_MESSAGE) {
                setPassword(enteredPassword)
                setIsLocked(false)
                setUnlockedTill(Date.now() + SESSION_TIMEOUT)
                return true
            }

            return false
        } catch (error) {
            return false
        }
    }

    const lockApp = () => {
        setIsLocked(true)
        setUnlockedTill(null)
        setPassword(null)
    }

    const resetTimer = () => {
        setUnlockedTill(Date.now() + SESSION_TIMEOUT)
    }

    useEffect(() => {
        if (!unlockedTill) {
            return
        }

        const duration = unlockedTill - Date.now()
        const timeout = setTimeout(() => {
            lockApp()
        }, duration)

        return () => {
            clearTimeout(timeout)
        }
    }, [unlockedTill])

    return (
        <AuthContext.Provider
            value={{
                isLocked,
                hasSetupPassword,
                password,
                unlockedTill,
                setPassword,
                unlockApp,
                setupPassword,
                lockApp,
                resetTimer,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuthContext() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuthContext must be used within an AuthProvider")
    }
    return context
}
