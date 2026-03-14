# CLAUDE.md - Shitter Social

Full social media platform for crypto degens. Inspired by https://github.com/BreadGiver/Shitter

## Project
- **URL:** social.shitter.io (separate subdomain deployment)
- **Repo:** https://github.com/AgentOrange81/shitter-social
- **Tech:** Next.js 16, TypeScript, Tailwind, shadcn/ui
- **Status:** UI scaffold in progress
- **Architecture:** Standalone app, separate from shitter.io and screener.shitter.io

---

## MVP Features (Phase 1-2)

### Core Social (Priority)
- **Posts:** 280-char limit, replies, likes
- **Threads:** Reply chains
- **Profiles:** Avatar, banner, bio, follower counts
- **Timelines:** "For You" + "Following" tabs
- **Hashtags & @mentions:** Auto-detected

### Auth (Wallet-based)
- NextAuth v5 + Sign In With Solana (SIWS)
- Supported wallets: Phantom, Solflare, Backpack
- Use `@solana/wallet-adapter-react`

### Later (Phase 3+)
- Reposts, quotes, bookmarks
- Media uploads (use vanity-api S3 or simple storage)
- DMs
- Search
- Real-time notifications (Socket.io)

### NOT Building (Out of Scope)
- Memecoin launchpad (shitter.io)
- Trading UI (screener.shitter.io)
- LiveKit streaming
- YouTube profile songs

---

## UI Theme

### Colors (Gold/Shit)
```css
--gold: #D4AF37
--gold-light: #E5C76B
--shit-darker: #1a1a1a
--shit-dark: #2d2d2d
--shit: #3d3d3d
--shit-light: #5a5a5a
--cream: #f5f5dc
```

### Branding
- **Primary:** Saddlebrown #8B4513 (or gold)
- **Logo:** Brown bird on poop pile (Shitter bird)
- **Verified Badge:** 💩
- **Post Button:** "Drop a Shitpost"
- **Delete:** "Flush this shitpost" 🚽

---

## Database

Use PostgreSQL + Prisma ORM.

### Models
```prisma
User
Post
Like
Repost
Bookmark
Follow (follower/following)
Notification
Message
Conversation
ConversationParticipant
Memecoin (linked to shitter tokens)
```

---

## Project Structure

```
shitter-social/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── (auth)/login/       # Wallet login
│   │   ├── (main)/
│   │   │   ├── home/           # Feed
│   │   │   ├── [username]/    # Profile
│   │   │   ├── search/         # Search
│   │   │   ├── notifications/  # Notifications
│   │   │   ├── messages/       # DMs
│   │   │   ├── bookmarks/      # Saved posts
│   │   │   └── compose/        # New post
│   │   ├── api/
│   │   │   ├── auth/           # NextAuth
│   │   │   ├── posts/          # CRUD
│   │   │   ├── users/          # Profile
│   │   │   └── messages/       # DMs
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── layout/             # Navbar, Sidebar
│   │   ├── post/               # PostCard, PostComposer
│   │   ├── ui/                 # shadcn components
│   │   └── providers.tsx       # Auth + Wallet + Socket
│   └── lib/
│       ├── auth.ts             # NextAuth + SIWS
│       ├── db.ts               # Prisma client
│       ├── solana.ts           # Wallet utils
│       └── utils.ts            # Helpers
```

---

## API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/[...nextauth]` | * | NextAuth handler |
| `/api/posts` | GET/POST | List/create posts |
| `/api/posts/[id]` | GET/PUT/DELETE | Single post |
| `/api/posts/[id]/like` | POST | Like post |
| `/api/posts/[id]/repost` | POST | Repost |
| `/api/users/[username]` | GET | User profile |
| `/api/users/[username]/follow` | POST | Follow/unfollow |
| `/api/messages` | GET/POST | DMs |
| `/api/search` | GET | Search all |

---

## Environment Variables

```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=
NEXT_PUBLIC_SOLANA_RPC=
R2_*
```

---

## Dependencies

```bash
npm install next-auth@beta @solana/wallet-adapter-react @solana/wallet-adapterPhantom \
@solana/wallet-adapter-solflare @prisma/client prisma socket.io socket.io-client \
@radix-ui/react-avatar @radix-ui/react-dropdown-menu @radix-ui/react-slot \
class-variance-authority clsx tailwind-merge lucide-react
```

---

## Implementation Order

1. **Setup** - Prisma schema + DB connection
2. **Auth** - NextAuth + SIWS + wallet connection
3. **Posts** - Create, display, like, repost
4. **Profiles** - View, follow, edit
5. **Timeline** - For You + Following feeds
6. **Search** - Users/posts/hashtags
7. **Notifications** - Real-time via Socket.io
8. **DMs** - 1:1 messaging
9. **Media** - R2 uploads (later)

---

## Notes
- Keep theme consistent with shitter (dark + gold)
- Link to main shitter for token launches
- Share price data from shit-screener
- Use shadcn/ui for components

---
*Updated 2026-03-14*