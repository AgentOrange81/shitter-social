"use client"

import { WalletProvider, ConnectionProvider } from "@solana/wallet-adapter-react"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
import { SolflareWalletAdapter } from "@solana/wallet-adapter-wallets"
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom"
import { useMemo } from "react"

// Use adapters that work better in-browser without redirect
const wallets = [
  new PhantomWalletAdapter(),
  new SolflareWalletAdapter(),
]

export function SolanaWalletProvider({ children }: { children: React.ReactNode }) {
  const endpoint = useMemo(() => "https://api.mainnet-beta.solana.com", [])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider className="!overflow-visible">
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

export { useWallet, useConnection } from "@solana/wallet-adapter-react"
