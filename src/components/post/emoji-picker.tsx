"use client"

import { useState, useRef, useEffect } from "react"
import { Smile } from "lucide-react"
import { Button } from "../ui/button"

const emojis = ["💩", "🔥", "🚀", "💎", "🐶", " cat", " Elon", " 🚨", "✅", "❌"]

export function EmojiPicker({ onEmojiSelect }: { onEmojiSelect: (emoji: string) => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        size="sm"
        className="text-gold hover:text-gold-light hover:bg-shit"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Smile className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 p-2 bg-shit border border-shit-dark rounded-lg shadow-lg grid grid-cols-5 gap-2 w-48 z-50">
          {emojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                onEmojiSelect(emoji)
                setIsOpen(false)
              }}
              className="text-2xl hover:bg-shit-light rounded p-1 transition-colors"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
