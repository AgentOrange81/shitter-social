"use client"

interface Profile {
  name: string
  handle: string
  avatar: string
  banner?: string
  bio?: string
  location?: string
  website?: string
  joined: string
  followers: number
  following: number
}

export function ProfileCard({ profile }: { profile: Profile }) {
  return (
    <div className="bg-shit rounded-lg overflow-hidden mb-4">
      {profile.banner && (
        <div className="h-32 w-full overflow-hidden">
          <img
            src={profile.banner}
            alt="Banner"
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="px-4 pb-4">
        <div className="relative">
          <div className="h-24 w-24 rounded-full bg-gold text-shit-darker flex items-center justify-center font-bold text-3xl border-4 border-shit-darker -mt-16 mb-2">
            {profile.name.charAt(0)}
          </div>
        </div>

        <div className="flex justify-between items-start">
          <div>
            <h2 className="font-bold text-cream text-xl flex items-center gap-2">
              {profile.name}
              <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">💩</span>
            </h2>
            <p className="text-shit-light">@{profile.handle}</p>
          </div>
        </div>

        {profile.bio && <p className="text-cream mt-3">{profile.bio}</p>}

        <div className="flex flex-wrap gap-y-1 gap-x-4 text-sm text-shit-light mt-2">
          {profile.location && (
            <div className="flex items-center gap-1">
              <span>📍</span>
              <span>{profile.location}</span>
            </div>
          )}
          {profile.website && (
            <div className="flex items-center gap-1 text-gold">
              <span>🔗</span>
              <a href={profile.website} target="_blank" rel="noopener noreferrer">
                {profile.website}
              </a>
            </div>
          )}
          <div>
            <span>Joined </span>
            <span>{profile.joined}</span>
          </div>
        </div>

        <div className="flex gap-4 mt-3 text-sm">
          <div className="flex items-center gap-1">
            <span className="font-bold text-cream">{profile.following}</span>
            <span className="text-shit-light">Following</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-bold text-cream">{profile.followers}</span>
            <span className="text-shit-light">Followers</span>
          </div>
        </div>
      </div>
    </div>
  )
}
