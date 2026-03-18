"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

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
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) return;

    let isMounted = true;
    const controller = new AbortController();

    fetch("/api/bookmarks", { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch bookmarks");
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setBookmarks(data.bookmarks || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        if (isMounted) {
          console.error("Failed to fetch bookmarks:", err);
          setError(true);
          toast.error("Failed to load bookmarks", {
            description: "Please try again in a moment"
          });
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [session]);

  if (!connected && !session) {
    return (
      <div className="min-h-screen bg-shit-darker flex items-center justify-center">
        <div className="text-center animate-fade-in-up">
          <h1 className="text-2xl font-bold mb-4 text-cream">Connect Wallet</h1>
          <p className="text-shit-medium mb-4">Please connect your wallet to view bookmarks</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-glass hover:bg-gold text-shit-darker font-bold rounded-xl transition-all shadow-glow"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-shit-darker flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-glass"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-shit-darker flex items-center justify-center">
        <div className="text-center animate-fade-in-up">
          <div className="text-5xl mb-4">💥</div>
          <h2 className="text-xl font-bold mb-2 text-cream">Failed to Load</h2>
          <p className="text-shit-medium mb-6">Something went wrong fetching bookmarks</p>
          <button
            onClick={() => {
              setError(false);
              setLoading(true);
              fetch("/api/bookmarks")
                .then((res) => res.json())
                .then((data) => {
                  setBookmarks(data.bookmarks || []);
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
        {bookmarks.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">🔖</div>
            <h2 className="text-xl font-bold mb-2">No Bookmarks</h2>
            <p className="text-shit-medium mb-6">Bookmark posts to save them for later</p>
            <button
              onClick={() => router.push("/app/explore")}
              className="px-6 py-3 bg-glass hover:bg-gold text-shit-darker font-bold rounded-xl transition-all shadow-glow"
            >
              Explore Posts
            </button>
          </div>
        ) : (
          <div className="divide-y divide-shit-brown/30">
            {bookmarks.map((bookmark) => (
              <Link
                key={bookmark.id}
                href={`/app/posts/${bookmark.post.id}`}
                className="block p-4 hover:bg-shit-brown/10 transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-glass rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 text-shit-darker">
                    {bookmark.post.authorUsername?.charAt(0).toUpperCase() || "A"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-bold text-cream">
                        {bookmark.post.authorUsername || "Anonymous"}
                      </span>
                      <span className="text-shit-medium text-sm">
                        {new Date(bookmark.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-cream whitespace-pre-wrap">{bookmark.post.content}</p>
                    <div className="flex items-center space-x-6 mt-3 text-shit-medium text-sm">
                      <span>💬 {bookmark.post.replies ?? 0}</span>
                      <span>🔄 {bookmark.post.reposts ?? 0}</span>
                      <span>❤️ {bookmark.post.likes ?? 0}</span>
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
