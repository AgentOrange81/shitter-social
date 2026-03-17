"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Post {
  id: string;
  content: string;
  authorId: string;
  authorUsername?: string;
  createdAt: string;
  likes?: number;
  replies?: number;
  reposts?: number;
}

export default function HomeFeedPage() {
  const { connected } = useWallet();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/posts/feed")
      .then((res) => res.json())
      .then((data) => {
        setPosts(data.posts || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch posts:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white">
        {/* Header with Wallet */}
        <div className="bg-zinc-900 border-b border-zinc-800">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold">
              <span className="text-emerald-500">SHIT</span>TER
            </h1>
            <WalletMultiButton className="!bg-emerald-600 !hover:bg-emerald-500 !text-white !font-bold !px-4 !py-2 !rounded-xl !text-sm" />
          </div>
        </div>
        <div className="flex items-center justify-center py-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header with Wallet */}
      <div className="bg-zinc-900 border-b border-zinc-800 sticky top-0">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            <span className="text-emerald-500">SHIT</span>TER
          </h1>
          <WalletMultiButton className="!bg-emerald-600 !hover:bg-emerald-500 !text-white !font-bold !px-4 !py-2 !rounded-xl !text-sm" />
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-zinc-900/50 border-b border-zinc-800">
        <div className="max-w-2xl mx-auto px-4 py-2">
          <nav className="flex space-x-6 text-sm">
            <Link href="/app/explore" className="text-emerald-500 font-medium">Explore</Link>
            {connected ? (
              <>
                <Link href="/app/notifications" className="text-zinc-400 hover:text-white">Notifications</Link>
                <Link href="/app/messages" className="text-zinc-400 hover:text-white">Messages</Link>
                <Link href="/app/bookmarks" className="text-zinc-400 hover:text-white">Bookmarks</Link>
                <Link href="/app/profile" className="text-zinc-400 hover:text-white">Profile</Link>
              </>
            ) : (
              <Link href="/login" className="text-zinc-400 hover:text-white">Log In</Link>
            )}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto">
        {posts.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">🐸</div>
            <h2 className="text-xl font-bold mb-2">No Posts Yet</h2>
            <p className="text-zinc-400 mb-6">Be the first to post something!</p>
            {connected ? (
              <button
                onClick={() => router.push("/app/posts/new")}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl"
              >
                Create Post
              </button>
            ) : (
              <Link
                href="/login"
                className="inline-block px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl"
              >
                Connect Wallet
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/app/posts/${post.id}`}
                className="block p-4 hover:bg-zinc-900 transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {post.authorUsername?.charAt(0).toUpperCase() || "A"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-bold text-white">
                        {post.authorUsername || "Anonymous"}
                      </span>
                      <span className="text-zinc-500 text-sm">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-white whitespace-pre-wrap">{post.content}</p>
                    <div className="flex items-center space-x-6 mt-3 text-zinc-500 text-sm">
                      <span>💬 {post.replies || 0}</span>
                      <span>🔄 {post.reposts || 0}</span>
                      <span>❤️ {post.likes || 0}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="py-8 text-center text-zinc-600 text-sm">
        <p>🐸 Built by degens, for degens</p>
      </footer>
    </div>
  );
}
