"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Bookmark {
  id: string;
  createdAt: string;
  post: {
    id: string;
    content: string;
    authorUsername?: string;
    likes?: number;
    replies?: number;
    reposts?: number;
  };
}

export default function BookmarksPage() {
  const { connected } = useWallet();
  const { data: session } = useSession();
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetch("/api/bookmarks", {
        headers: {
          "x-wallet-address": "",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setBookmarks(data.bookmarks || []);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch bookmarks:", err);
          setLoading(false);
        });
    }
  }, [session]);

  if (!connected && !session) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Connect Wallet</h1>
          <p className="text-zinc-400 mb-4">Please connect your wallet to view bookmarks</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white">
        <div className="bg-zinc-900 border-b border-zinc-800">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold">Bookmarks</h1>
          </div>
        </div>
        <div className="max-w-2xl mx-auto p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 sticky top-0">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Bookmarks</h1>
          <p className="text-zinc-400 text-sm mt-1">Saved posts</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto">
        {bookmarks.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">🔖</div>
            <h2 className="text-xl font-bold mb-2">No Bookmarks</h2>
            <p className="text-zinc-400 mb-6">Bookmark posts to save them for later</p>
            <button
              onClick={() => router.push("/app/explore")}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl"
            >
              Explore Posts
            </button>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {bookmarks.map((bookmark) => (
              <Link
                key={bookmark.id}
                href={`/app/posts/${bookmark.post.id}`}
                className="block p-4 hover:bg-zinc-900 transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {bookmark.post.authorUsername?.charAt(0).toUpperCase() || "A"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-bold text-white">
                        {bookmark.post.authorUsername || "Anonymous"}
                      </span>
                      <span className="text-zinc-500 text-sm">
                        {new Date(bookmark.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-white whitespace-pre-wrap">{bookmark.post.content}</p>
                    <div className="flex items-center space-x-6 mt-3 text-zinc-500 text-sm">
                      <span>💬 {bookmark.post.replies || 0}</span>
                      <span>🔄 {bookmark.post.reposts || 0}</span>
                      <span>❤️ {bookmark.post.likes || 0}</span>
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
