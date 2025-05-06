"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAuthContext } from "@/contexts/auth-context"
import { useWalletContext } from "@/contexts/wallet-context"

export default function WalletGenerator() {
    const [error, setError] = useState<string | null>(null)
    const { generateWallet } = useWalletContext()
    const { resetTimer } = useAuthContext()

    const handleGenerateWallet = () => {
        setError(null)

        try {
            generateWallet()
            resetTimer()
        } catch (err) {
            setError("Failed to generate wallet. Please try again.")
        }
    }

    return (
        <Card className="w-full text-white space-y-6">
            <div className="space-y-1">
                <h2 className="text-lg font-semibold text-white">Generate New Wallet</h2>
                <p className="text-sm text-gray-400">
                    Your private key is securely encrypted with your password
                </p>
            </div>

            <div className="space-y-4">
                {error && (
                    <div className="flex items-start space-x-2 text-red-500 text-sm">
                        <div className="h-4 w-4 flex-shrink-0 mt-0.5 rounded-full bg-red-500" />
                        <div>{error}</div>
                    </div>
                )}
            </div>

            <div>
                <Button onClick={handleGenerateWallet} className="w-full">
                    Generate Wallet
                </Button>
            </div>
        </Card>
    )
}
