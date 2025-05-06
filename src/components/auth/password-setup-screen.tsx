"use client"

import { KeyIcon } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthContext } from "@/contexts/auth-context"

export default function PasswordSetupScreen() {
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState<string | null>(null)
    const { setupPassword } = useAuthContext()

    const handleSetupPassword = (e: React.FormEvent) => {
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

        if (password !== confirmPassword) {
            setError("Passwords do not match")
            return
        }

        setupPassword(password)
    }

    return (
        <Card className="w-full space-y-8 bg-[#1b1b1c] text-white">
            <div className="flex flex-col items-center justify-center space-y-2">
                <div className="h-16 w-16 rounded-full bg-[#2c2c2d] flex items-center justify-center">
                    <KeyIcon className="h-8 w-8 text-[#48ff91]" />
                </div>
                <h1 className="text-2xl font-bold text-white">Create Password</h1>
                <p className="text-sm text-gray-400 text-center">
                    Set up a password to secure your wallet manager
                </p>
            </div>

            <form onSubmit={handleSetupPassword} className="space-y-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter a secure password"
                            className="bg-[#272626]"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm your password"
                            className="bg-[#272626]"
                        />
                    </div>

                    {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
                </div>

                <Button type="submit" className="w-full">
                    Create Password
                </Button>
            </form>
        </Card>
    )
}
