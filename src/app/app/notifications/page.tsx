"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Notification {
  id: string;
  type: "like" | "repost" | "follow" | "reply";
  read: boolean;
  createdAt: string;
  fromUser?: {
    username: string;
    avatar?: string;
  };
  post?: {
    id: string;
    content: string;
  };
}

export default function NotificationsPage() {
  const { connected } = useWallet();
  const { data: session } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetch("/api/notifications")
        .then((res) => res.json())
        .then((data) => {
          setNotifications(data.notifications || []);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch notifications:", err);
          setLoading(false);
        });
    }
  }, [session]);

  if (!connected && !session) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Connect Wallet</h1>
          <p className="text-zinc-400 mb-4">Please connect your wallet to view notifications</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-emerald-600 hover:bg-amber-800 text-white font-bold rounded-xl"
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
            <h1 className="text-2xl font-bold">Notifications</h1>
          </div>
        </div>
        <div className="max-w-2xl mx-auto p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-800"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 sticky top-0">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-zinc-400 text-sm mt-1">Stay updated</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">🔔</div>
            <h2 className="text-xl font-bold mb-2">No Notifications</h2>
            <p className="text-zinc-400">When someone likes, reposts, or follows you, they'll appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {notifications.map((notification) => (
              <Link
                key={notification.id}
                href={`/app/posts/${notification.post?.id}`}
                className={`block p-4 hover:bg-zinc-900 transition-colors ${
                  !notification.read ? "bg-zinc-900/50" : ""
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {notification.type === "like" && "❤️"}
                    {notification.type === "repost" && "🔄"}
                    {notification.type === "follow" && "👤"}
                    {notification.type === "reply" && "💬"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-bold text-white">
                        {notification.fromUser?.username || "Someone"}
                      </span>
                      <span className="text-zinc-500 text-sm">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-white">
                      {notification.type === "like" && "liked your post"}
                      {notification.type === "repost" && "reposted your post"}
                      {notification.type === "follow" && "started following you"}
                      {notification.type === "reply" && "replied to your post"}
                    </p>
                    {notification.post && (
                      <p className="text-zinc-400 text-sm mt-2 line-clamp-2">
                        {notification.post.content}
                      </p>
                    )}
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
