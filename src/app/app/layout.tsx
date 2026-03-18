import { MobileNav } from "@/components/layout/Sidebar"
import { Navbar } from "@/components/layout/Navbar"
import { SessionProvider } from "next-auth/react"
import { Toaster } from "@/components/ui/sonner"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <div className="min-h-screen flex flex-col border-x border-shit-brown/30 md:ml-64">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <MobileNav />
        <Toaster />
      </div>
    </SessionProvider>
  )
}
