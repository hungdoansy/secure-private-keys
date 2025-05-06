"use client"

import LoginScreen from "@/components/auth/login-screen"
import PasswordSetupScreen from "@/components/auth/password-setup-screen"
import SessionTimer from "@/components/auth/session-timer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import WalletGenerator from "@/components/wallet/wallet-generator"
import WalletList from "@/components/wallet/wallet-list"
import { AuthProvider, useAuthContext } from "@/contexts/auth-context"
import { WalletProvider } from "@/contexts/wallet-context"

export default function WalletManager() {
    return (
        <AuthProvider>
            <WalletProvider>
                <WalletContent />
            </WalletProvider>
        </AuthProvider>
    )
}

function WalletContent() {
    const { isLocked, hasSetupPassword } = useAuthContext()

    return (
        <div className="w-full md:w-[540px] flex flex-col gap-6">
            {!hasSetupPassword ? (
                <PasswordSetupScreen />
            ) : isLocked ? (
                <LoginScreen />
            ) : (
                <>
                    <SecurityControls />
                    <WalletGenerator />
                    <WalletList />
                </>
            )}
        </div>
    )
}

function SecurityControls() {
    return (
        <Card className="w-full text-white space-y-4">
            <div className="flex justify-between">
                <div className="space-y-1">
                    <h2 className="text-lg font-semibold text-white">Session Security</h2>
                    <p className="text-sm text-gray-400">Session expires in 5 minutes</p>
                </div>

                <LockAppButton />
            </div>

            <SessionTimer />
        </Card>
    )
}

function LockAppButton() {
    const { lockApp } = useAuthContext()
    return (
        <Button onClick={lockApp} className="h-9 text-xs bg-red-600 hover:bg-red-700">
            Lock app
        </Button>
    )
}
