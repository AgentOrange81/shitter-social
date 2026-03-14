import { PostCard } from "@/components/post/PostCard"
import { ComposePost } from "@/components/post/ComposePost"
import { ProfileCard } from "@/components/post/ProfileCard"

const mockPosts = [
  {
    id: "1",
    user: {
      name: "Crypto King",
      handle: "cryptoking",
      avatar: "/avatar1.png",
    },
    content: "Just bought more $SHIT on the dip! 🚀💩 The best time to buy is when everyone is panic selling. Fear and greed, my friends. 📉➡️📈",
    timestamp: "2h",
    stats: {
      likes: 42,
      replies: 8,
      reposts: 15,
    },
  },
  {
    id: "2",
    user: {
      name: "Moon Whale",
      handle: "moonwhale",
      avatar: "/avatar2.png",
    },
    content: "When you HODL through the bull and bear markets... 🐂🐻 The ride is wild but worth it. WAGMI! 🙏",
    timestamp: "4h",
    stats: {
      likes: 156,
      replies: 34,
      reposts: 89,
    },
  },
  {
    id: "3",
    user: {
      name: "DeFi Degen",
      handle: "defidegen",
      avatar: "/avatar3.png",
    },
    content: "APY chasing today. Found a pool with 500% APY. Hope it's not a rug pull... 🕵️‍♂️ #DeFi #YieldFarming",
    timestamp: "6h",
    stats: {
      likes: 89,
      replies: 67,
      reposts: 23,
    },
  },
  {
    id: "4",
    user: {
      name: "Satoshi's Ghost",
      handle: "satoshisghost",
      avatar: "/avatar4.png",
    },
    content: "Bitcoin is digital gold. Silver is the cryptocurrency of criminals. 🔒 #Bitcoin #Crypto #Freedom",
    timestamp: "8h",
    stats: {
      likes: 234,
      replies: 45,
      reposts: 120,
    },
  },
]

export default function Home() {
  const handlePost = (content: string) => {
    console.log("New post:", content)
    // In a real app, this would call an API to create the post
  }

  return (
    <div className="flex gap-6">
      {/* Main feed */}
      <div className="flex-1 space-y-4">
        {/* Compose post */}
        <ComposePost onPost={handlePost} />

        {/* Posts */}
        {mockPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {/* Right sidebar */}
      <aside className="hidden lg:block w-80 space-y-4">
        {/* Profile */}
        <ProfileCard
          profile={{
            name: "John Doe",
            handle: "johndoe",
            avatar: "/avatar.png",
            bio: "Crypto degenerate | HODLer | Moon boy 🚀",
            location: "Earth",
            website: "https://johndoe.social",
            joined: "March 2024",
            followers: 1234,
            following: 567,
          }}
        />

        {/* Trending */}
        <div className="bg-shit rounded-lg p-4">
          <h3 className="font-bold text-xl mb-4 text-cream">Trending in Crypto</h3>
          <div className="space-y-4">
            {[
              { tag: "$SHIT", posts: "12.5K" },
              { tag: "$MOON", posts: "8.2K" },
              { tag: "#DeFi", posts: "5.6K" },
              { tag: "#Bitcoin", posts: "4.3K" },
              { tag: "#NFT", posts: "3.1K" },
            ].map((trend) => (
              <div key={trend.tag} className="cursor-pointer hover:bg-shit-dark rounded p-2 transition-colors">
                <div className="text-sm text-shit-light">{trend.posts} posts</div>
                <div className="font-bold text-gold hover:underline">{trend.tag}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Who to follow */}
        <div className="bg-shit rounded-lg p-4">
          <h3 className="font-bold text-xl mb-4 text-cream">Who to follow</h3>
          <div className="space-y-3">
            {[
              { name: "Vitalik Buterin", handle: "VitalikButerin" },
              { name: "Elon Musk", handle: "elonmusk" },
              { name: "Crypto Whisperer", handle: "cryptowhisperer" },
            ].map((user) => (
              <div key={user.handle} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-gold text-shit-darker flex items-center justify-center font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-cream hover:underline">{user.name}</div>
                    <div className="text-shit-light text-sm">@{user.handle}</div>
                  </div>
                </div>
                <button className="bg-cream text-shit-darker text-sm font-bold px-3 py-1.5 rounded-full hover:bg-shit transition-colors">
                  Follow
                </button>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  )
}
