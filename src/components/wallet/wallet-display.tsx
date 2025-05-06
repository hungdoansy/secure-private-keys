"use client"

import dayjs from "dayjs"
import { Clock4Icon, ExternalLink, LockIcon, LockOpenIcon } from "lucide-react"
import { useEffect, useState } from "react"

import CopyButton from "@/components/copy-button"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthContext } from "@/contexts/auth-context"
import { useWalletContext } from "@/contexts/wallet-context"
import useRenderEveryInterval from "@/hooks/use-render-every-interval"
import { fetchWalletBalance } from "@/lib/wallet"
import type { Wallet } from "@/types/wallet"

type WalletDisplayProps = {
    index: number
    wallet: Wallet
}

export default function WalletDisplay({ wallet, index }: WalletDisplayProps) {
    const [showPrivateKey, setShowPrivateKey] = useState(false)
    const [passwordConfirmation, setPasswordConfirmation] = useState("")
    const [privateKey, setPrivateKey] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [balance, setBalance] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const { password, resetTimer } = useAuthContext()
    const { decryptPrivateKey } = useWalletContext()

    useEffect(() => {
        const getBalance = async () => {
            try {
                setLoading(true)
                const bal = await fetchWalletBalance(wallet.address)
                setBalance(bal)
            } catch (err) {
                console.error("Failed to fetch balance:", err)
                setBalance("Error")
            } finally {
                setLoading(false)
            }
        }

        getBalance()
    }, [wallet.address])

    // Close private key view when app is locked
    useEffect(() => {
        if (!password) {
            handleHidePrivateKey()
        }
    }, [password])

    const handleRevealPrivateKey = () => {
        setError(null)
        resetTimer() // Reset timer when viewing private key

        if (!password) {
            setError("Session expired. Please log in again.")
            return
        }

        if (!passwordConfirmation) {
            setError("Please confirm your password")
            return
        }

        if (passwordConfirmation !== password) {
            setError("Incorrect password")
            setPasswordConfirmation("")
            return
        }

        try {
            const key = decryptPrivateKey(wallet.encryptedPrivateKey, password)
            setPrivateKey(key)
            setShowPrivateKey(true)
            setPasswordConfirmation("")
        } catch (err) {
            setError("Failed to decrypt private key")
        }
    }

    const handleHidePrivateKey = () => {
        setShowPrivateKey(false)
        setPrivateKey(null)
        setPasswordConfirmation("")
    }

    return (
        <Card className="border text-white space-y-4">
            <div className="flex-none flex items-end justify-between">
                <span className="text-xl text-secondary">Wallet {index}</span>
                <div
                    className="flex-none flex items-center gap-1 text-gray-400"
                    title={wallet.createdAt}
                >
                    <Clock4Icon className="size-3 flex-none" />
                    <CreatedAt createdAt={wallet.createdAt} />
                </div>
            </div>

            <div className="w-full h-0 border-b" />

            {/* Address */}
            <div className="space-y-2">
                <div className="flex items-end justify-between">
                    <Label className="font-medium text-white">Address</Label>
                    <CopyButton content={wallet.address} />
                </div>
                <div className="px-2 h-9 flex items-center bg-[#272626] rounded-md overflow-x-auto">
                    <code className="text-xs break-all text-gray-100">{wallet.address}</code>
                </div>
            </div>

            {/* Balance */}
            <div className="space-y-2">
                <div className="flex items-end justify-between">
                    <Label className="font-medium text-white">Balance</Label>
                    <a
                        href={`https://sepolia.etherscan.io/address/${wallet.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs flex items-center text-blue-400 hover:underline"
                    >
                        View on Etherscan <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                </div>
                <div className="px-2 h-9 flex items-center bg-[#272626] rounded-md overflow-x-auto">
                    <p className="text-xs text-gray-200">
                        {loading ? "fetching..." : `${balance || "0"} ETH (Sepolia Testnet)`}
                    </p>
                </div>
            </div>

            {/* Private Key Section */}
            <div className="space-y-2">
                {showPrivateKey && privateKey ? (
                    <div className="space-y-2 group">
                        <div className="flex items-center justify-between">
                            <Label className="font-medium text-white">Private Key</Label>
                            <div className="flex-none flex items-center gap-2">
                                <CopyButton content={privateKey} />
                                <Button
                                    onClick={handleHidePrivateKey}
                                    title="Hide private key"
                                    className="p-0 flex-none size-6 flex items-center justify-center rounded-md"
                                >
                                    <LockIcon className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="p-2 bg-[#272626] rounded-md overflow-x-auto">
                            <code className="text-xs break-all text-gray-100 blur-md group-hover:blur-none transition duration-200">
                                {privateKey}
                            </code>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <Label htmlFor={`password-${wallet.address}`} className="text-white">
                            View private key
                        </Label>
                        <div className="flex space-x-2">
                            <Input
                                id={`password-${wallet.address}`}
                                type="password"
                                value={passwordConfirmation}
                                onChange={(e) => setPasswordConfirmation(e.target.value)}
                                placeholder="Confirm your password"
                                className="flex-none"
                            />
                            <Button
                                onClick={handleRevealPrivateKey}
                                title="Show private key"
                                className="p-0 flex-none size-9 flex items-center justify-center rounded-md"
                            >
                                <LockOpenIcon className="h-4 w-4" />
                            </Button>
                        </div>
                        {error && <p className="text-xs text-red-500">{error}</p>}
                    </div>
                )}
            </div>
        </Card>
    )
}

function CreatedAt({ createdAt }: { createdAt: string }) {
    // Refresh every 5 minutes
    useRenderEveryInterval(300_000, new Date(Date.now() + 600_000))

    return (
        <time className="text-xs border-b border-dashed" dateTime={createdAt}>
            {dayjs(new Date(createdAt)).fromNow()}
        </time>
    )
}
