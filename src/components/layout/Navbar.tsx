"use client"

import Link from "next/link"
import { Button } from "../ui/button"
import { Menu, Search, Bell, User } from "lucide-react"
import { WalletButton } from "../ui/WalletButton"

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-shit-brown/30 bg-shit-darker/95 backdrop-blur supports-[backdrop-filter]:bg-shit-darker/60 shadow-glow">
      <div className="container mx-auto flex h-14 max-w-screen-2xl items-center">
        <div className="flex gap-4 md:gap-6">
          <Button variant="ghost" size="icon" className="md:hidden hover:bg-shit-brown/20">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
          <Link href="/" className="flex items-center gap-2 font-bold text-gold hover:text-gold-light">
            💩 Shitter
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end gap-4">
          <div className="hidden md:flex relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-shit-medium" />
            <input
              type="search"
              placeholder="Search..."
              className="h-9 w-64 rounded-md border border-shit-brown/30 bg-shit-brown/10 px-3 py-2 pl-9 text-sm text-cream shadow-sm transition-colors placeholder:text-shit-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <Button variant="ghost" size="icon" className="rounded-full hover:bg-shit-brown/20">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>

          <Link href="/profile">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-shit-brown/20">
              <User className="h-5 w-5" />
              <span className="sr-only">Profile</span>
            </Button>
          </Link>

          <WalletButton />
        </div>
      </div>
    </header>
  )
}
