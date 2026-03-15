"use client"

import { Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { PostCard } from "@/components/post/PostCard"
import Link from "next/link"

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

interface User {
  id: string
  username: string
  displayName: string
  avatar: string | null
  bio: string | null
}

interface Hashtag {
  tag: string
  count: number
}

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

function transformPost(apiPost: Post) {
  if (!apiPost || !apiPost.author) return null
  const displayName = apiPost.author.displayName || 
    (apiPost.author.username?.startsWith("user_") ? apiPost.author.id.slice(0, 8) + "..." : apiPost.author.username) || "Unknown"
  const handle = apiPost.author.username?.startsWith("user_") ? apiPost.author.id.slice(0, 6) + "..." : apiPost.author.username || "unknown"
  
  return {
    id: apiPost.id,
    user: { name: displayName, handle, avatar: apiPost.author.avatar || "" },
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

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const q = searchParams.get('q') || ''
  const type = searchParams.get('type') || 'all'
  
  const [results, setResults] = useState<{
    posts: Post[]
    users: User[]
    hashtags: Hashtag[]
  }>({ posts: [], users: [], hashtags: [] })
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState(q)
  const [activeTab, setActiveTab] = useState<'posts' | 'users'>('posts')

  useEffect(() => {
    if (q) {
      fetchResults()
    }
  }, [q, type])

  useEffect(() => {
    // Set default tab based on type
    if (type === 'users') setActiveTab('users')
    else if (type === 'posts') setActiveTab('posts')
    else setActiveTab('posts')
  }, [type])

  const fetchResults = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&type=${type}`)
      const data = await res.json()
      setResults({
        posts: data.posts || [],
        users: data.users || [],
        hashtags: data.hashtags || [],
      })
    } catch (err) {
      console.error('Search failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchInput.trim())}&type=${type}`)
    }
  }

  const handleTypeChange = (newType: string) => {
    router.push(`/search?q=${encodeURIComponent(q)}&type=${newType}`)
  }

  const transformedPosts = results.posts.map(transformPost).filter(Boolean)
  const showUsers = type === 'users' || type === 'all'
  const showPosts = type === 'posts' || type === 'all'
  const showHashtags = type === 'all' && results.hashtags.length > 0

  return (
    <div className="min-h-screen bg-shit-darker text-cream p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Search</h1>
        
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2">
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search posts, users, or #hashtags..."
              className="flex-1 bg-shit border border-shit-dark rounded px-4 py-2 text-cream placeholder-shit-light focus:outline-none focus:border-gold"
            />
            <select
              value={type}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="bg-shit border border-shit-dark rounded px-3 py-2 text-cream focus:outline-none focus:border-gold"
            >
              <option value="all">All</option>
              <option value="posts">Posts</option>
              <option value="users">Users</option>
            </select>
            <button type="submit" className="bg-gold text-shit-darker font-bold px-4 py-2 rounded hover:bg-gold/90">
              Search
            </button>
          </div>
        </form>

        {loading ? (
          <p className="text-shit-light">Searching...</p>
        ) : q && results.posts.length === 0 && results.users.length === 0 && results.hashtags.length === 0 ? (
          <p className="text-shit-light">No results found for "{q}"</p>
        ) : !q ? (
          <p className="text-shit-light">Enter a search term above</p>
        ) : (
          <>
            {/* Type selector tabs */}
            <div className="flex border-b border-shit-dark mb-4">
              {showPosts && (
                <button
                  onClick={() => setActiveTab('posts')}
                  className={`px-4 py-2 font-medium ${
                    activeTab === 'posts'
                      ? 'text-gold border-b-2 border-gold'
                      : 'text-shit-light hover:text-cream'
                  }`}
                >
                  Posts ({results.posts.length})
                </button>
              )}
              {showUsers && (
                <button
                  onClick={() => setActiveTab('users')}
                  className={`px-4 py-2 font-medium ${
                    activeTab === 'users'
                      ? 'text-gold border-b-2 border-gold'
                      : 'text-shit-light hover:text-cream'
                  }`}
                >
                  Users ({results.users.length})
                </button>
              )}
            </div>

            {/* Hashtags section */}
            {showHashtags && results.hashtags.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3">Hashtags</h2>
                <div className="flex flex-wrap gap-2">
                  {results.hashtags.map((hashtag) => (
                    <Link
                      key={hashtag.tag}
                      href={`/search?q=${encodeURIComponent(hashtag.tag)}&type=posts`}
                      className="bg-shit px-3 py-1.5 rounded-full text-gold hover:bg-gold/20 transition-colors"
                    >
                      {hashtag.tag} <span className="text-shit-light text-sm">({hashtag.count})</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Results */}
            {activeTab === 'posts' && (
              <div className="space-y-4">
                {transformedPosts.length > 0 ? (
                  transformedPosts.map((post) => (
                    <PostCard key={post!.id} post={post!} />
                  ))
                ) : (
                  <p className="text-shit-light">No posts found</p>
                )}
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-4">
                {results.users.length > 0 ? (
                  results.users.map((user) => (
                    <Link
                      key={user.id}
                      href={`/${user.username}`}
                      className="flex items-center gap-3 p-3 bg-shit rounded-lg hover:bg-shit/70 transition-colors"
                    >
                      <div className="h-12 w-12 rounded-full bg-gold text-shit-darker flex items-center justify-center font-bold text-lg">
                        {(user.displayName || user.username || '?').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-cream truncate">
                          {user.displayName || user.username}
                        </p>
                        <p className="text-shit-light text-sm">@{user.username}</p>
                        {user.bio && (
                          <p className="text-shit-light text-sm truncate mt-1">{user.bio}</p>
                        )}
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-shit-light">No users found</p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-shit-darker text-cream p-4">
        <p className="text-shit-light">Loading...</p>
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}