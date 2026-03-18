"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import bcrypt from "bcryptjs"

export default function SetPasswordPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to set password")
      }

      setSuccess(true)
      setTimeout(() => {
        router.push("/app/settings")
      }, 1500)
    } catch (err: any) {
      console.error("Set password error:", err)
      setError(err.message || "Failed to set password")
    } finally {
      setIsLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-shit-darker flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-cream">Not Signed In</h1>
          <p className="text-shit-medium mb-4">Please sign in to set your password</p>
          <button
            onClick={() => router.push("/login")}
            className="px-6 py-3 bg-glass hover:bg-gold text-shit-darker font-bold rounded-xl transition-all shadow-glow"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-shit-darker flex items-center justify-center">
        <div className="text-center">
          <div className="text-gold text-6xl mb-4">✓</div>
          <h1 className="text-2xl font-bold mb-4 text-cream">Password Set!</h1>
          <p className="text-shit-medium mb-4">You can now log in with username and password</p>
          <p className="text-shit-medium text-sm">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-shit-darker flex items-center justify-center">
      <div className="max-w-md w-full mx-4 p-8 bg-shit-brown/20 rounded-xl border border-shit-brown/30 shadow-lifted">
        <h1 className="text-2xl font-bold text-gold mb-2">Set Password</h1>
        <p className="text-shit-medium mb-6">Create a password for your account to enable username/password login</p>

        <form onSubmit={handleSetPassword}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-cream mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-shit-brown/5 border border-shit-brown/30 rounded-lg text-cream placeholder-shit-medium focus:outline-none focus:border-glass focus:ring-1 focus:ring-glass transition-all"
              placeholder="Enter password"
              required
              minLength={8}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-cream mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-shit-brown/5 border border-shit-brown/30 rounded-lg text-cream placeholder-shit-medium focus:outline-none focus:border-glass focus:ring-1 focus:ring-glass transition-all"
              placeholder="Confirm password"
              required
              minLength={8}
            />
          </div>

          {error && (
            <p className="mb-4 text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-glass hover:bg-gold text-shit-darker font-semibold rounded-lg transition-all shadow-glow disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {isLoading ? "Setting Password..." : "Set Password"}
          </button>
        </form>

        <p className="mt-6 text-xs text-shit-medium">
          Your password is securely hashed and stored. You can use it to log in from any device.
        </p>
      </div>
    </div>
  )
}
