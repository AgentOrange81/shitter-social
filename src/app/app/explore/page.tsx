"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

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

export default function ExplorePage() {
  const { connected } = useWallet();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    fetch("/api/posts/feed", { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch feed");
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setPosts(data.posts || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        if (isMounted) {
          console.error("Failed to fetch posts:", err);
          setError(true);
          toast.error("Failed to load posts", {
            description: "Please try again in a moment"
          });
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-shit-darker flex items-center justify-center">
        <div className="text-center animate-fade-in-up">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-glass mx-auto mb-4"></div>
          <p className="text-cream">Loading explore...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-shit-darker flex items-center justify-center">
        <div className="text-center animate-fade-in-up">
          <div className="text-5xl mb-4">💥</div>
          <h2 className="text-xl font-bold mb-2 text-cream">Failed to Load</h2>
          <p className="text-shit-medium mb-6">Something went wrong fetching posts</p>
          <button
            onClick={() => {
              setError(false);
              setLoading(true);
              fetch("/api/posts/feed")
                .then((res) => res.json())
                .then((data) => {
                  setPosts(data.posts || []);
                  setLoading(false);
                })
                .catch(() => {
                  setError(true);
                  setLoading(false);
                });
            }}
            className="px-6 py-3 bg-glass hover:bg-gold text-shit-darker font-bold rounded-xl transition-all shadow-glow"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-shit-darker">
      {/* Content */}
      <div className="max-w-2xl mx-auto pt-4">
        {posts.length === 0 ? (
          <div className="p-8 text-center animate-fade-in-up">
            <div className="text-6xl mb-4 animate-float">🐸</div>
            <h2 className="text-xl font-bold mb-2 text-cream">No Posts Yet</h2>
            <p className="text-shit-medium mb-6">Be the first to post something!</p>
            {connected ? (
              <button
                onClick={() => router.push("/")}
                className="px-6 py-3 bg-glass hover:bg-gold text-shit-darker font-bold rounded-xl transition-all shadow-glow"
              >
                Create Post
              </button>
            ) : (
              <button
                onClick={() => router.push("/")}
                className="px-6 py-3 bg-glass hover:bg-gold text-shit-darker font-bold rounded-xl transition-all shadow-glow"
              >
                Connect Wallet
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-shit-brown/30">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/app/posts/${post.id}`}
                className="block p-4 hover:bg-shit-brown/10 transition-colors"
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
                      <span className="text-shit-medium text-sm">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-white whitespace-pre-wrap">{post.content}</p>
                    <div className="flex items-center space-x-6 mt-3 text-shit-medium text-sm">
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
