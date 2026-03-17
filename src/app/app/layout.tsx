import type { Metadata } from "next"
import { Sidebar, MobileNav } from "@/components/layout/Sidebar"
import { Navbar } from "@/components/layout/Navbar"
import { ToastProvider } from "@/components/ui/toast"
import { SessionProvider } from "next-auth/react"
import { WalletProvider } from "@/components/WalletProvider"
import { Toaster } from "@/components/ui/sonner"

export const metadata: Metadata = {
  title: "💩 Shitter Social",
  description: "Social platform for degen community",
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <WalletProvider>
        <ToastProvider>
          <div className="min-h-screen bg-shit-darker">
            {/* Desktop sidebar */}
            <Sidebar />
            
            {/* Main content area */}
            <div className="md:pl-64">
              <Navbar />
              
              <main className="min-h-[calc(100vh-3.5rem)]">
                {children}
              </main>
              
              {/* Mobile nav */}
              <MobileNav />
            </div>
            
            <Toaster />
          </div>
        </ToastProvider>
      </WalletProvider>
    </SessionProvider>
  )
}
