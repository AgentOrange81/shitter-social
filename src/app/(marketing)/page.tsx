"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PostCompose } from "@/components/PostCompose";
import CreatePostButton from "@/components/CreatePostButton";

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
      <div className="min-h-screen bg-shit-darker">
        <div className="bg-shit-brown/10 border-b border-shit-brown/30">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold">
              <span className="text-glass">SHIT</span>TER
            </h1>
          </div>
        </div>
        <div className="flex items-center justify-center py-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-glass"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-shit-darker">
      {/* Header */}
      <div className="bg-shit-brown/10 border-b border-shit-brown/30 sticky top-0 shadow-glow">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-cream">
            <span className="text-glass">SHIT</span>TER
          </h1>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-shit-brown/5 border-b border-shit-brown/30">
        <div className="max-w-2xl mx-auto px-4 py-2">
          <nav className="flex space-x-6 text-sm">
            <Link href="/app/explore" className="text-glass font-medium">Explore</Link>
            {connected ? (
              <>
                <Link href="/app/notifications" className="text-shit-medium hover:text-cream transition-colors">Notifications</Link>
                <Link href="/app/messages" className="text-shit-medium hover:text-cream transition-colors">Messages</Link>
                <Link href="/app/bookmarks" className="text-shit-medium hover:text-cream transition-colors">Bookmarks</Link>
                <Link href="/app/profile" className="text-shit-medium hover:text-cream transition-colors">Profile</Link>
              </>
            ) : (
              <Link href="/login" className="text-shit-medium hover:text-cream transition-colors">Log In</Link>
            )}
          </nav>
        </div>
      </div>

      {/* Inline Compose (only for connected users) */}
      {connected && (
        <div className="max-w-2xl mx-auto px-4 py-4">
          <PostCompose placeholder="What's on your mind?" />
        </div>
      )}

      {/* Floating Create Post Button */}
      <CreatePostButton />

      {/* Content */}
      <div className="max-w-2xl mx-auto">
        {posts.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">🐸</div>
            <h2 className="text-xl font-bold mb-2">No Posts Yet</h2>
            <p className="text-zinc-400 mb-6">Be the first to post something!</p>
            <Link
              href="/app/explore"
              className="inline-block px-6 py-3 bg-glass hover:bg-gold text-shit-darker font-bold rounded-xl shadow-glow transition-all"
            >
              Explore Posts
            </Link>
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
