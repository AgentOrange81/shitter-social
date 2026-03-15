"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { PostCard } from "@/components/post/PostCard"
import { ComposePost } from "@/components/post/ComposePost"
import { ProfileCard } from "@/components/post/ProfileCard"

interface Post {
  id: string
  content: string
  createdAt: string
  author: {
    id: string
    username: string
    displayName: string
    avatar: string | null
  }
  _count: {
    likes: number
    reposts: number
    replies: number
  }
}

// Helper to format relative time
function formatTimestamp(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return "now"
  if (diffMins < 60) return `${diffMins}m`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays < 7) return `${diffDays}d`
  return date.toLocaleDateString()
}

// Transform API response to UI format
function transformPost(apiPost: Post, currentUserId?: string) {
  if (!apiPost || !apiPost.author) {
    return null
  }
  // Auto-created users have usernames like "user_xxx" - show wallet address instead
  const displayName = apiPost.author.displayName || 
    (apiPost.author.username?.startsWith("user_") ? apiPost.author.id.slice(0, 8) + "..." : apiPost.author.username) ||
    "Unknown"
  const handle = apiPost.author.username?.startsWith("user_") 
    ? apiPost.author.id.slice(0, 6) + "..." 
    : apiPost.author.username || "unknown"
  
  return {
    id: apiPost.id,
    user: {
      name: displayName,
      handle: handle,
      avatar: apiPost.author.avatar || "",
    },
    content: apiPost.content,
    timestamp: formatTimestamp(apiPost.createdAt),
    stats: {
      likes: apiPost._count?.likes || 0,
      replies: apiPost._count?.replies || 0,
      reposts: apiPost._count?.reposts || 0,
    },
    liked: false,
    reposted: false,
  }
}

type TransformedPost = {
  id: string
  user: { name: string; handle: string; avatar: string }
  content: string
  timestamp: string
  stats: { likes: number; replies: number; reposts: number }
  liked: boolean
  reposted: boolean
}

