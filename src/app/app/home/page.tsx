"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Post {
  id: string;
  content: string;
  authorId: string;
  author?: {
    id: string;
    username?: string;
    displayName?: string;
    avatar?: string;
  };
  createdAt: string;
  _count?: {
    likes: number;
    replies: number;
    reposts: number;
  };
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
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-800 mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 sticky top-0">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Home</h1>
          <p className="text-zinc-400 text-sm mt-1">Your feed</p>
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
                onClick={() => router.push("/")}
                className="px-6 py-3 bg-emerald-600 hover:bg-amber-800 text-white font-bold rounded-xl"
              >
                Create Post
              </button>
            ) : (
              <button
                onClick={() => router.push("/")}
                className="px-6 py-3 bg-emerald-600 hover:bg-amber-800 text-white font-bold rounded-xl"
              >
                Connect Wallet
              </button>
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
                  <div className="w-10 h-10 bg-amber-800 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {post.author?.username?.charAt(0).toUpperCase() || post.author?.displayName?.charAt(0).toUpperCase() || "A"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-bold text-white">
                        {post.author?.username || post.author?.displayName || "Anonymous"}
                      </span>
                      <span className="text-zinc-500 text-sm">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-white whitespace-pre-wrap">{post.content}</p>
                    <div className="flex items-center space-x-6 mt-3 text-zinc-500 text-sm">
                      <span>💬 {post._count?.replies ?? 0}</span>
                      <span>🔄 {post._count?.reposts ?? 0}</span>
                      <span>❤️ {post._count?.likes ?? 0}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
