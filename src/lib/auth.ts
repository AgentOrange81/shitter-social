import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "./db"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Solana Wallet",
      credentials: {
        walletAddress: { label: "Wallet Address", type: "text" },
        signature: { label: "Signature", type: "text" },
        message: { label: "Message", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.walletAddress) {
          return null
        }

        const walletAddress = credentials.walletAddress as string

        // Find or create user by wallet address
        let user = await prisma.user.findUnique({
          where: { walletAddress },
        })

        if (!user) {
          // Auto-create user on first login
          user = await prisma.user.create({
            data: {
              walletAddress,
              username: `user_${walletAddress.slice(0, 8)}`,
              displayName: walletAddress.slice(0, 6) + "..." + walletAddress.slice(-4),
            },
          })
        }

        return {
          id: user.id,
          name: user.displayName || user.username,
          email: user.walletAddress,
          image: user.avatar,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
})