"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useRouter } from "next/navigation"

interface Notification {
  id: string
  type: "like" | "repost" | "follow" | "reply"
  read: boolean
  createdAt: string
  fromUser: {
    id: string
    username: string
    displayName: string | null
    avatar: string | null
  } | null
  post: {
    id: string
    content: string
    author: {
      username: string
    }
  } | null
}

export default function NotificationsPage() {
  const { publicKey, connected } = useWallet()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [cursor, setCursor] = useState<string | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [error, setError] = useState("")
  const observerRef = useRef<HTMLDivElement>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  const walletAddress = publicKey?.toBase58()

  // Fetch notifications
  const fetchNotifications = useCallback(async (reset = false) => {
    try {
      if (reset) {
        setLoading(true)
        setCursor(null)
      } else {
        setLoadingMore(true)
      }

      const params = new URLSearchParams()
      params.set("limit", "20")
      if (cursor && !reset) {
        params.set("cursor", cursor)
      }

      const res = await fetch(`/api/notifications?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        if (reset) {
          setNotifications(data.notifications || [])
        } else {
          setNotifications((prev) => [...prev, ...(data.notifications || [])])
        }
        setCursor(data.nextCursor)
        setHasMore(data.hasMore)
        setUnreadCount(data.unreadCount || 0)

        // Mark as read if there are unread
        if (data.unreadCount > 0 && reset) {
          await markAsRead()
        }
      } else {
        setError("Failed to load notifications")
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err)
      setError("Failed to load notifications")
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [cursor])

  // Mark notifications as read
  const markAsRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      })
    } catch (err) {
      console.error("Failed to mark notifications as read:", err)
    }
  }

  // Initial load
  useEffect(() => {
    if (isHydrated && connected) {
      fetchNotifications(true)
    } else if (isHydrated && !connected) {
      setLoading(false)
    }
  }, [isHydrated, connected])

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          fetchNotifications(false)
        }
      },
      { threshold: 0.1 }
    )

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => observer.disconnect()
  }, [hasMore, loadingMore, loading, fetchNotifications])

  // Format timestamp
  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "now"
    if (minutes < 60) return `${minutes}m`
    if (hours < 24) return `${hours}h`
    if (days < 7) return `${days}d`
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  // Get notification text
  const getNotificationText = (notification: Notification) => {
    const user = notification.fromUser
    const userName = user?.displayName || user?.username || "Someone"

    switch (notification.type) {
      case "like":
        return <><span className="font-semibold text-cream">{userName}</span> liked your post</>
      case "repost":
        return <><span className="font-semibold text-cream">{userName}</span> reposted your post</>
      case "follow":
        return <><span className="font-semibold text-cream">{userName}</span> followed you</>
      case "reply":
        return <><span className="font-semibold text-cream">{userName}</span> replied to your post</>
      default:
        return <><span className="font-semibold text-cream">{userName}</span> interacted with you</>
    }
  }

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return "❤️"
      case "repost":
        return "🔁"
      case "follow":
        return "👤"
      case "reply":
        return "💬"
      default:
        return "🔔"
    }
  }

  // Navigate to relevant content
  const handleNotificationClick = (notification: Notification) => {
    if (notification.type === "follow") {
      if (notification.fromUser) {
        router.push(`/${notification.fromUser.username}`)
      }
    } else if (notification.post) {
      router.push(`/${notification.post.author.username}/${notification.post.id}`)
    }
  }

  // Not connected
  if (!isHydrated || !connected) {
    return (
      <div className="min-h-screen bg-shit-darker text-cream">
        <div className="sticky top-0 z-10 bg-shit-darker/80 backdrop-blur-md border-b border-shit-dark">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-xl font-bold p-4">Notifications</h1>
          </div>
        </div>
        <div className="max-w-2xl mx-auto p-8 text-center">
          <p className="text-shit-light">Connect your wallet to view notifications</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-shit-darker text-cream">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-shit-darker/80 backdrop-blur-md border-b border-shit-dark">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between p-4">
            <h1 className="text-xl font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-gold text-shit-darker text-xs font-bold px-2 py-1 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Loading */}
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold"></div>
            <p className="text-shit-light mt-2">Loading notifications...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-400">{error}</p>
            <button
              onClick={() => fetchNotifications(true)}
              className="mt-2 text-gold hover:underline"
            >
              Try again
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-4xl mb-4">🔔</div>
            <p className="text-shit-light">No notifications yet</p>
            <p className="text-shit-light text-sm mt-2">
              When someone interacts with you, you&apos;ll see it here
            </p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-shit-dark">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 cursor-pointer transition-colors hover:bg-shit-dark/50 ${
                    !notification.read ? "bg-shit-dark/30" : ""
                  }`}
                >
                  <div className="flex gap-3">
                    {/* Icon */}
                    <div className="text-xl flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm">
                          {getNotificationText(notification)}
                        </p>
                        <span className="text-xs text-shit-light flex-shrink-0">
                          {formatTimestamp(notification.createdAt)}
                        </span>
                      </div>

                      {/* Post preview for like/repost/reply */}
                      {notification.post && (
                        <div className="mt-2 p-2 bg-shit-darker rounded text-sm text-shit-light line-clamp-2">
                          {notification.post.content}
                        </div>
                      )}

                      {/* Unread indicator */}
                      {!notification.read && (
                        <div className="mt-2 w-2 h-2 bg-gold rounded-full" />
                      )}
                    </div>

                    {/* User avatar */}
                    {notification.fromUser && (
                      <div className="flex-shrink-0">
                        {notification.fromUser.avatar ? (
                          <img
                            src={notification.fromUser.avatar}
                            alt={notification.fromUser.username}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-shit flex items-center justify-center text-shit-light">
                            {notification.fromUser.username.slice(0, 1).toUpperCase()}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Infinite scroll trigger */}
            {hasMore && (
              <div ref={observerRef} className="p-4 text-center">
                {loadingMore ? (
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gold"></div>
                ) : (
                  <p className="text-shit-light text-sm">Load more</p>
                )}
              </div>
            )}

            {!hasMore && notifications.length > 0 && (
              <div className="p-4 text-center text-shit-light text-sm">
                You&apos;ve seen all notifications
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}