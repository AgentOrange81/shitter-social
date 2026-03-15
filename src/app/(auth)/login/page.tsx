"use client"

import { useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const { connected, publicKey, signMessage } = useWallet()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSignIn = async () => {
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
      const result = await signIn("credentials", {
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a]">
      <div className="max-w-md w-full mx-4 p-8 bg-[#2d2d2d] rounded-lg border border-[#3d3d3d]">
        <h1 className="text-2xl font-bold text-[#D4AF37] mb-2">Shitter Social</h1>
        <p className="text-[#5a5a5a] mb-8">Sign in with your Solana wallet</p>

        <div className="mb-6">
          <WalletMultiButton className="!bg-[#D4AF37] !text-black hover:!bg-[#E5C76B] !w-full !h-12 !text-base" />
        </div>

        {connected && publicKey && (
          <button
            onClick={handleSignIn}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-[#D4AF37] text-black font-semibold rounded-md hover:bg-[#E5C76B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        )}

        {error && (
          <p className="mt-4 text-red-400 text-sm">{error}</p>
        )}

        <p className="mt-6 text-xs text-[#5a5a5a]">
          Supported wallets: Phantom, Solflare
        </p>
      </div>
    </div>
  )
}