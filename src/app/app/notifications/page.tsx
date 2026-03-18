"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

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
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) return;

    let isMounted = true;
    const controller = new AbortController();

    fetch("/api/notifications", { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch notifications");
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setNotifications(data.notifications || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        if (isMounted) {
          console.error("Failed to fetch notifications:", err);
          setError(true);
          toast.error("Failed to load notifications", {
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
          <p className="text-shit-medium mb-4">Please connect your wallet to view notifications</p>
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
          <p className="text-shit-medium mb-6">Something went wrong fetching notifications</p>
          <button
            onClick={() => {
              setError(false);
              setLoading(true);
              fetch("/api/notifications")
                .then((res) => res.json())
                .then((data) => {
                  setNotifications(data.notifications || []);
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
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">🔔</div>
            <h2 className="text-xl font-bold mb-2">No Notifications</h2>
            <p className="text-shit-medium">When someone likes, reposts, or follows you, they'll appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-shit-brown/30">
            {notifications.map((notification) => (
              <Link
                key={notification.id}
                href={`/app/posts/${notification.post?.id}`}
                className={`block p-4 hover:bg-shit-brown/10 transition-colors ${
                  !notification.read ? "bg-shit-brown/20" : ""
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-amber-800 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {notification.type === "like" && "❤️"}
                    {notification.type === "repost" && "🔄"}
                    {notification.type === "follow" && "👤"}
                    {notification.type === "reply" && "💬"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-bold text-cream">
                        {notification.fromUser?.username || "Someone"}
                      </span>
                      <span className="text-shit-medium text-sm">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-cream">
                      {notification.type === "like" && "liked your post"}
                      {notification.type === "repost" && "reposted your post"}
                      {notification.type === "follow" && "started following you"}
                      {notification.type === "reply" && "replied to your post"}
                    </p>
                    {notification.post?.content && (
                      <p className="text-shit-medium text-sm mt-2 line-clamp-2">
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
