"use client"

import Link from "next/link"
import { Home, Search, Bell, Mail, Bookmark, User } from "lucide-react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

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
    <aside className="hidden h-screen w-64 flex-col border-r border-shit-brown/30 bg-shit-darker md:flex fixed top-0 left-0">
      <div className="px-3 py-4">
        <Link href="/app/home" className="text-2xl font-bold text-glass hover:text-glow transition-colors">
          💩 SHITTER
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-4 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-shit-brown/30 text-glass"
                  : "text-cream hover:bg-shit-brown/20 hover:text-glass"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
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
