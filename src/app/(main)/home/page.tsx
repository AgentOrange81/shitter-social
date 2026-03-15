"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { PostCard } from "@/components/post/PostCard"
import { ComposePost } from "@/components/post/ComposePost"
import { useToast } from "@/components/ui/toast"

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
  liked?: boolean
  reposted?: boolean
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
  const { showToast } = useToast()

  // Reply state
  const [replyTo, setReplyTo] = useState<{ id: string; username: string; displayName: string | null } | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [replying, setReplying] = useState(false)
  const [replyError, setReplyError] = useState("")

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
      showToast("Connect your wallet to view your following feed", "info")
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
  const handleNewPost = async (content: string) => {
    if (!walletAddress || !content.trim()) {
      return
    }

    // Optimistic update: create temp post object
    const tempId = `temp_${Date.now()}`
    const optimisticPost: Post = {
      id: tempId,
      content: content.trim(),
      mediaUrl: null,
      mediaType: null,
      createdAt: new Date().toISOString(),
      author: {
        id: walletAddress,
        username: `user_${walletAddress.slice(0, 8)}`,
        displayName: `User ${walletAddress.slice(0, 6)}...`,
        avatar: null,
      },
      _count: {
        likes: 0,
        reposts: 0,
        replies: 0,
      },
    }

    // Add optimistically to top of feed
    setPosts((prev) => [optimisticPost, ...prev])

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          authorId: walletAddress,
        }),
      })

      if (res.ok) {
        const newPost = await res.json()
        // Replace temp post with real one from server
        setPosts((prev) =>
          prev.map((p) => (p.id === tempId ? { ...newPost, temp: true } : p))
        )
      } else {
        // Remove optimistic post on failure
        setPosts((prev) => prev.filter((p) => p.id !== tempId))
        const data = await res.json()
        setError(data.error || "Failed to create post")
      }
    } catch (err) {
      console.error("Failed to create post:", err)
      setPosts((prev) => prev.filter((p) => p.id !== tempId))
      setError("Failed to create post")
    }
  }

  // Handle reply click - open compose box for reply
  const handleReplyClick = (postId: string, username: string, displayName: string | null) => {
    if (!connected) {
      return
    }
    setReplyTo({ id: postId, username, displayName })
    setReplyContent(`@${username} `)
    setReplyError("")
  }

  // Handle reply submission
  const handleReply = async () => {
    if (!replyTo || !replyContent.trim() || !walletAddress) {
      return
    }

    setReplying(true)
    setReplyError("")

    try {
      const res = await fetch(`/api/posts/${replyTo.id}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: replyContent.trim(),
          authorId: walletAddress,
        }),
      })

      if (res.ok) {
        // Clear reply state and refresh posts
        setReplyTo(null)
        setReplyContent("")
        fetchPosts(activeTab, true)
      } else {
        const data = await res.json()
        setReplyError(data.error || "Failed to post reply")
      }
    } catch (err) {
      console.error("Failed to post reply:", err)
      setReplyError("Failed to post reply")
    } finally {
      setReplying(false)
    }
  }

  // Cancel reply
  const handleCancelReply = () => {
    setReplyTo(null)
    setReplyContent("")
    setReplyError("")
  }

  // Thread/reply viewing
  const [showReplies, setShowReplies] = useState<string | null>(null)
  const [replyPosts, setReplyPosts] = useState<Post[]>([])
  const [loadingReplies, setLoadingReplies] = useState(false)

  // Load replies for a post (thread view)
  const loadReplies = async (postId: string) => {
    if (showReplies === postId) {
      setShowReplies(null)
      return
    }
    setLoadingReplies(true)
    setShowReplies(postId)
    try {
      const res = await fetch(`/api/posts/${postId}/replies`)
      const data = await res.json()
      if (data.replies) {
        setReplyPosts(data.replies)
      }
    } catch (err) {
      console.error("Failed to load replies:", err)
    } finally {
      setLoadingReplies(false)
    }
  }

  // Handle reply click from post card
  const handleReplyCardClick = (postId: string, username: string, displayName: string | null) => {
    handleReplyClick(postId, username, displayName)
  }

  // Handle like/unlike
  const handleLike = async (postId: string) => {
    if (!walletAddress) {
      showToast("Connect your wallet to like posts", "info")
      return
    }

    // Optimistic update
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const isCurrentlyLiked = p.liked
          return {
            ...p,
            liked: !isCurrentlyLiked,
            _count: {
              ...p._count,
              likes: isCurrentlyLiked ? p._count.likes - 1 : p._count.likes + 1,
            },
          }
        }
        return p
      })
    )

    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: walletAddress }),
      })

      if (res.ok) {
        const data = await res.json()
        // Update with actual server count
        setPosts((prev) =>
          prev.map((p) => {
            if (p.id === postId) {
              return {
                ...p,
                liked: data.liked,
                _count: {
                  ...p._count,
                  likes: data.likeCount,
                },
              }
            }
            return p
          })
        )
      }
    } catch (err) {
      console.error("Failed to toggle like:", err)
      // Revert on error
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            const isCurrentlyLiked = p.liked
            return {
              ...p,
              liked: !isCurrentlyLiked,
              _count: {
                ...p._count,
                likes: isCurrentlyLiked ? p._count.likes - 1 : p._count.likes + 1,
              },
            }
          }
          return p
        })
      )
      showToast("Failed to like post", "error")
    }
  }

  // Handle repost/quote
  const handleRepost = async (postId: string) => {
    if (!walletAddress) {
      showToast("Connect your wallet to repost", "info")
      return
    }

    // Optimistic update
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const isCurrentlyReposted = p.reposted
          return {
            ...p,
            reposted: !isCurrentlyReposted,
            _count: {
              ...p._count,
              reposts: isCurrentlyReposted ? p._count.reposts - 1 : p._count.reposts + 1,
            },
          }
        }
        return p
      })
    )

    try {
      const res = await fetch(`/api/posts/${postId}/repost`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: walletAddress }),
      })

      if (res.ok) {
        const data = await res.json()
        setPosts((prev) =>
          prev.map((p) => {
            if (p.id === postId) {
              return {
                ...p,
                reposted: data.reposted,
                _count: {
                  ...p._count,
                  reposts: data.repostCount,
                },
              }
            }
            return p
          })
        )
      }
    } catch (err) {
      console.error("Failed to toggle repost:", err)
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            const isCurrentlyReposted = p.reposted
            return {
              ...p,
              reposted: !isCurrentlyReposted,
              _count: {
                ...p._count,
                reposts: isCurrentlyReposted ? p._count.reposts - 1 : p._count.reposts + 1,
              },
            }
          }
          return p
        })
      )
      showToast("Failed to repost", "error")
    }
  }

  // Handle quote post (repost with comment)
  const handleQuote = async (postId: string, comment: string) => {
    if (!walletAddress) {
      showToast("Connect your wallet to quote post", "info")
      return
    }

    // Optimistic update
    setPosts((prev) => [
      {
        id: `quote_${Date.now()}`,
        content: comment,
        mediaUrl: null,
        mediaType: null,
        createdAt: new Date().toISOString(),
        author: {
          id: walletAddress,
          username: `user_${walletAddress.slice(0, 8)}`,
          displayName: `User ${walletAddress.slice(0, 6)}...`,
          avatar: null,
        },
        _count: {
          likes: 0,
          reposts: 0,
          replies: 0,
        },
        liked: false,
        reposted: true,
        // Store the quoted post reference
        originalPostId: postId,
      } as Post,
      ...prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            reposted: true,
            _count: {
              ...p._count,
              reposts: p._count.reposts + 1,
            },
          }
        }
        return p
      }),
    ])

    try {
      const res = await fetch(`/api/posts/${postId}/repost`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: walletAddress, comment }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.isQuote) {
          showToast("Quote posted!", "success")
        }
        fetchPosts(activeTab, true)
      }
    } catch (err) {
      console.error("Failed to quote post:", err)
      setPosts((prev) => prev.filter((p) => p.id !== `quote_${Date.now()}`))
      showToast("Failed to quote post", "error")
    }
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
              title={!connected ? "Connect your wallet to see posts from people you follow" : undefined}
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

        {/* Reply Compose Box */}
        {replyTo && (
          <div className="p-4 border-b border-shit-dark bg-shit/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-shit-light text-sm">
                Replying to <span className="text-gold">@{replyTo.username}</span>
              </span>
              <button
                onClick={handleCancelReply}
                className="text-shit-light hover:text-cream text-sm"
              >
                ✕
              </button>
            </div>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Drop a reply..."
              className="w-full bg-transparent text-cream text-base placeholder:text-shit-light focus:outline-none resize-none min-h-[80px]"
              maxLength={280}
            />
            {replyError && (
              <p className="text-red-400 text-sm mb-2">{replyError}</p>
            )}
            <div className="flex justify-end pt-2 border-t border-shit">
              <button
                onClick={handleReply}
                disabled={!replyContent.trim() || replying}
                className="bg-gold text-shit-darker hover:bg-gold-light px-4 py-2 rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {replying ? "Posting..." : "Reply"}
              </button>
            </div>
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
                <div key={post.id}>
                  <PostCard
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
                      liked: post.liked,
                      reposted: post.reposted,
                    }}
                    onLike={() => handleLike(post.id)}
                    onRepost={() => handleRepost(post.id)}
                    onQuote={(comment: string) => handleQuote(post.id, comment)}
                    onReply={() => handleReplyClick(post.id, post.author.username, post.author.displayName)}
                    onViewReplies={() => loadReplies(post.id)}
                  />
                  {/* Show replies if expanded - visual threading with indentation */}
                  {showReplies === post.id && (
                    <div className="ml-16 space-y-2 border-l-2 border-shit-dark pl-4">
                      {loadingReplies ? (
                        <p className="text-shit-light text-sm">Loading replies...</p>
                      ) : replyPosts.length > 0 ? (
                        replyPosts.map((reply) => (
                          <PostCard
                            key={reply.id}
                            post={{
                              id: reply.id,
                              user: {
                                name: reply.author.displayName || reply.author.username,
                                handle: reply.author.username,
                                avatar: reply.author.avatar || "",
                              },
                              content: reply.content,
                              image: reply.mediaUrl || undefined,
                              timestamp: formatTimestamp(reply.createdAt),
                              stats: {
                                likes: reply._count.likes,
                                reposts: reply._count.reposts,
                                replies: reply._count.replies,
                              },
                              liked: reply.liked,
                              reposted: reply.reposted,
                            }}
                            onLike={() => handleLike(reply.id)}
                            onRepost={() => handleRepost(reply.id)}
                            onQuote={(comment: string) => handleQuote(reply.id, comment)}
                            onReply={() => handleReplyCardClick(reply.id, reply.author.username, reply.author.displayName)}
                          />
                        ))
                      ) : (
                        <p className="text-shit-light text-sm">No replies yet</p>
                      )}
                    </div>
                  )}
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