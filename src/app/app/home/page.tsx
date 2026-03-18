"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { PostCard } from "@/components/PostCard"
import { PostCompose } from "@/components/PostCompose"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"

interface Post {
  id: string
  content: string
  authorId: string
  authorUsername?: string
  authorDisplayName?: string
  authorAvatar?: string
  createdAt: string
  image?: string | null
  likes?: number
  replies?: number
  reposts?: number
}

export default function HomeFeedPage() {
  const { connected } = useWallet()
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()

    fetch("/api/posts/feed", { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch feed")
        return res.json()
      })
      .then((data) => {
        if (isMounted) {
          setPosts(data.posts || [])
          setLoading(false)
        }
      })
      .catch((err) => {
        if (err.name === "AbortError") return
        if (isMounted) {
          console.error("Failed to fetch posts:", err)
          toast.error("Failed to load feed")
          setError(err.message)
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [])

  const [loadingAction, setLoadingAction] = useState<'like' | 'repost' | 'bookmark' | null>(null)

  const handleLike = async (postId: string) => {
    if (!connected) {
      toast.error("Connect wallet to like posts")
      return
    }
    
    setLoadingAction('like')
    try {
      const res = await fetch(`/api/posts/${postId}/like`, { method: "POST" })
      const data = await res.json()
      
      if (res.ok) {
        setPosts(posts.map(p => 
          p.id === postId 
            ? { ...p, likes: data.likeCount, liked: data.liked }
            : p
        ))
      }
    } catch (err) {
      toast.error("Failed to like post")
    } finally {
      setLoadingAction(null)
    }
  }

  const handleRepost = async (postId: string) => {
    if (!connected) {
      toast.error("Connect wallet to repost")
      return
    }
    
    setLoadingAction('repost')
    try {
      const res = await fetch(`/api/posts/${postId}/repost`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      })
      const data = await res.json()
      
      if (res.ok) {
        setPosts(posts.map(p => 
          p.id === postId 
            ? { ...p, reposts: data.repostCount, reposted: data.reposted }
            : p
        ))
      }
    } catch (err) {
      toast.error("Failed to repost")
    } finally {
      setLoadingAction(null)
    }
  }

  if (loading) {
    return (
      <div className="px-4 py-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-shit-brown/30 bg-shit-brown/5 p-4">
            <div className="flex gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-4 py-12 text-center">
        <div className="text-6xl mb-4 animate-float">💥</div>
        <h2 className="text-xl font-bold text-cream mb-2">Failed to Load Feed</h2>
        <p className="text-shit-medium mb-6">{error}</p>
        <Button
          onClick={() => router.refresh()}
          className="bg-glass hover:bg-gold text-shit-darker shadow-glow"
        >
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="px-4 py-6">
      {/* Compose box (only for connected users) */}
      {connected && (
        <div className="mb-6">
          <PostCompose onSuccess={() => router.refresh()} />
        </div>
      )}

      {/* Posts feed */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <Card className="border-shit-brown/30 bg-shit-brown/10 p-8 text-center">
            <div className="text-6xl mb-4 animate-float">🐸</div>
            <h3 className="text-xl font-bold text-cream mb-2">No Posts Yet</h3>
            <p className="text-shit-medium mb-6">Be the first to post something!</p>
            {connected ? (
              <PostCompose placeholder="Start the conversation..." onSuccess={() => router.refresh()} />
            ) : (
              <Button
                onClick={() => router.push("/login")}
                className="bg-glass hover:bg-gold text-shit-darker shadow-glow"
              >
                Connect Wallet
              </Button>
            )}
          </Card>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              id={post.id}
              content={post.content}
              authorUsername={post.authorUsername}
              authorDisplayName={post.authorDisplayName}
              authorAvatar={post.authorAvatar}
              createdAt={post.createdAt}
              image={post.image}
              likes={post.likes}
              replies={post.replies}
              reposts={post.reposts}
              onLike={() => handleLike(post.id)}
              onRepost={() => handleRepost(post.id)}
              loading={loadingAction}
            />
          ))
        )}
      </div>
    </div>
  )
}
