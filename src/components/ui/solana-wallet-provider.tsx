"use client";

import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { WalletConnectWalletAdapter } from "@solana/wallet-adapter-walletconnect";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { useMemo } from "react";

const WalletContextProvider = ({ children }: { children: React.ReactNode }) => {
  const network = WalletAdapterNetwork.Mainnet;
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new WalletConnectWalletAdapter({
        network,
        options: {
          projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "",
          metadata: {
            name: "Shitter Social",
            description: "Social for Crypto Degens",
            url: "https://social.shitter.io",
            icons: ["https://social.shitter.io/favicon.ico"],
          },
        },
      }),
    ],
    []
  );

  const endpoint = "https://api.mainnet-beta.solana.com";

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default WalletContextProvider;
export { useWallet, useConnection } from "@solana/wallet-adapter-react";
