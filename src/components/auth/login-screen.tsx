"use client"

import { LockIcon } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthContext } from "@/contexts/auth-context"

export default function LoginScreen() {
    const [password, setPassword] = useState("")
    const [error, setError] = useState<string | null>(null)
    const { unlockApp } = useAuthContext()

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!password) {
            setError("Password is required")
            return
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters")
            return
        }

        const success = unlockApp(password)
        if (!success) {
            setError("Incorrect password")
        }
    }

    return (
        <div className="w-full h-full flex items-center justify-center">
            <Card className="w-full space-y-8 bg-[#1b1b1c] text-white">
                <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="h-16 w-16 rounded-full bg-[#2c2c2d] flex items-center justify-center">
                        <LockIcon className="h-8 w-8 text-[#48ff91]" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Unlock Wallet Manager</h1>
                    <p className="text-sm text-gray-400 text-center">
                        Enter your password to access your wallets
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            className="bg-[#272626]"
                        />
                        {error && <p className="text-xs text-red-500">{error}</p>}
                    </div>

                    <Button type="submit" className="w-full">
                        Unlock
                    </Button>
                </form>
            </Card>
        </div>
    )
}
