"use client"

import { useState, useEffect, use } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { ProfileCard } from "@/components/post/ProfileCard"
import { PostCard } from "@/components/post/PostCard"

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

  const isOwnProfile = connected && publicKey && user?.walletAddress === publicKey.toBase58()

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
                  timestamp: new Date(post.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  }),
                  stats: {
                    likes: post._count.likes,
                    reposts: post._count.reposts,
                    replies: post._count.replies,
                  },
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}