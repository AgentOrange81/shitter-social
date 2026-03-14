"use client"

import { Heart, MessageCircle, Repeat2, Share2 } from "lucide-react"
import { Button } from "../ui/button"

interface Post {
  id: string
  user: {
    name: string
    handle: string
    avatar: string
  }
  content: string
  image?: string
  timestamp: string
  stats: {
    likes: number
    replies: number
    reposts: number
  }
}

export function PostCard({ post }: { post: Post }) {
  return (
    <article className="flex gap-4 border-b border-shit-dark pb-4 hover:bg-shit/30 transition-colors cursor-pointer">
      <div className="flex-shrink-0">
        <div className="h-12 w-12 rounded-full bg-gold text-shit-darker flex items-center justify-center font-bold">
          {post.user.name.charAt(0)}
        </div>
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-cream hover:underline">{post.user.name}</span>
            <span className="text-shit-light">@{post.user.handle}</span>
            <span className="text-shit-light text-xs">·</span>
            <span className="text-shit-light text-sm">{post.timestamp}</span>
          </div>
        </div>

        <div className="text-cream text-base leading-relaxed">
          {post.content}
        </div>

        {post.image && (
          <div className="rounded-lg overflow-hidden border border-shit">
            <img
              src={post.image}
              alt="Post attachment"
              className="w-full h-auto max-h-96 object-cover"
            />
          </div>
        )}

        <div className="flex justify-between items-center max-w-md">
          <Button variant="ghost" size="sm" className="text-shit-light hover:text-cream hover:bg-shit">
            <MessageCircle className="h-4 w-4 mr-2" />
            <span className="text-sm">{post.stats.replies}</span>
          </Button>

          <Button variant="ghost" size="sm" className="text-shit-light hover:text-green hover:bg-shit">
            <Repeat2 className="h-4 w-4 mr-2" />
            <span className="text-sm">{post.stats.reposts}</span>
          </Button>

          <Button variant="ghost" size="sm" className="text-shit-light hover:text-red hover:bg-shit">
            <Heart className="h-4 w-4 mr-2" />
            <span className="text-sm">{post.stats.likes}</span>
          </Button>

          <Button variant="ghost" size="sm" className="text-shit-light hover:text-cream hover:bg-shit">
            <Share2 className="h-4 w-4 mr-2" />
          </Button>
        </div>
      </div>
    </article>
  )
}
