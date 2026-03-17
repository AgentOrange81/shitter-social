"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Search, Bell, User, Menu } from "lucide-react"
import { Input } from "@/components/ui/input"

interface NavbarProps {
  onMenuClick?: () => void
}

export function Navbar({ onMenuClick }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-shit-brown/30 bg-shit-darker/95 backdrop-blur supports-[backdrop-filter]:bg-shit-darker/60 shadow-glow">
      <div className="container mx-auto flex h-14 max-w-screen-2xl items-center px-4">
        <div className="flex gap-4 md:gap-6">
          <Button variant="ghost" size="icon" className="md:hidden hover:bg-shit-brown/20" onClick={onMenuClick}>
            <Menu className="h-5 w-5" />
          </Button>
          <Link href="/app/home" className="flex items-center gap-2 font-bold text-glass hover:text-gold transition-colors">
            <span className="text-2xl">💩</span>
            <span className="hidden sm:inline">Shitter</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end gap-4">
          <div className="hidden md:flex relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-shit-medium" />
            <Input
              type="search"
              placeholder="Search..."
              className="h-9 pl-9 bg-shit-brown/10 border-shit-brown/30 text-cream placeholder:text-shit-medium focus:border-glass focus:ring-1 focus:ring-glass"
            />
          </div>

          <Button variant="ghost" size="icon" className="rounded-full hover:bg-shit-brown/20">
            <Bell className="h-5 w-5" />
          </Button>

          <Link href="/app/profile">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-shit-brown/20">
              <User className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
