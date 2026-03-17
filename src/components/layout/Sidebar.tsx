"use client"

import Link from "next/link"
import { Home, Search, Bell, Mail, Bookmark, User } from "lucide-react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navItems = [
  {
    name: "Home",
    icon: Home,
    href: "/",
  },
  {
    name: "Explore",
    icon: Search,
    href: "/explore",
  },
  {
    name: "Notifications",
    icon: Bell,
    href: "/notifications",
  },
  {
    name: "Messages",
    icon: Mail,
    href: "/messages",
  },
  {
    name: "Bookmarks",
    icon: Bookmark,
    href: "/bookmarks",
  },
  {
    name: "Profile",
    icon: User,
    href: "/profile",
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden h-screen w-64 flex-col border-r border-shit-dark bg-shit-darker md:flex">
      <div className="flex h-14 items-center px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-gold hover:text-gold-light">
          💩 Shitter
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
                "flex items-center gap-4 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-shit-brown text-glass shadow-glow"
                  : "text-cream hover:bg-shit-brown/50 hover:text-gold"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-shit-dark p-4">
        <div className="flex items-center gap-3 rounded-lg bg-shit-brown/20 p-3 border border-shit-brown/30">
          <div className="h-10 w-10 rounded-full bg-gold text-shit-darker flex items-center justify-center font-bold">
            JD
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="font-medium text-sm text-cream truncate">John Doe</div>
            <div className="text-xs text-shit-light truncate">@johndoe</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
