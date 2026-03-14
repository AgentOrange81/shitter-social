"use client"

import { WalletProvider } from "@solana/wallet-adapter-react"
import { SolflareWalletAdapter } from "@solana/wallet-adapter-wallets"
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom"
import { BackpackWalletAdapter } from "@solana/wallet-adapter-backpack"
import { LedgerWalletAdapter } from "@solana/wallet-adapter-ledger"

const wallets = [
  new PhantomWalletAdapter(),
  new SolflareWalletAdapter(),
  new BackpackWalletAdapter(),
  new LedgerWalletAdapter(),
]

export function SolanaWalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <WalletProvider wallets={wallets} autoConnect={false}>
      {children}
    </WalletProvider>
  )
}

export { useWallet } from "@solana/wallet-adapter-react"
