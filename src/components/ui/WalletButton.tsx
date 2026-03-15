"use client"

import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { useState, useEffect } from "react"
import { signIn, signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export function WalletButton() {
  const { publicKey, disconnect, signMessage } = useWallet()
  const { connection } = useConnection()
  const [balance, setBalance] = useState<number | null>(null)
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (publicKey && connection) {
      connection.getBalance(publicKey).then((lamports) => {
        setBalance(lamports / 1e9)
      }).catch(() => setBalance(null))
    } else {
      setBalance(null)
    }
  }, [publicKey, connection])

  // Auto sign-in when wallet connects
  useEffect(() => {
    const autoSignIn = async () => {
      if (publicKey && status === "unauthenticated" && signMessage) {
        try {
          const message = `Sign in to Shitter Social\n\nWallet: ${publicKey.toString()}\nTimestamp: ${Date.now()}`
          const messageBytes = new TextEncoder().encode(message)
          const signature = await signMessage(messageBytes)
          
          if (signature) {
            await signIn("credentials", {
              walletAddress: publicKey.toString(),
              signature: Array.from(signature).join(","),
              message: message,
              redirect: false,
            })
          }
        } catch (err) {
          console.error("Auto sign-in failed:", err)
        }
      }
    }
    autoSignIn()
  }, [publicKey, status, signMessage])

  const handleDisconnect = async () => {
    await disconnect()
    await signOut({ redirect: false })
    router.push("/login")
  }

  if (status === "loading") {
    return (
      <button className="border border-gold text-gold font-bold py-2 px-4 rounded-md">
        Loading...
      </button>
    )
  }

  if (!publicKey) {
    return (
      <WalletMultiButton className="!bg-gold !text-shit-darker !font-bold !rounded-md !h-10 !px-4 hover:!bg-gold-light transition-colors" />
    )
  }

  const shortAddress = `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`

  return (
    <div className="flex items-center gap-3">
      {balance !== null && (
        <span className="text-sm text-gold font-medium">
          {balance.toFixed(2)} SOL
        </span>
      )}
      <button
        onClick={handleDisconnect}
        className="border border-gold text-gold hover:bg-gold hover:text-shit-darker font-bold py-2 px-4 rounded-md transition-colors"
      >
        {shortAddress}
      </button>
    </div>
  )
}