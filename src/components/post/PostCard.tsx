"use client"

import { useState } from "react"
import { Heart, MessageCircle, Repeat2, Share2, X } from "lucide-react"
import { Button } from "../ui/button"
import { ContentWithLinks } from "./ContentWithLinks"

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
  liked?: boolean
  reposted?: boolean
  // Quote post fields
  comment?: string
  quotedPost?: {
    id: string
    user: {
      name: string
      handle: string
    }
    content: string
    image?: string
  }
}

interface PostCardProps {
  post: Post
  onLike?: () => void
  onRepost?: () => void
  onQuote?: (comment: string) => void
  onReply?: () => void
  onViewReplies?: () => void
}

export function PostCard({ post, onLike, onRepost, onQuote, onReply, onViewReplies }: PostCardProps) {
  const [showQuoteModal, setShowQuoteModal] = useState(false)
  const [quoteComment, setQuoteComment] = useState("")

  const handleRepostClick = () => {
    // If onQuote is provided, show the quote modal instead of simple repost
    if (onQuote) {
      setShowQuoteModal(true)
    } else if (onRepost) {
      onRepost()
    }
  }

  const handleQuoteSubmit = () => {
    if (quoteComment.trim() && onQuote) {
      onQuote(quoteComment.trim())
      setQuoteComment("")
      setShowQuoteModal(false)
    }
  }

  const handleCloseQuoteModal = () => {
    setShowQuoteModal(false)
    setQuoteComment("")
  }

  return (
    <>
      <article className="flex gap-4 border-b border-shit-dark pb-4 hover:bg-shit/30 transition-colors">
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

          {/* Quote comment (user's own comment on the repost) */}
          {post.comment && (
            <div className="text-cream text-base leading-relaxed">
              <ContentWithLinks content={post.comment} />
            </div>
          )}

          <div className="text-cream text-base leading-relaxed">
            <ContentWithLinks content={post.content} />
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

          {/* Quoted post (for quote posts in the feed) */}
          {post.quotedPost && (
            <div className="border border-shit-dark rounded-lg p-3 bg-shit/20">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-cream text-sm">{post.quotedPost.user.name}</span>
                <span className="text-shit-light text-sm">@{post.quotedPost.user.handle}</span>
              </div>
              <p className="text-shit-light text-sm">
                <ContentWithLinks content={post.quotedPost.content} />
              </p>
              {post.quotedPost.image && (
                <img
                  src={post.quotedPost.image}
                  alt="Quoted post attachment"
                  className="mt-2 rounded-lg w-full max-h-40 object-cover"
                />
              )}
            </div>
          )}

          <div className="flex justify-between items-center max-w-md">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-shit-light hover:text-blue hover:bg-shit"
              onClick={(e) => {
                e.stopPropagation()
                onViewReplies?.()
              }}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              <span className="text-sm">{post.stats.replies}</span>
            </Button>

            <Button 
              variant="ghost" 
              size="sm" 
              className={`hover:text-green hover:bg-shit ${post.reposted ? 'text-green' : 'text-shit-light'}`}
              onClick={(e) => {
                e.stopPropagation()
                handleRepostClick()
              }}
            >
              <Repeat2 className="h-4 w-4 mr-2" />
              <span className="text-sm">{post.stats.reposts}</span>
            </Button>

            <Button 
              variant="ghost" 
              size="sm" 
              className={`hover:text-red hover:bg-shit ${post.liked ? 'text-red fill-current' : 'text-shit-light'}`}
              onClick={(e) => {
                e.stopPropagation()
                onLike?.()
              }}
            >
              <Heart className={`h-4 w-4 mr-2 ${post.liked ? 'fill-current' : ''}`} />
              <span className="text-sm">{post.stats.likes}</span>
            </Button>

            <Button variant="ghost" size="sm" className="text-shit-light hover:text-cream hover:bg-shit">
              <Share2 className="h-4 w-4 mr-2" />
            </Button>
          </div>
        </div>
      </article>

      {/* Quote Post Modal */}
      {showQuoteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-shit-darker border border-shit-dark rounded-xl max-w-lg w-full p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-cream">Quote Post</h3>
              <button
                onClick={handleCloseQuoteModal}
                className="text-shit-light hover:text-cream"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Original post preview */}
            <div className="bg-shit/30 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-cream text-sm">{post.user.name}</span>
                <span className="text-shit-light text-sm">@{post.user.handle}</span>
              </div>
              <p className="text-shit-light text-sm">
                <ContentWithLinks content={post.content} />
              </p>
            </div>

            {/* Comment input */}
            <textarea
              value={quoteComment}
              onChange={(e) => setQuoteComment(e.target.value.slice(0, 280))}
              placeholder="Add a comment..."
              className="w-full bg-transparent text-cream placeholder-shit-light focus:outline-none resize-none min-h-[80px]"
              maxLength={280}
              autoFocus
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-shit-light text-sm">
                {quoteComment.length}/280
              </span>
              <Button
                onClick={handleQuoteSubmit}
                disabled={!quoteComment.trim()}
                className="bg-gold text-shit-darker hover:bg-gold/90"
              >
                Post
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}