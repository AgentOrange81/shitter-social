"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

  useEffect(() => {
    if (session?.user?.id) {
      fetch("/api/messages")
        .then((res) => res.json())
        .then((data) => {
          setConversations(data.conversations || []);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch messages:", err);
          setLoading(false);
        });
    }
  }, [session]);

  if (!connected && !session) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Connect Wallet</h1>
          <p className="text-zinc-400 mb-4">Please connect your wallet to view messages</p>
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
            <h1 className="text-2xl font-bold">Messages</h1>
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
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="text-zinc-400 text-sm mt-1">Your conversations</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto">
        {conversations.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">💬</div>
            <h2 className="text-xl font-bold mb-2">No Messages</h2>
            <p className="text-zinc-400 mb-6">Start a conversation with someone</p>
            <button
              onClick={() => router.push("/app/explore")}
              className="px-6 py-3 bg-emerald-600 hover:bg-amber-800 text-white font-bold rounded-xl"
            >
              Browse Users
            </button>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {conversations.map((conversation) => (
              <Link
                key={conversation.id}
                href={`/app/messages/${conversation.id}`}
                className="block p-4 hover:bg-zinc-900 transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-amber-800 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0">
                    {conversation.otherUser?.username?.charAt(0).toUpperCase() || conversation.otherUser?.displayName?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white">
                        {conversation.otherUser?.username || conversation.otherUser?.displayName || "User"}
                      </span>
                      <span className="text-zinc-500 text-xs">
                        {new Date(conversation.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    {conversation.lastMessage && (
                      <p className={`text-sm ${
                        conversation.lastMessage.read ? "text-zinc-400" : "text-white font-medium"
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
