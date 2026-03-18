"use client"

import Link from "next/link"
import Image from "next/image"
import { Heart, MessageCircle, Repeat2, Bookmark } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface PostCardProps {
  id: string
  content: string
  authorUsername?: string
  authorDisplayName?: string
  authorAvatar?: string
  createdAt: string
  image?: string | null
  likes?: number
  replies?: number
  reposts?: number
  liked?: boolean
  reposted?: boolean
  bookmarked?: boolean
  onLike?: () => void
  onRepost?: () => void
  onBookmark?: () => void
  onReply?: () => void
  loading?: 'like' | 'repost' | 'bookmark' | null
}

export function PostCard({
  id,
  content,
  authorUsername,
  authorDisplayName,
  authorAvatar,
  createdAt,
  image,
  likes = 0,
  replies = 0,
  reposts = 0,
  liked = false,
  reposted = false,
  bookmarked = false,
  loading,
  onLike,
  onRepost,
  onBookmark,
  onReply,
}: PostCardProps) {
  const initials = authorUsername?.charAt(0).toUpperCase() || authorDisplayName?.charAt(0).toUpperCase() || "U"

  return (
    <Card className="border-shit-brown/30 bg-shit-brown/5 hover:bg-shit-brown/10 transition-colors">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <Link href={`/app/profile/${authorUsername || 'unknown'}`}>
            <Avatar className="h-10 w-10 border border-shit-brown/30">
              {authorAvatar ? (
                <Image
                  src={authorAvatar}
                  alt={authorUsername || "User"}
                  width={40}
                  height={40}
                  className="object-cover"
                />
              ) : (
                <AvatarFallback className="bg-glass text-shit-darker font-bold">
                  {initials}
                </AvatarFallback>
              )}
            </Avatar>
          </Link>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Link
                href={`/app/profile/${authorUsername || 'unknown'}`}
                className="font-bold text-cream/95 hover:text-glass transition-colors"
              >
                {authorDisplayName || authorUsername || "Anonymous"}
              </Link>
              {authorUsername && (
                <span className="text-shit-medium/80 text-sm">@{authorUsername}</span>
              )}
              <span className="text-shit-medium/80 text-sm">·</span>
              <span className="text-shit-medium/80 text-sm">
                {new Date(createdAt).toLocaleDateString()}
              </span>
            </div>

            <p className="text-cream/90 whitespace-pre-wrap break-words mb-3">
              {content}
            </p>

            {image && (
              <div className="relative mb-3 rounded-xl overflow-hidden border border-shit-brown/30">
                <Image
                  src={image}
                  alt="Post attachment"
                  width={600}
                  height={400}
                  className="w-full h-auto max-h-96 object-cover"
                />
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-between mt-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-shit-medium hover:text-blue-400 hover:bg-blue-400/10 gap-2"
                onClick={onReply}
              >
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm">{replies > 0 ? replies : ""}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "text-shit-medium hover:text-green-400 hover:bg-green-400/10 gap-2",
                  reposted && "text-green-400"
                )}
                onClick={onRepost}
                disabled={loading === 'repost'}
              >
                {loading === 'repost' ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-green-400" />
                ) : (
                  <Repeat2 className="h-4 w-4" />
                )}
                <span className="text-sm">{reposts > 0 ? reposts : ""}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "text-shit-medium hover:text-pink-400 hover:bg-pink-400/10 gap-2",
                  liked && "text-pink-400"
                )}
                onClick={onLike}
                disabled={loading === 'like'}
              >
                {loading === 'like' ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-pink-400" />
                ) : (
                  <Heart className={cn("h-4 w-4", liked && "fill-current")} />
                )}
                <span className="text-sm">{likes > 0 ? likes : ""}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "text-shit-medium hover:text-glass hover:bg-glass/10 gap-2",
                  bookmarked && "text-glass"
                )}
                onClick={onBookmark}
                disabled={loading === 'bookmark'}
              >
                {loading === 'bookmark' ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-glass" />
                ) : (
                  <Bookmark className={cn("h-4 w-4", bookmarked && "fill-current")} />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
