import CryptoJS from "crypto-js"
import { ethers } from "ethers"

/**
 * Generates a new Ethereum wallet
 */
export function generateNewWallet() {
    const wallet = ethers.Wallet.createRandom()
    return {
        address: wallet.address,
        privateKey: wallet.privateKey,
    }
}

/**
 * Encrypts a private key with a password
 */
export function encryptPrivateKey(privateKey: string, password: string): string {
    return CryptoJS.AES.encrypt(privateKey, password).toString()
}

/**
 * Decrypts an encrypted private key with a password
 */
export function decryptPrivateKey(encryptedKey: string, password: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedKey, password)
    const decrypted = bytes.toString(CryptoJS.enc.Utf8)

    if (!decrypted) {
        throw new Error("Incorrect password")
    }

    return decrypted
}

/**
 * Fetches wallet balance from Sepolia testnet
 */
export async function fetchWalletBalance(address: string): Promise<string> {
    try {
        // Using Sepolia testnet
        const provider = new ethers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com")
        const balance = await provider.getBalance(address)
        return ethers.formatEther(balance)
    } catch (error) {
        console.error("Error fetching balance:", error)
        throw error
    }
}
