"use client"

import { WalletProvider, ConnectionProvider } from "@solana/wallet-adapter-react"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
import { SolflareWalletAdapter } from "@solana/wallet-adapter-wallets"
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom"
import { WalletConnectWalletAdapter } from "@solana/wallet-adapter-walletconnect"
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import { useMemo } from "react"

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || ""

// Use adapters that work better in-browser without redirect
const wallets = () => {
  const list: any[] = [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
  ]
  
  // Add WalletConnect if project ID is configured
  if (walletConnectProjectId) {
    list.push(
      new WalletConnectWalletAdapter({
        network: WalletAdapterNetwork.Mainnet,
        options: {
          projectId: walletConnectProjectId,
          metadata: {
            name: "Shitter Social",
            description: "Social for Crypto Degens",
            url: "https://social.shitter.io",
            icons: ["https://social.shitter.io/favicon.ico"],
          },
        },
      })
    )
  }
  
  return list
}

export function SolanaWalletProvider({ children }: { children: React.ReactNode }) {
  const endpoint = useMemo(() => "https://api.mainnet-beta.solana.com", [])
  const walletList = useMemo(() => wallets(), [])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={walletList} autoConnect={true}>
        <WalletModalProvider className="!overflow-visible">
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

export { useWallet, useConnection } from "@solana/wallet-adapter-react"
