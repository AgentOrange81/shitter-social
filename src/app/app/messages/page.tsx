"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

interface Conversation {
  id: string;
  updatedAt: string;
  participant: {
    id: string;
    username: string;
    avatar?: string;
  };
  lastMessage?: {
    id: string;
    content: string;
    createdAt: string;
    read: boolean;
  };
}

export default function MessagesPage() {
  const { connected } = useWallet();
  const { data: session } = useSession();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) return;

    let isMounted = true;
    const controller = new AbortController();

    fetch("/api/messages", { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch messages");
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setConversations(data.conversations || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        if (isMounted) {
          console.error("Failed to fetch messages:", err);
          setError(true);
          toast.error("Failed to load messages", {
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
          <p className="text-shit-medium mb-4">Please connect your wallet to view messages</p>
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
          <p className="text-shit-medium mb-6">Something went wrong fetching messages</p>
          <button
            onClick={() => {
              setError(false);
              setLoading(true);
              fetch("/api/messages")
                .then((res) => res.json())
                .then((data) => {
                  setConversations(data.conversations || []);
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
        {conversations.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">💬</div>
            <h2 className="text-xl font-bold mb-2">No Messages</h2>
            <p className="text-shit-medium mb-6">Start a conversation with someone</p>
            <button
              onClick={() => router.push("/app/explore")}
              className="px-6 py-3 bg-glass hover:bg-gold text-shit-darker font-bold rounded-xl transition-all shadow-glow"
            >
              Browse Users
            </button>
          </div>
        ) : (
          <div className="divide-y divide-shit-brown/30">
            {conversations.map((conversation) => (
              <Link
                key={conversation.id}
                href={`/app/messages/${conversation.id}`}
                className="block p-4 hover:bg-shit-brown/10 transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-glass rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0 text-shit-darker">
                    {conversation.participant.username?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-cream">
                        {conversation.participant.username || "User"}
                      </span>
                      <span className="text-shit-medium text-xs">
                        {new Date(conversation.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    {conversation.lastMessage && (
                      <p className={`text-sm ${
                        conversation.lastMessage.read ? "text-shit-medium" : "text-cream font-medium"
                      }`}>
                        {conversation.lastMessage.content}
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
