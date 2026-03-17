"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { connected, publicKey } = useWallet();
  const { data: session } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) return;

    let isMounted = true;
    const controller = new AbortController();

    fetch(`/api/users/me`, {
      signal: controller.signal,
      headers: {
        "x-wallet-address": publicKey?.toString() || "",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch profile");
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setUser(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        if (isMounted) {
          console.error("Failed to fetch user:", err);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [session, publicKey]);

  // Guest browsing - show public view without wallet connection
  if (!session) {
    return (
      <div className="min-h-screen bg-shit-darker">
        {/* Header */}
        <div className="bg-shit-brown/10 border-b border-shit-brown/30">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold text-cream">Profile</h1>
          </div>
        </div>

        {/* Guest CTA */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-shit-brown/20 border border-shit-brown/30 rounded-xl p-8 text-center shadow-lifted">
            <h2 className="text-xl font-bold mb-4 text-cream">Connect wallet to edit</h2>
            <p className="text-shit-medium mb-6">
              Sign in to view your profile and access full features
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.push("/login")}
                className="px-6 py-3 bg-glass hover:bg-gold text-shit-darker font-bold rounded-xl transition-all shadow-glow"
              >
                Log In
              </button>
              <button
                onClick={() => router.push("/")}
                className="px-6 py-3 bg-shit-brown/30 hover:bg-shit-brown/50 text-cream font-bold rounded-xl transition-all"
              >
                Browse Posts
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-shit-darker flex items-center justify-center">
        <div className="text-center animate-fade-in-up">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-glass mx-auto mb-4"></div>
          <p className="text-cream">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Profile</h1>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Avatar + Info */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-amber-800 rounded-full flex items-center justify-center text-2xl font-bold">
              {user?.username?.charAt(0).toUpperCase() || user?.displayName?.charAt(0).toUpperCase() || session.user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <h2 className="text-xl font-bold">{user?.username || user?.displayName || session.user?.name || "User"}</h2>
              <p className="text-zinc-400 text-sm">
                {publicKey ? `${publicKey.toString().slice(0, 6)}...${publicKey.toString().slice(-4)}` : "Logged in"}
              </p>
              {user?.createdAt && (
                <p className="text-zinc-500 text-xs mt-1">
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-amber-800">0</div>
            <div className="text-zinc-400 text-sm">Posts</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-amber-800">0</div>
            <div className="text-zinc-400 text-sm">Followers</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-amber-800">0</div>
            <div className="text-zinc-400 text-sm">Following</div>
          </div>
        </div>

        {/* Wallet connection CTA for users without connected wallet */}
        {!connected && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6 text-center">
            <p className="text-zinc-400 mb-4">Connect your wallet to enable full profile features</p>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-3 bg-emerald-600 hover:bg-amber-800 text-white font-bold rounded-xl"
            >
              Connect Wallet
            </button>
          </div>
        )}

        {/* Empty State */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
          <p className="text-zinc-400 mb-4">No posts yet</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-emerald-600 hover:bg-amber-800 text-white font-bold rounded-xl"
          >
            Create Your First Post
          </button>
        </div>
      </div>
    </div>
  );
}
