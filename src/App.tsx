import WalletManager from "@/components/wallet/wallet-manager"

export default function App() {
    return (
        <main className="container mx-auto p-6 md:p-8 lg:p-12">
            <h1 className="mb-12 text-4xl font-semibold text-white tracking-[-1px] text-center">
                Secure private keys
            </h1>
            <WalletManager />
        </main>
    )
}
