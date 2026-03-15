"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { PostCard } from "@/components/post/PostCard"
import { ComposePost } from "@/components/post/ComposePost"

interface Post {
  id: string
  content: string
  mediaUrl: string | null
  mediaType: string | null
  createdAt: string
  author: {
    id: string
    username: string
    displayName: string | null
    avatar: string | null
  }
  _count: {
    likes: number
    reposts: number
    replies: number
  }
}

type FeedType = "for_you" | "following"

export default function HomePage() {
  const { publicKey, connected } = useWallet()
  const [activeTab, setActiveTab] = useState<FeedType>("for_you")
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [cursor, setCursor] = useState<string | null>(null)
  const [error, setError] = useState("")
  const observerRef = useRef<HTMLDivElement>(null)

  const walletAddress = publicKey?.toBase58()

  // Fetch initial posts
  const fetchPosts = useCallback(async (feedType: FeedType, reset = false) => {
    try {
      if (reset) {
        setLoading(true)
        setCursor(null)
      } else {
        setLoadingMore(true)
      }

      const params = new URLSearchParams()
      params.set("type", feedType)
      params.set("limit", "20")
      if (cursor && !reset) {
        params.set("cursor", cursor)
      }
      if (feedType === "following" && walletAddress) {
        params.set("walletAddress", walletAddress)
      }

      const res = await fetch(`/api/posts/feed?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        if (reset) {
          setPosts(data.posts || [])
        } else {
          setPosts((prev) => [...prev, ...(data.posts || [])])
        }
        setCursor(data.nextCursor)
        setHasMore(data.hasMore)
      } else {
        setError("Failed to load posts")
      }
    } catch (err) {
      console.error("Failed to fetch posts:", err)
      setError("Failed to load posts")
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [cursor, walletAddress])

  // Initial load and tab switch
  useEffect(() => {
    fetchPosts(activeTab, true)
  }, [activeTab, walletAddress])

  // Switch to following tab requires wallet
  const handleTabChange = (tab: FeedType) => {
    if (tab === "following" && !connected) {
      return // Don't switch if not connected
    }
    setActiveTab(tab)
  }

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          fetchPosts(activeTab, false)
        }
      },
      { threshold: 0.1 }
    )

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => observer.disconnect()
  }, [hasMore, loadingMore, loading, activeTab, fetchPosts])

  // Handle new post creation
  const handleNewPost = (content: string) => {
    // For now, just refetch - in a real app you'd optimistically add
    fetchPosts(activeTab, true)
  }

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

  return (
    <div className="min-h-screen bg-shit-darker text-cream">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-shit-darker/80 backdrop-blur-md border-b border-shit-dark">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl font-bold p-4">Home</h1>
          
          {/* Tabs */}
          <div className="flex border-b border-shit-dark">
            <button
              onClick={() => handleTabChange("for_you")}
              className={`flex-1 py-3 text-center font-medium transition-colors relative ${
                activeTab === "for_you"
                  ? "text-cream"
                  : "text-shit-light hover:text-cream"
              }`}
            >
              For You
              {activeTab === "for_you" && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-gold rounded-full" />
              )}
            </button>
            <button
              onClick={() => handleTabChange("following")}
              disabled={!connected}
              className={`flex-1 py-3 text-center font-medium transition-colors relative ${
                activeTab === "following"
                  ? "text-cream"
                  : !connected
                  ? "text-shit-light cursor-not-allowed opacity-50"
                  : "text-shit-light hover:text-cream"
              }`}
            >
              Following
              {activeTab === "following" && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-gold rounded-full" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Compose Post - only show when connected */}
        {connected && (
          <div className="p-4 border-b border-shit-dark">
            <ComposePost onPost={handleNewPost} />
          </div>
        )}

        {/* Not connected notice for Following tab */}
        {activeTab === "following" && !connected && (
          <div className="p-4 border-b border-shit-dark text-center">
            <p className="text-shit-light">Connect wallet to see posts from people you follow</p>
          </div>
        )}

        {/* Posts Feed */}
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold"></div>
            <p className="text-shit-light mt-2">Loading posts...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-400">{error}</p>
            <button
              onClick={() => fetchPosts(activeTab, true)}
              className="mt-2 text-gold hover:underline"
            >
              Try again
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-shit-light">
              {activeTab === "for_you"
                ? "No posts yet. Be the first to drop a shitpost!"
                : "No posts from people you follow yet"}
            </p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-shit-dark">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={{
                    id: post.id,
                    user: {
                      name: post.author.displayName || post.author.username,
                      handle: post.author.username,
                      avatar: post.author.avatar || "",
                    },
                    content: post.content,
                    image: post.mediaUrl || undefined,
                    timestamp: formatTimestamp(post.createdAt),
                    stats: {
                      likes: post._count.likes,
                      reposts: post._count.reposts,
                      replies: post._count.replies,
                    },
                  }}
                />
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

            {!hasMore && posts.length > 0 && (
              <div className="p-4 text-center text-shit-light text-sm">
                You&apos;ve reached the end
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}