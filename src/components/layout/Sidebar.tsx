"use client"

import Link from "next/link"
import { Home, Search, Bell, Mail, Bookmark, User, Menu } from "lucide-react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { WalletButton } from "@/components/ui/WalletButton"

const navItems = [
  { name: "Home", icon: Home, href: "/app/home" },
  { name: "Explore", icon: Search, href: "/app/explore" },
  { name: "Notifications", icon: Bell, href: "/app/notifications" },
  { name: "Messages", icon: Mail, href: "/app/messages" },
  { name: "Bookmarks", icon: Bookmark, href: "/app/bookmarks" },
  { name: "Profile", icon: User, href: "/app/profile" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden h-screen w-64 flex-col border-r border-shit-brown/30 bg-shit-darker md:flex">
      <div className="flex h-14 items-center px-4">
        <Link href="/app/home" className="flex items-center gap-2 font-bold text-glass hover:text-gold transition-colors">
          <span className="text-2xl">💩</span>
          <span>Shitter</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-4 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-shit-brown/30 text-glass shadow-glow"
                  : "text-cream hover:bg-shit-brown/20 hover:text-glass"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-shit-brown/30 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-shit-brown/20 p-3 border border-shit-brown/30">
          <div className="h-10 w-10 rounded-full bg-glass text-shit-darker flex items-center justify-center font-bold">
            JD
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="font-medium text-sm text-cream truncate">John Doe</div>
            <div className="text-xs text-shit-medium truncate">@johndoe</div>
          </div>
        </div>
      </div>
    </aside>
  )
}

export function MobileNav() {
  const pathname = usePathname()

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-shit-darker border-t border-shit-brown/30 px-4 py-2">
      <div className="flex justify-around items-center">
        {navItems.slice(0, 5).map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-lg transition-all",
                isActive
                  ? "text-glass"
                  : "text-shit-medium hover:text-glass"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