export default function Home() {
  const [posts, setPosts] = useState<TransformedPost[]>([])
  const [loading, setLoading] = useState(true)
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyPosts, setReplyPosts] = useState<TransformedPost[]>([])
  const [showReplies, setShowReplies] = useState<string | null>(null)
  const [loadingReplies, setLoadingReplies] = useState(false)
  const { publicKey } = useWallet()

  // Use wallet address as user ID
  const currentUserId = publicKey?.toBase58() || null

  // Fetch posts from API
  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts')
      const data = await res.json()
      if (data.posts) {
        const transformed = data.posts
          .map((p: Post) => transformPost(p, currentUserId || undefined))
          .filter((p: ReturnType<typeof transformPost>): p is TransformedPost => p !== null)
        setPosts(transformed)
      }
    } catch (err) {
      console.error('Failed to fetch posts:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handlePost = async (content: string) => {
    if (!currentUserId) {
      alert('Please connect your wallet first')
      return
    }
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, authorId: currentUserId }),
      })
      if (res.ok) {
        const newPost = await res.json()
        const transformed = transformPost(newPost, currentUserId)
        if (transformed) {
          setPosts([transformed, ...posts])
        }
      }
    } catch (err) {
      console.error('Failed to create post:', err)
    }
  }

  const handleLike = async (postId: string) => {
    if (!currentUserId) {
      alert('Please connect your wallet first')
      return
    }
    // Optimistic update
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          liked: !post.liked,
          stats: {
            ...post.stats,
            likes: post.liked ? post.stats.likes - 1 : post.stats.likes + 1
          }
        }
      }
      return post
    }))
    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId }),
      })
      if (!res.ok) {
        const err = await res.json()
        console.error('Like failed:', err)
        // Revert on error
        fetchPosts()
      }
    } catch (err) {
      console.error('Failed to toggle like:', err)
      // Revert on error
      fetchPosts()
    }
  }

  const handleRepost = async (postId: string) => {
    if (!currentUserId) {
      alert('Please connect your wallet first')
      return
    }
    // Optimistic update
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          reposted: !post.reposted,
          stats: {
            ...post.stats,
            reposts: post.reposted ? post.stats.reposts - 1 : post.stats.reposts + 1
          }
        }
      }
      return post
    }))
    try {
      const res = await fetch(`/api/posts/${postId}/repost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId }),
      })
      if (!res.ok) {
        const err = await res.json()
        console.error('Repost failed:', err)
        // Revert on error
        fetchPosts()
      }
    } catch (err) {
      console.error('Failed to toggle repost:', err)
      // Revert on error
      fetchPosts()
    }
  }

  const handleReplyClick = (postId: string) => {
    setReplyTo(postId)
  }

  const handleReply = async (content: string) => {
    if (!currentUserId || !replyTo) {
      alert('Please connect your wallet first')
      return
    }
    try {
      const res = await fetch(`/api/posts/${replyTo}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, authorId: currentUserId }),
      })
      if (res.ok) {
        const newReply = await res.json()
        const transformed = transformPost(newReply, currentUserId)
        if (transformed) {
          setReplyPosts([...replyPosts, transformed])
        }
        setReplyTo(null)
        // Refresh main posts to update reply count
        fetchPosts()
      }
    } catch (err) {
      console.error('Failed to create reply:', err)
    }
  }

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
        const transformed = data.replies.map((p: Post) => transformPost(p, currentUserId || undefined)).filter((p: ReturnType<typeof transformPost>) => p !== null) as TransformedPost[]
        setReplyPosts(transformed)
      }
    } catch (err) {
      console.error('Failed to load replies:', err)
    } finally {
      setLoadingReplies(false)
    }
  }

  return (
    <div className="flex gap-6">
      {/* Main feed */}
      <div className="flex-1 space-y-4">
        {/* Compose post */}
        <ComposePost onPost={handlePost} />

        {/* Posts */}
        {loading ? (
          <div className="text-center py-8 text-shit-light">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-8 text-shit-light">No posts yet. Be the first!</div>
        ) : (
          posts.map((post) => (
            <div key={post.id}>
              <PostCard 
                post={post} 
                onLike={() => handleLike(post.id)}
                onRepost={() => handleRepost(post.id)}
                onReply={() => handleReplyClick(post.id)}
                onViewReplies={() => loadReplies(post.id)}
              />
              {/* Show replies if expanded */}
              {showReplies === post.id && (
                <div className="ml-16 space-y-2">
                  {loadingReplies ? (
                    <p className="text-shit-light text-sm">Loading replies...</p>
                  ) : replyPosts.length > 0 ? (
                    replyPosts.map(reply => (
                      <PostCard 
                        key={reply.id} 
                        post={reply}
                        onLike={() => handleLike(reply.id)}
                        onRepost={() => handleRepost(reply.id)}
                        onReply={() => handleReplyClick(reply.id)}
                      />
                    ))
                  ) : (
                    <p className="text-shit-light text-sm">No replies yet</p>
                  )}
                </div>
              )}
            </div>
          ))
        )}

        {/* Reply compose */}
        {replyTo && (
          <div className="bg-shit rounded-lg p-4 border border-gold">
            <p className="text-shit-light text-sm mb-2">Replying to post...</p>
            <ComposePost onPost={handleReply} placeholder="Write your reply..." />
            <button 
              onClick={() => setReplyTo(null)}
              className="mt-2 text-shit-light text-sm hover:text-cream"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Right sidebar */}
      <aside className="hidden lg:block w-80 space-y-4">
        {/* Profile */}
        <ProfileCard
          profile={{
            name: "John Doe",
            handle: "johndoe",
            avatar: "/avatar.png",
            bio: "Crypto degenerate | HODLer | Moon boy 🚀",
            location: "Earth",
            website: "https://johndoe.social",
            joined: "March 2024",
            followers: 1234,
            following: 567,
          }}
        />

        {/* Trending */}
        <div className="bg-shit rounded-lg p-4">
          <h3 className="font-bold text-xl mb-4 text-cream">Trending in Crypto</h3>
          <div className="space-y-4">
            {[
              { tag: "$SHIT", posts: "12.5K" },
              { tag: "$MOON", posts: "8.2K" },
              { tag: "#DeFi", posts: "5.6K" },
              { tag: "#Bitcoin", posts: "4.3K" },
              { tag: "#NFT", posts: "3.1K" },
            ].map((trend) => (
              <div key={trend.tag} className="cursor-pointer hover:bg-shit-dark rounded p-2 transition-colors">
                <div className="text-sm text-shit-light">{trend.posts} posts</div>
                <div className="font-bold text-gold hover:underline">{trend.tag}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Who to follow */}
        <div className="bg-shit rounded-lg p-4">
          <h3 className="font-bold text-xl mb-4 text-cream">Who to follow</h3>
          <div className="space-y-3">
            {[
              { name: "Vitalik Buterin", handle: "VitalikButerin" },
              { name: "Elon Musk", handle: "elonmusk" },
              { name: "Crypto Whisperer", handle: "cryptowhisperer" },
            ].map((user) => (
              <div key={user.handle} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-gold text-shit-darker flex items-center justify-center font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-cream hover:underline">{user.name}</div>
                    <div className="text-shit-light text-sm">@{user.handle}</div>
                  </div>
                </div>
                <button className="bg-cream text-shit-darker text-sm font-bold px-3 py-1.5 rounded-full hover:bg-shit transition-colors">
                  Follow
                </button>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  )
}