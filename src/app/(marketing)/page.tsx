"use client";

import Link from "next/link";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";

export default function LandingPage() {
  const { connected } = useWallet();

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Hero */}
      <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-4">
          <span className="text-emerald-500">SHIT</span>TER
        </h1>
        <p className="text-3xl font-bold text-white mb-2">
          Where Degens Hang Out
        </p>
        <p className="text-xl text-zinc-400 mb-8">
          The social layer for Solana token traders
        </p>

        {/* Wallet Connect */}
        <div className="mb-8">
          <WalletMultiButton className="!bg-emerald-600 !hover:bg-emerald-500 !text-white !font-bold !px-6 !py-3 !rounded-xl" />
        </div>

        {connected && (
          <Link
            href="/app"
            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all"
          >
            Enter Shitter →
          </Link>
        )}
      </div>

      {/* Features */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          <Link
            href="https://screener.shitter.io"
            className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-emerald-500 transition-all"
          >
            <div className="text-emerald-500 font-bold text-xl mb-2">📊 Screener</div>
            <div className="text-zinc-400">Token analytics & charts</div>
          </Link>
          <Link
            href="https://launch.shitter.io"
            className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-emerald-500 transition-all"
          >
            <div className="text-emerald-500 font-bold text-xl mb-2">🚀 Launch</div>
            <div className="text-zinc-400">Deploy your own tokens</div>
          </Link>
          <Link
            href="https://www.shitter.io"
            className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-emerald-500 transition-all"
          >
            <div className="text-emerald-500 font-bold text-xl mb-2">🏠 Home</div>
            <div className="text-zinc-400">Back to main site</div>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 text-center text-zinc-600 text-sm">
        <p>🐸 Built by degens, for degens</p>
      </footer>
    </div>
  );
}