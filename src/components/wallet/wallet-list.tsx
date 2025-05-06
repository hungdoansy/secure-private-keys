"use client"

import { Card } from "@/components/ui/card"
import WalletDisplay from "@/components/wallet/wallet-display"
import { useWalletContext } from "@/contexts/wallet-context"

export default function WalletList() {
    const { wallets } = useWalletContext()

    return (
        <Card className="w-full text-white space-y-6">
            <div className="space-y-1">
                <h2 className="text-lg font-semibold text-white">Your Wallets</h2>
                <p className="text-sm text-gray-400">
                    {wallets.length
                        ? `You have ${wallets.length} wallet${wallets.length > 1 ? "s" : ""}`
                        : "Generate a wallet to get started"}
                </p>
            </div>

            <div className="space-y-4">
                {wallets.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                        No wallets yet. Create one to get started.
                    </p>
                ) : (
                    wallets.map((wallet, i) => (
                        <WalletDisplay key={wallet.address} wallet={wallet} index={i + 1} />
                    ))
                )}
            </div>
        </Card>
    )
}
