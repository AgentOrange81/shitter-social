"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function Navbar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 bg-shit-darker/95 backdrop-blur border-b border-shit-brown/30">
      <div className="flex h-14 items-center justify-center gap-8">
        <Link
          href="/app/home"
          className={cn(
            "text-lg font-bold transition-colors",
            pathname === "/app/home" ? "text-glass" : "text-shit-medium"
          )}
        >
          For You
        </Link>
        <Link
          href="/app/explore"
          className={cn(
            "text-lg font-bold transition-colors",
            pathname === "/app/explore" ? "text-glass" : "text-shit-medium"
          )}
        >
          Following
        </Link>
      </div>
    </header>
  )
}
