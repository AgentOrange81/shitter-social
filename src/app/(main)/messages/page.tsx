"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletButton } from "@/components/ui/WalletButton"
import Link from "next/link"

interface Conversation {
  id: string
  otherUser: {
    id: string
    username: string
    displayName: string | null
    avatar: string | null
    walletAddress?: string
  }
  lastMessage: {
    content: string
    createdAt: string
    isMine: boolean
  } | null
  unreadCount: number
}

interface Message {
  id: string
  content: string
  createdAt: string
  sender: {
    id: string
    username: string
    displayName: string | null
    avatar: string | null
  }
}

export default function MessagesPage() {
  const { publicKey, connected } = useWallet()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (connected && publicKey) {
      fetchConversations()
    }
  }, [connected, publicKey])

  useEffect(() => {
    if (selectedId) {
      fetchMessages(selectedId)
    }
  }, [selectedId])

  const fetchConversations = async () => {
    if (!publicKey) return
    try {
      const res = await fetch(`/api/messages?walletAddress=${publicKey.toBase58()}`)
      if (res.ok) {
        const data = await res.json()
        setConversations(data.conversations || [])
      }
    } catch (err) {
      console.error("Failed to fetch conversations:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (conversationId: string) => {
    if (!publicKey) return
    try {
      const res = await fetch(
        `/api/messages?walletAddress=${publicKey.toBase58()}&conversationId=${conversationId}`
      )
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedId || !publicKey) return
    
    const conversation = conversations.find((c) => c.id === selectedId)
    if (!conversation) return

    setSending(true)
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderWallet: publicKey.toBase58(),
          recipientWallet: conversation.otherUser.walletAddress || publicKey.toBase58(), // Fallback for now
          content: newMessage.trim(),
          conversationId: selectedId,
        }),
      })

      if (res.ok) {
        setNewMessage("")
        fetchMessages(selectedId)
        fetchConversations()
      }
    } catch (err) {
      console.error("Failed to send message:", err)
    } finally {
      setSending(false)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours < 1) return "now"
    if (hours < 24) return `${hours}h`
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  if (!connected) {
    return (
      <div className="min-h-screen bg-shit-darker text-cream p-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-4">Messages</h1>
          <div className="bg-shit rounded-lg p-6 text-center">
            <p className="text-shit-light mb-4">Connect your wallet to view messages</p>
            <WalletButton />
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-shit-darker text-cream p-4">
        <div className="max-w-md mx-auto">
          <p className="text-shit-light">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-shit-darker text-cream flex">
      {/* Conversations List */}
      <div className={`w-full md:w-80 border-r border-shit-dark flex-shrink-0 ${selectedId ? 'hidden md:block' : ''}`}>
        <div className="p-4 border-b border-shit-dark">
          <h1 className="text-xl font-bold">Messages</h1>
        </div>
        <div className="overflow-y-auto">
          {conversations.length === 0 ? (
            <p className="p-4 text-shit-light">No conversations yet</p>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedId(conv.id)}
                className={`w-full p-3 flex items-center gap-3 hover:bg-shit transition-colors text-left ${
                  selectedId === conv.id ? "bg-shit" : ""
                }`}
              >
                <div className="h-12 w-12 rounded-full bg-gold text-shit-darker flex items-center justify-center font-bold flex-shrink-0">
                  {conv.otherUser.displayName?.charAt(0) || conv.otherUser.username.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="font-bold truncate">
                      {conv.otherUser.displayName || conv.otherUser.username}
                    </span>
                    {conv.lastMessage && (
                      <span className="text-shit-light text-xs">
                        {formatTime(conv.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-shit-light text-sm truncate">
                      {conv.lastMessage
                        ? `${conv.lastMessage.isMine ? "You: " : ""}${conv.lastMessage.content.slice(0, 30)}`
                        : `@${conv.otherUser.username}`}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span className="bg-gold text-shit-darker text-xs font-bold px-2 py-0.5 rounded-full">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat View */}
      <div className={`flex-1 flex flex-col ${!selectedId ? 'hidden md:flex' : ''}`}>
        {selectedId ? (
          <>
            <div className="p-4 border-b border-shit-dark flex items-center gap-3">
              <button
                onClick={() => setSelectedId(null)}
                className="md:hidden text-shit-light hover:text-cream"
              >
                ←
              </button>
              <Link
                href={`/${conversations.find((c) => c.id === selectedId)?.otherUser.username}`}
                className="font-bold hover:underline"
              >
                @{conversations.find((c) => c.id === selectedId)?.otherUser.username}
              </Link>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender.id === publicKey?.toBase58() ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      msg.sender.id === publicKey?.toBase58()
                        ? "bg-gold text-shit-darker"
                        : "bg-shit text-cream"
                    }`}
                  >
                    <p>{msg.content}</p>
                    <p className={`text-xs mt-1 ${msg.sender.id === publicKey?.toBase58() ? "text-shit/70" : "text-shit-light"}`}>
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-shit-dark">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 bg-shit border border-shit-dark rounded px-3 py-2 text-cream placeholder-shit-light focus:outline-none focus:border-gold"
                />
                <button
                  onClick={sendMessage}
                  disabled={sending || !newMessage.trim()}
                  className="bg-gold text-shit-darker font-bold px-4 py-2 rounded hover:bg-gold/90 transition-colors disabled:opacity-50"
                >
                  {sending ? "..." : "Send"}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-shit-light">
            Select a conversation
          </div>
        )}
      </div>
    </div>
  )
}