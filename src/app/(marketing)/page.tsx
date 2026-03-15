"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import Link from "next/link"

// Retro 90s landing page
export default function LandingPage() {
  const { publicKey } = useWallet()
  const [hitCount, setHitCount] = useState(42069)
  const [currentTime, setCurrentTime] = useState("")
  
  useEffect(() => {
    setHitCount(prev => prev + Math.floor(Math.random() * 10) + 1)
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleEnter = () => {
    window.location.href = "/app"
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Starry background */}
      <div className="fixed inset-0 bg-black overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: 100 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `twinkle ${2 + Math.random() * 3}s infinite`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Scanlines overlay */}
      <div className="fixed inset-0 pointer-events-none bg-scanlines opacity-30" />

      <div className="relative z-10">
        {/* Top banner with scrolling text */}
        <div className="bg-gradient-to-r from-purple-900 via-red-600 to-blue-900 border-b-4 border-yellow-400 overflow-hidden">
          <div className="text-yellow-400 font-mono text-lg py-2 font-bold animate-marquee whitespace-nowrap">
            ★ WELCOME TO SHITTER SOCIAL ★ THE ONLY PLACE TO DROP YOUR SHITPOSTS ★ CONNECT YOUR WALLET AND JOIN THE CHAOS ★ MEMES ARE MONEY ★&nbsp;&nbsp;&nbsp;&nbsp;★ WELCOME TO SHITTER SOCIAL ★ THE ONLY PLACE TO DROP YOUR SHITPOSTS ★ CONNECT YOUR WALLET AND JOIN THE CHAOS ★ MEMES ARE MONEY ★&nbsp;&nbsp;&nbsp;&nbsp;
          </div>
        </div>

        {/* Main container */}
        <div className="max-w-4xl mx-auto p-4">
          
          {/* Header */}
          <div className="bg-[#1a0033] border-4 border-cyan-400 p-6 text-center mb-6">
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-purple-500 animate-pulse" style={{ 
              textShadow: '3px 3px 0px #ff00ff, -1px -1px 0px #00ffff',
              fontFamily: '"Comic Sans MS", cursive, sans-serif'
            }}>
              ★ SHITTER SOCIAL ★
            </h1>
            <p className="text-cyan-400 font-mono mt-2 text-lg">
              ════════════════════════════════════
            </p>
            <p className="text-green-400 font-mono text-sm">
              &quot;Where degens meet to drop hot takes&quot;
            </p>
          </div>

          {/* Stats bar */}
          <div className="flex justify-center gap-8 mb-6 flex-wrap">
            <div className="bg-black border-2 border-cyan-400 px-4 py-2">
              <span className="text-purple-400 font-mono text-xs">VISITORS:</span>
              <span className="text-green-400 font-mono ml-2 text-xl">{hitCount.toLocaleString()}</span>
            </div>
            <div className="bg-black border-2 border-red-500 px-4 py-2">
              <span className="text-purple-400 font-mono text-xs">ONLINE:</span>
              <span className="text-green-400 font-mono ml-2 text-xl">{Math.floor(Math.random() * 50) + 10}</span>
            </div>
            <div className="bg-black border-2 border-yellow-400 px-4 py-2">
              <span className="text-purple-400 font-mono text-xs">TIME:</span>
              <span className="text-green-400 font-mono ml-2 text-xl">{currentTime || "--:--:--"}</span>
            </div>
          </div>

          {/* Main content - 3 column layout */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Left sidebar */}
            <div className="bg-[#0d001a] border-2 border-purple-600 p-4">
              <h3 className="text-yellow-400 font-mono font-bold text-center border-b-2 border-dashed border-purple-400 pb-2 mb-3">
                ▄▄▄▄ MENU ▄▄▄▄
              </h3>
              <nav className="space-y-2 font-mono text-sm">
                {[
                  { label: "🏠 HOME", href: "#" },
                  { label: "👤 PROFILE", href: "/app/profile" },
                  { label: "🔍 SEARCH", href: "/app/search" },
                  { label: "💬 MESSAGES", href: "/app/messages" },
                  { label: "🔔 NOTIFICATIONS", href: "/app/notifications" },
                ].map((item) => (
                  <div key={item.label} className="text-cyan-300 hover:text-yellow-300 cursor-pointer hover:underline">
                    [{item.label}]
                  </div>
                ))}
              </nav>
              
              <div className="mt-6 text-center">
                <div className="text-pink-500 font-mono text-xs animate-pulse">★ WEBRING ★</div>
                <div className="flex justify-center gap-2 mt-2">
                  <span className="text-2xl">🌐</span>
                  <span className="text-2xl">🕸️</span>
                  <span className="text-2xl">💾</span>
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="md:col-span-2 bg-[#1a0033] border-2 border-cyan-400 p-4">
              <h3 className="text-yellow-400 font-mono font-bold text-center border-b-2 border-dashed border-cyan-400 pb-2 mb-3">
                ▄▄▄▄ WELCOME ▄▄▄▄
              </h3>
              
              {/* Intro text */}
              <div className="text-green-400 font-mono text-sm space-y-3 mb-6">
                <p>
                  <span className="text-yellow-400">►</span> Welcome to Shitter Social, the premier destination for crypto shitposting on Solana!
                </p>
                <p>
                  <span className="text-yellow-400">►</span> Connect your wallet and join thousands of degens sharing hot takes, memes, and alpha.
                </p>
                <p>
                  <span className="text-yellow-400">►</span> No Censorship. No Limits. Just Pure Chaotic Energy.
                </p>
              </div>

              {/* Features list */}
              <div className="bg-black border-2 border-pink-500 p-3 mb-4">
                <h4 className="text-pink-500 font-bold font-mono text-center mb-2">☆ FEATURES ☆</h4>
                <ul className="text-cyan-300 font-mono text-sm space-y-1">
                  <li>💰 Drop posts directly from your wallet</li>
                  <li>🔥 Like, repost, and quote (no engagement farming allowed)</li>
                  <li>📈 Trending topics powered by... vibes</li>
                  <li>🔒 Secure Solana authentication</li>
                  <li>🖼️ Image uploads via R2 (because we&apos;re fancy)</li>
                </ul>
              </div>

              {/* Call to action */}
              <div className="text-center py-4">
                <p className="text-yellow-400 font-mono mb-3">[ CLICK BELOW TO ENTER ]</p>
                
                {publicKey ? (
                  <button
                    onClick={handleEnter}
                    className="bg-green-600 hover:bg-green-500 text-black font-bold font-mono py-3 px-8 text-xl border-4 border-white shadow-[4px_4px_0px_#ff00ff] hover:shadow-[6px_6px_0px_#ff00ff] transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
                  >
                    🚀 ENTER SHITTER
                  </button>
                ) : (
                  <div className="inline-block">
                    <WalletMultiButton className="!bg-yellow-400 !text-black !font-black !font-mono !text-xl !py-3 !px-6 !border-4 !border-white !shadow-[4px_4px_0px_#ff00ff] hover:!bg-yellow-300" />
                  </div>
                )}
              </div>

              {/* Warning box */}
              <div className="border-2 border-red-500 bg-red-900/20 p-2 text-center">
                <p className="text-red-400 font-mono text-xs">
                  ⚠️ WARNING: This site contains high levels of chaos, memes, and alpha. Enter at your own risk!
                </p>
              </div>
            </div>

            {/* Right sidebar */}
            <div className="bg-[#0d001a] border-2 border-purple-600 p-4">
              <h3 className="text-yellow-400 font-mono font-bold text-center border-b-2 border-dashed border-purple-400 pb-2 mb-3">
                ▄▄▄▄ NEWS ▄▄▄▄
              </h3>
              <div className="space-y-3 font-mono text-xs">
                <div className="border-b border-purple-800 pb-2">
                  <div className="text-pink-400">Mar 15, 2026</div>
                  <div className="text-cyan-300">Site launched! 🚀</div>
                </div>
                <div className="border-b border-purple-800 pb-2">
                  <div className="text-pink-400">Coming soon</div>
                  <div className="text-cyan-300">Token launch? 👀</div>
                </div>
                <div>
                  <div className="text-pink-400">Rumors</div>
                  <div className="text-cyan-300">Airdrop confirmed? 💎</div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-yellow-400 font-mono font-bold text-center border-b-2 border-dashed border-purple-400 pb-2 mb-3">
                  ▄▄▄▄ LINKS ▄▄▄▄
                </h3>
                <div className="space-y-2 text-center">
                  <div className="text-cyan-300 hover:text-yellow-300 cursor-pointer">📧 Contact</div>
                  <div className="text-cyan-300 hover:text-yellow-300 cursor-pointer">📜 Rules</div>
                  <div className="text-cyan-300 hover:text-yellow-300 cursor-pointer">⭐ Favorite</div>
                  <div className="text-cyan-300 hover:text-yellow-300 cursor-pointer">📝 Sign Guestbook</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-[#0d001a] border-t-4 border-cyan-400 p-4 text-center">
            <div className="text-purple-400 font-mono text-xs">
              ★ Shitter Social © 2026 ★ All Rights Reserved ★
            </div>
            <div className="text-cyan-600 font-mono text-xs mt-1">
              Best viewed in Netscape Navigator 4.0 at 800x600 resolution
            </div>
            <div className="flex justify-center gap-4 mt-2">
              <span className="text-2xl">🔥</span>
              <span className="text-2xl">💎</span>
              <span className="text-2xl">🐕</span>
              <span className="text-2xl">🚀</span>
            </div>
          </div>

          {/* Under construction banner */}
          <div className="text-center mt-4">
            <span className="text-yellow-400 font-mono text-sm animate-pulse">
              ═══ UNDER CONSTRUCTION ═══
            </span>
          </div>

        </div>
      </div>

      <style jsx global>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
        .bg-scanlines {
          background: repeating-linear-gradient(
            0deg,
            rgba(0, 0, 0, 0.15),
            rgba(0, 0, 0, 0.15) 1px,
            transparent 1px,
            transparent 2px
          );
        }
      `}</style>
    </div>
  )
}