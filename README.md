# Shitter Social

Full social media platform for crypto degens. Inspired by Shitter.

## Tech Stack

- **Framework:** Next.js 16, TypeScript, Tailwind, shadcn/ui
- **Database:** PostgreSQL (Neon)
- **Media Storage:** Cloudflare R2 (S3-compatible)
- **Auth:** Wallet-based (Solana)

## Setup

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run dev server
npm run dev
```

## Environment Variables

Create a `.env` file (see `.env.example`):

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://neondb_owner:***@ep-*.neon.tech/neondb?sslmode=require"

# NextAuth
NEXTAUTH_URL="https://social.shitter.io"
NEXTAUTH_SECRET="***"

# Solana
NEXT_PUBLIC_SOLANA_RPC="https://api.mainnet-beta.solana.com"

# Cloudflare R2 (Media Storage)
R2_ACCOUNT_ID="7a77377538d91c2bdd4a639b4c9b59ea"
R2_ENDPOINT="https://7a77377538d91c2bdd4a639b4c9b59ea.r2.cloudflarestorage.com"
R2_BUCKET_NAME="shitter"
R2_ACCESS_KEY_ID="edfb01241a67900b89514b1fc6590de2"
R2_SECRET_ACCESS_KEY="***"
R2_PUBLIC_URL="https://shitter.7a77377538d91c2bdd4a639b4c9b59ea.r2.cloudflarestorage.com"
```

## Deployment (Vercel)

```bash
# Deploy to Vercel
vercel --prod
```

Set environment variables in Vercel dashboard.

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/posts` | GET/POST | List/create posts |
| `/api/posts/[id]` | GET/PUT/DELETE | Single post |
| `/api/media` | POST | Get presigned upload URL |
| `/api/users/[username]` | GET | User profile |

## Media Upload Flow

1. Client calls `/api/media` with `{ filename, contentType }`
2. Server returns presigned PUT URL
3. Client uploads directly to R2 using presigned URL
4. Server returns public URL for storage

Client-side helper: `src/lib/media.ts` (see `uploadImage()`)