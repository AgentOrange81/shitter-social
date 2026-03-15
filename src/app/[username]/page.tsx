"use client"

import { useState, useEffect, use } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { ProfileCard } from "@/components/post/ProfileCard"
import { PostCard } from "@/components/post/PostCard"
import { ComposePost } from "@/components/post/ComposePost"
import { useToast } from "@/components/ui/toast"

interface UserProfile {
  id: string
  walletAddress: string
  username: string
  displayName: string | null
  avatar: string | null
  banner: string | null
  bio: string | null
  createdAt: string
  followersCount: number
  followingCount: number
  postsCount: number
}

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

export default function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params)
  const { publicKey, connected } = useWallet()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isFollowing, setIsFollowing] = useState(false)
  const [followingLoading, setFollowingLoading] = useState(false)
  
  // Reply compose state
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyPosts, setReplyPosts] = useState<Post[]>([])

  const isOwnProfile = connected && publicKey && user?.walletAddress === publicKey.toBase58()
  const walletAddress = publicKey?.toBase58()
  const { showToast } = useToast()

  useEffect(() => {
    fetchUser()
    fetchPosts()
  }, [username])

  useEffect(() => {
    if (connected && publicKey && user) {
      checkFollowStatus()
    }
  }, [connected, publicKey, user])

  const fetchUser = async () => {
    try {
      const res = await fetch(`/api/users/${username}`)
      if (res.ok) {
        const data = await res.json()
        setUser(data)
      } else {
        setError("User not found")
      }
    } catch (err) {
      setError("Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  const fetchPosts = async () => {
    try {
      const res = await fetch(`/api/posts?username=${encodeURIComponent(username)}&limit=20`)
      if (res.ok) {
        const data = await res.json()
        setPosts(data.posts || [])
      }
    } catch (err) {
      console.error("Failed to fetch posts:", err)
    }
  }

  const checkFollowStatus = async () => {
    if (!publicKey) return
    try {
      const res = await fetch(`/api/users/${username}/follow?follower=${publicKey.toBase58()}`)
      if (res.ok) {
        const data = await res.json()
        setIsFollowing(data.isFollowing)
      }
    } catch (err) {
      console.error("Failed to check follow status:", err)
    }
  }

  const handleFollow = async () => {
    if (!publicKey) return
    setFollowingLoading(true)
    try {
      const res = await fetch(`/api/users/${username}/follow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          follower: publicKey.toBase58(),
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setIsFollowing(data.isFollowing)
        // Refresh user to get updated count
        fetchUser()
      }
    } catch (err) {
      console.error("Failed to follow:", err)
    } finally {
      setFollowingLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  }

  // Handle like/unlike
  const handleLike = async (postId: string) => {
    if (!walletAddress) {
      showToast("Connect your wallet to like posts", "info")
      return
    }

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
    }
  }

  // Handle repost/quote
  const handleRepost = async (postId: string) => {
    if (!walletAddress) {
      showToast("Connect your wallet to repost", "info")
      return
    }

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
    }
  }

  // Handle quote post (repost with comment)
  const handleQuote = async (postId: string, comment: string) => {
    if (!walletAddress) {
      showToast("Connect your wallet to quote post", "info")
      return
    }

    try {
      const res = await fetch(`/api/posts/${postId}/repost`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: walletAddress, comment }),
      })

      if (res.ok) {
        showToast("Quote posted!", "success")
        fetchPosts()
      }
    } catch (err) {
      console.error("Failed to quote post:", err)
      showToast("Failed to quote post", "error")
    }
  }

  // Handle reply click - open compose box for reply
  const handleReplyClick = (postId: string) => {
    if (!walletAddress) {
      showToast("Connect your wallet to reply", "info")
      return
    }
    setReplyTo(postId)
  }

  // Handle actual reply submission
  const handleReply = async (content: string) => {
    if (!walletAddress || !replyTo) {
      showToast("Failed to reply", "error")
      return
    }

    try {
      const res = await fetch(`/api/posts/${replyTo}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, authorId: walletAddress }),
      })

      if (res.ok) {
        showToast("Reply posted!", "success")
        setReplyTo(null)
        // Refresh posts to update reply count
        fetchPosts()
      }
    } catch (err) {
      console.error("Failed to reply:", err)
      showToast("Failed to reply", "error")
    }
  }

  // Thread/reply viewing
  const [showReplies, setShowReplies] = useState<string | null>(null)
  const [threadReplies, setThreadReplies] = useState<Post[]>([])
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
        setThreadReplies(data.replies)
      }
    } catch (err) {
      console.error("Failed to load replies:", err)
    } finally {
      setLoadingReplies(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-shit-darker text-cream p-4">
        <div className="max-w-2xl mx-auto">
          <p className="text-shit-light">Loading...</p>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-shit-darker text-cream p-4">
        <div className="max-w-2xl mx-auto">
          <p className="text-red-400">{error || "User not found"}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-shit-darker text-cream p-4">
      <div className="max-w-2xl mx-auto">
        <ProfileCard
          profile={{
            name: user.displayName || user.username,
            handle: user.username,
            avatar: user.avatar || "",
            banner: user.banner || undefined,
            bio: user.bio || undefined,
            joined: formatDate(user.createdAt),
            followers: user.followersCount,
            following: user.followingCount,
          }}
        />

        {isOwnProfile && (
          <a
            href="/profile"
            className="block w-full mb-6 py-2 px-4 rounded font-bold text-center border border-shit-light text-cream hover:bg-shit transition-colors"
          >
            Edit Profile
          </a>
        )}

        {!isOwnProfile && connected && (
          <button
            onClick={handleFollow}
            disabled={followingLoading}
            className={`w-full mb-6 py-2 px-4 rounded font-bold transition-colors ${
              isFollowing
                ? "bg-shit text-cream border border-shit-light hover:border-red-400"
                : "bg-gold text-shit-darker hover:bg-gold/90"
            }`}
          >
            {followingLoading
              ? "..."
              : isFollowing
              ? "Unfollow"
              : "Follow"}
          </button>
        )}

        {!connected && !isOwnProfile && (
          <p className="text-shit-light text-center mb-6">
            Connect wallet to follow
          </p>
        )}

        <h2 className="text-xl font-bold mb-4">Posts</h2>
        {posts.length === 0 ? (
          <p className="text-shit-light">No posts yet</p>
        ) : (
          <div className="space-y-4">
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
                    timestamp: new Date(post.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    }),
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
                  onReply={() => handleReplyClick(post.id)}
                  onViewReplies={() => loadReplies(post.id)}
                />
                {/* Show replies if expanded - visual threading with indentation */}
                {showReplies === post.id && (
                  <div className="ml-8 space-y-2 border-l-2 border-shit-dark pl-4">
                    {loadingReplies ? (
                      <p className="text-shit-light text-sm">Loading replies...</p>
                    ) : threadReplies.length > 0 ? (
                      threadReplies.map((reply) => (
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
                            timestamp: new Date(reply.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            }),
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
                          onReply={() => handleReplyClick(reply.id)}
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
        )}

        {/* Reply compose */}
        {replyTo && (
          <div className="bg-shit rounded-lg p-4 border border-gold mt-4">
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
    </div>
  )
}