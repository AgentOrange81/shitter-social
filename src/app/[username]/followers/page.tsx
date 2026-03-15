"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams } from "next/navigation"
import Link from "next/link"

interface User {
  id: string
  username: string
  displayName: string | null
  avatar: string | null
  bio: string | null
  followersCount: number
  followingCount: number
}

export default function FollowersPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const type = searchParams.get("type") || "followers"
  const username = params.username as string

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [type, username])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/users/${username}/${type}`)
      if (res.ok) {
        const data = await res.json()
        setUsers(type === "followers" ? data.followers : data.following)
      }
    } catch (err) {
      console.error("Failed to fetch users:", err)
    } finally {
      setLoading(false)
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

  return (
    <div className="min-h-screen bg-shit-darker text-cream p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex gap-6 border-b border-shit mb-6">
          <Link
            href={`/${username}/followers?type=followers`}
            className={`pb-3 px-1 font-bold ${
              type === "followers"
                ? "border-b-2 border-gold text-cream"
                : "text-shit-light hover:text-cream"
            }`}
          >
            Followers
          </Link>
          <Link
            href={`/${username}/followers?type=following`}
            className={`pb-3 px-1 font-bold ${
              type === "following"
                ? "border-b-2 border-gold text-cream"
                : "text-shit-light hover:text-cream"
            }`}
          >
            Following
          </Link>
        </div>

        {users.length === 0 ? (
          <p className="text-shit-light">
            {type === "followers" ? "No followers yet" : "Not following anyone yet"}
          </p>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <Link
                key={user.id}
                href={`/${user.username}`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-shit transition-colors"
              >
                <div className="h-12 w-12 rounded-full bg-gold text-shit-darker flex items-center justify-center font-bold flex-shrink-0">
                  {user.displayName?.charAt(0) || user.username.charAt(0)}
                </div>
                <div>
                  <div className="font-bold">{user.displayName || user.username}</div>
                  <div className="text-shit-light text-sm">@{user.username}</div>
                  {user.bio && (
                    <div className="text-shit-light text-sm mt-1 line-clamp-1">
                      {user.bio}
                    </div>
                  )}
                  <div className="text-shit-light text-xs mt-1">
                    <span className="font-bold text-cream">{user.followersCount}</span> followers ·{" "}
                    <span className="font-bold text-cream">{user.followingCount}</span> following
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}