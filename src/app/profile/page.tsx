"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletButton } from "@/components/ui/WalletButton"

interface UserProfile {
  id: string
  walletAddress: string
  username: string
  displayName: string | null
  bio: string | null
  avatar: string | null
  banner: string | null
  postsCount?: number
}

export default function ProfilePage() {
  const { publicKey, connected } = useWallet()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  
  const [displayName, setDisplayName] = useState("")
  const [username, setUsername] = useState("")
  const [bio, setBio] = useState("")
  const [avatar, setAvatar] = useState("")
  const [banner, setBanner] = useState("")

  useEffect(() => {
    if (connected && publicKey) {
      fetchProfile()
    } else {
      setLoading(false)
    }
  }, [connected, publicKey])

  const fetchProfile = async () => {
    if (!publicKey) return
    try {
      const res = await fetch(`/api/users/me?walletAddress=${publicKey.toBase58()}`)
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
        setDisplayName(data.displayName || "")
        setUsername(data.username || "")
        setBio(data.bio || "")
        setAvatar(data.avatar || "")
        setBanner(data.banner || "")
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!publicKey) return
    setSaving(true)
    setMessage("")
    
    try {
      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: publicKey.toBase58(),
          displayName: displayName || null,
          username,
          bio: bio || null,
          avatar: avatar || null,
          banner: banner || null,
        }),
      })
      
      if (res.ok) {
        setMessage("Profile updated! 🎉")
        fetchProfile()
      } else {
        const err = await res.json()
        setMessage(err.error || "Failed to update profile")
      }
    } catch (err) {
      setMessage("Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  if (!connected) {
    return (
      <div className="min-h-screen bg-shit-darker text-cream p-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-4">Profile</h1>
          <div className="bg-shit rounded-lg p-6 text-center">
            <p className="text-shit-light mb-4">Connect your wallet to view your profile</p>
            <WalletButton />
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-shit-darker text-cream p-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-4">Profile</h1>
          <p className="text-shit-light">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-shit-darker text-cream p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-shit-light text-sm mb-1">Wallet Address</label>
            <div className="bg-shit rounded px-3 py-2 text-shit-light font-mono text-sm">
              {publicKey?.toBase58().slice(0, 6)}...{publicKey?.toBase58().slice(-4)}
            </div>
          </div>

          <div>
            <label className="block text-shit-light text-sm mb-1">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
              className="w-full bg-shit border border-shit-dark rounded px-3 py-2 text-cream placeholder-shit-light focus:outline-none focus:border-gold"
            />
          </div>

          <div>
            <label className="block text-shit-light text-sm mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
              placeholder="username"
              className="w-full bg-shit border border-shit-dark rounded px-3 py-2 text-cream placeholder-shit-light focus:outline-none focus:border-gold"
            />
            <p className="text-shit-light text-xs mt-1">Letters, numbers, and underscores only</p>
          </div>

          <div>
            <label className="block text-shit-light text-sm mb-1">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 160))}
              placeholder="Tell us about yourself"
              rows={3}
              className="w-full bg-shit border border-shit-dark rounded px-3 py-2 text-cream placeholder-shit-light focus:outline-none focus:border-gold resize-none"
            />
            <p className="text-shit-light text-xs mt-1">{bio.length}/160</p>
          </div>

          <div>
            <label className="block text-shit-light text-sm mb-1">Avatar URL</label>
            <input
              type="text"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className="w-full bg-shit border border-shit-dark rounded px-3 py-2 text-cream placeholder-shit-light focus:outline-none focus:border-gold"
            />
            {avatar && (
              <div className="mt-2">
                <img src={avatar} alt="Avatar preview" className="h-16 w-16 rounded-full object-cover" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-shit-light text-sm mb-1">Banner URL</label>
            <input
              type="text"
              value={banner}
              onChange={(e) => setBanner(e.target.value)}
              placeholder="https://example.com/banner.jpg"
              className="w-full bg-shit border border-shit-dark rounded px-3 py-2 text-cream placeholder-shit-light focus:outline-none focus:border-gold"
            />
            {banner && (
              <div className="mt-2">
                <img src={banner} alt="Banner preview" className="h-16 w-full object-cover rounded" />
              </div>
            )}
          </div>

          {message && (
            <div className={`p-3 rounded ${message.includes("Failed") ? "bg-red/20 text-red" : "bg-green/20 text-green"}`}>
              {message}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-gold text-shit-darker font-bold py-2 px-4 rounded hover:bg-gold/90 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </div>
    </div>
  )
}