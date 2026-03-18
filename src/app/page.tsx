"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-shit-darker">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-8xl mb-6 animate-float">💩</div>
            <h1 className="text-5xl md:text-7xl font-bold text-cream mb-6">
              Welcome to <span className="text-glass">Shitter</span>
            </h1>
            <p className="text-xl md:text-2xl text-shit-medium mb-8 max-w-3xl mx-auto">
              The gold standard in social media for crypto degens. 
              Post, like, repost, and connect with the community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button className="px-8 py-4 bg-glass hover:bg-gold text-shit-darker text-lg font-bold rounded-xl shadow-glow transition-all">
                  Connect Wallet
                </Button>
              </Link>
              <Link href="/app/explore">
                <Button className="px-8 py-4 bg-shit-brown/30 hover:bg-shit-brown/50 text-cream text-lg font-bold rounded-xl transition-all">
                  Browse Posts
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-shit-brown/10 border-y border-shit-brown/30">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-shit-brown/20 border-shit-brown/30 p-6 text-center shadow-lifted">
              <div className="text-4xl mb-4">🔗</div>
              <h3 className="text-xl font-bold text-cream mb-2">Connect Wallet</h3>
              <p className="text-shit-medium">Sign in with your Solana wallet and join the degen community</p>
            </Card>
            <Card className="bg-shit-brown/20 border-shit-brown/30 p-6 text-center shadow-lifted">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-bold text-cream mb-2">Post & Engage</h3>
              <p className="text-shit-medium">Share your thoughts, like posts, repost, and join conversations</p>
            </Card>
            <Card className="bg-shit-brown/20 border-shit-brown/30 p-6 text-center shadow-lifted">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-bold text-cream mb-2">Launch Tokens</h3>
              <p className="text-shit-medium">Create and promote your own memecoins with integrated launch tools</p>
            </Card>
          </div>
        </div>
      </div>

      {/* Ecosystem Section */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-cream mb-4">Shitter Ecosystem</h2>
          <p className="text-shit-medium text-lg">More than just social — a full degen platform</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-shit-brown/20 border-shit-brown/30 p-6 shadow-lifted">
            <h3 className="text-xl font-bold text-glass mb-2">💩 Shit Launcher</h3>
            <p className="text-shit-medium mb-4">Launch your own memecoins on Solana with ease</p>
            <Link href="https://launch.shitter.io" target="_blank">
              <Button className="w-full bg-glass hover:bg-gold text-shit-darker">
                Launch Token
              </Button>
            </Link>
          </Card>
          <Card className="bg-shit-brown/20 border-shit-brown/30 p-6 shadow-lifted">
            <h3 className="text-xl font-bold text-glass mb-2">📊 Shit Screener</h3>
            <p className="text-shit-medium mb-4">Track memecoin prices, volume, and market caps</p>
            <Link href="https://screener.shitter.io" target="_blank">
              <Button className="w-full bg-glass hover:bg-gold text-shit-darker">
                View Tokens
              </Button>
            </Link>
          </Card>
          <Card className="bg-shit-brown/20 border-shit-brown/30 p-6 shadow-lifted">
            <h3 className="text-xl font-bold text-glass mb-2">💬 Shitter Social</h3>
            <p className="text-shit-medium mb-4">Connect with the community and share your degen journey</p>
            <Link href="/app/explore">
              <Button className="w-full bg-glass hover:bg-gold text-shit-darker">
                Join Now
              </Button>
            </Link>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-shit-brown/10 border-t border-shit-brown/30">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-cream mb-4">Ready to Join?</h2>
          <p className="text-shit-medium text-lg mb-8">Connect your wallet and start posting today</p>
          <Link href="/login">
            <Button className="px-8 py-4 bg-glass hover:bg-gold text-shit-darker text-lg font-bold rounded-xl shadow-glow transition-all">
              Get Started
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-shit-brown/30 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-shit-medium text-sm">
          <p>🐸 Built by degens, for degens</p>
          <div className="mt-4 flex justify-center gap-6">
            <Link href="https://launch.shitter.io" className="hover:text-glass transition-colors">Launcher</Link>
            <Link href="https://screener.shitter.io" className="hover:text-glass transition-colors">Screener</Link>
            <Link href="/app/explore" className="hover:text-glass transition-colors">Social</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
