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
    <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a]">
      <div className="max-w-md w-full mx-4 p-8 bg-[#2d2d2d] rounded-lg border border-[#3d3d3d]">
        <h1 className="text-2xl font-bold text-[#D4AF37] mb-2">Shitter Social</h1>
        <p className="text-[#5a5a5a] mb-6">Sign in to your account</p>

        {/* Tab selector */}
        <div className="flex mb-6 border-b border-[#3d3d3d]">
          <button
            onClick={() => setActiveTab("wallet")}
            className={`flex-1 py-3 px-4 font-medium transition-colors ${
              activeTab === "wallet"
                ? "text-[#D4AF37] border-b-2 border-[#D4AF37]"
                : "text-[#5a5a5a] hover:text-[#8a8a8a]"
            }`}
          >
            Wallet
          </button>
          <button
            onClick={() => setActiveTab("credentials")}
            className={`flex-1 py-3 px-4 font-medium transition-colors ${
              activeTab === "credentials"
                ? "text-[#D4AF37] border-b-2 border-[#D4AF37]"
                : "text-[#5a5a5a] hover:text-[#8a8a8a]"
            }`}
          >
            Username/Password
          </button>
        </div>

        {/* Wallet tab content */}
        {activeTab === "wallet" && (
          <div>
            <div className="mb-6">
              <WalletMultiButton className="!bg-[#D4AF37] !text-black hover:!bg-[#E5C76B] !w-full !h-12 !text-base" />
            </div>

            {connected && publicKey && (
              <button
                onClick={handleWalletSignIn}
                disabled={isLoading}
                className="w-full py-3 px-4 bg-[#D4AF37] text-black font-semibold rounded-md hover:bg-[#E5C76B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
            )}

            <p className="mt-6 text-xs text-[#5a5a5a]">
              Supported wallets: Phantom, Solflare
            </p>
          </div>
        )}

        {/* Credentials tab content */}
        {activeTab === "credentials" && (
          <form onSubmit={handleCredentialsSignIn}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#8a8a8a] mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#3d3d3d] rounded-md text-white placeholder-[#5a5a5a] focus:outline-none focus:border-[#D4AF37]"
                placeholder="Enter your username"
                autoComplete="username"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-[#8a8a8a] mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#3d3d3d] rounded-md text-white placeholder-[#5a5a5a] focus:outline-none focus:border-[#D4AF37]"
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-[#D4AF37] text-black font-semibold rounded-md hover:bg-[#E5C76B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>

            <p className="mt-6 text-xs text-[#5a5a5a]">
              Don't have a password?{" "}
              <a href="/app/settings/set-password" className="text-[#D4AF37] hover:underline">
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
