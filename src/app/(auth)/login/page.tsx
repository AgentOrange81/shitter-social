"use client"

import { useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const { connected, publicKey, signMessage } = useWallet()
  const [activeTab, setActiveTab] = useState<"wallet" | "credentials">("wallet")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Credentials form state
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const handleWalletSignIn = async () => {
    if (!connected || !publicKey) {
      setError("Please connect your wallet first")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Create a sign-in message
      const message = `Sign in to Shitter Social\n\nWallet: ${publicKey.toString()}\nTimestamp: ${Date.now()}`
      const messageBytes = new TextEncoder().encode(message)

      // Request signature from wallet
      const signature = await signMessage?.(messageBytes)

      if (!signature) {
        throw new Error("Failed to sign message")
      }

      // Send to NextAuth credentials provider
      const result = await signIn("wallet", {
        walletAddress: publicKey.toString(),
        signature: Array.from(signature).join(","),
        message: message,
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      // Redirect to home on success
      router.push("/")
      router.refresh()
    } catch (err: any) {
      console.error("Sign in error:", err)
      setError(err.message || "Failed to sign in")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!username || !password) {
      setError("Please enter both username and password")
      setIsLoading(false)
      return
    }

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      })

      if (result?.error) {
        throw new Error("Invalid username or password")
      }

      // Redirect to home on success
      router.push("/")
      router.refresh()
    } catch (err: any) {
      console.error("Sign in error:", err)
      setError(err.message || "Failed to sign in")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-shit-darker">
      <div className="max-w-md w-full mx-4 p-8 bg-shit-brown/20 rounded-lg border border-shit-brown/30 shadow-lifted">
        <h1 className="text-2xl font-bold text-gold mb-2">Shitter Social</h1>
        <p className="text-shit-medium mb-6">Sign in to your account</p>

        {/* Tab selector */}
        <div className="flex mb-6 border-b border-shit-brown/30">
          <button
            onClick={() => setActiveTab("wallet")}
            className={`flex-1 py-3 px-4 font-medium transition-colors ${
              activeTab === "wallet"
                ? "text-gold border-b-2 border-gold"
                : "text-shit-medium hover:text-cream"
            }`}
          >
            Wallet
          </button>
          <button
            onClick={() => setActiveTab("credentials")}
            className={`flex-1 py-3 px-4 font-medium transition-colors ${
              activeTab === "credentials"
                ? "text-gold border-b-2 border-gold"
                : "text-shit-medium hover:text-cream"
            }`}
          >
            Username/Password
          </button>
        </div>

        {/* Wallet tab content */}
        {activeTab === "wallet" && (
          <div>
            <div className="mb-6">
              <WalletMultiButton className="!bg-gold !text-shit-darker hover:!bg-gold-light !w-full !h-12 !text-base" />
            </div>

            {connected && publicKey && (
              <button
                onClick={handleWalletSignIn}
                disabled={isLoading}
                className="w-full py-3 px-4 bg-glass hover:bg-gold text-shit-darker font-semibold rounded-md transition-all shadow-glow disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
            )}

            <p className="mt-6 text-xs text-shit-medium">
              Supported wallets: Phantom, Solflare
            </p>
          </div>
        )}

        {/* Credentials tab content */}
        {activeTab === "credentials" && (
          <form onSubmit={handleCredentialsSignIn}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-cream mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-shit-brown/5 border border-shit-brown/30 rounded-md text-cream placeholder-shit-medium focus:outline-none focus:border-glass focus:ring-1 focus:ring-glass transition-all"
                placeholder="Enter your username"
                autoComplete="username"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-cream mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-shit-brown/5 border border-shit-brown/30 rounded-md text-cream placeholder-shit-medium focus:outline-none focus:border-glass focus:ring-1 focus:ring-glass transition-all"
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-glass hover:bg-gold text-shit-darker font-semibold rounded-md transition-all shadow-glow disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>

            <p className="mt-6 text-xs text-shit-medium">
              Don't have a password?{" "}
              <a href="/app/settings/set-password" className="text-gold hover:underline">
                Set one up
              </a>
            </p>
          </form>
        )}

        {error && (
          <p className="mt-4 text-red-400 text-sm">{error}</p>
        )}
      </div>
    </div>
  )
}
