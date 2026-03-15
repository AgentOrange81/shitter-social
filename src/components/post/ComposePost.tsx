"use client"

import { useState } from "react"
import { Button } from "../ui/button"
import { EmojiPicker } from "./emoji-picker"
import { useWallet } from "@solana/wallet-adapter-react"

export function ComposePost({ onPost, placeholder }: { onPost: (content: string) => void; placeholder?: string }) {
  const [content, setContent] = useState("")
  const maxLength = 280
  const { connected } = useWallet()
  const defaultPlaceholder = connected ? "What's happening in the crypto world?" : "Connect wallet to post"

  const handleSubmit = () => {
    if (content.trim()) {
      onPost(content)
      setContent("")
    }
  }

  const remaining = maxLength - content.length

  return (
    <div className="flex gap-4 border-b border-shit-dark pb-4 mb-4">
      <div className="flex-shrink-0">
        <div className="h-12 w-12 rounded-full bg-gold text-shit-darker flex items-center justify-center font-bold">
          JD
        </div>
      </div>

      <div className="flex-1 space-y-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder || defaultPlaceholder}
          disabled={!connected}
          className="w-full bg-transparent text-cream text-base placeholder:text-shit-light focus:outline-none resize-none min-h-[80px] disabled:opacity-50"
          maxLength={maxLength}
        />

        <div className="flex items-center justify-between pt-2 border-t border-shit">
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="text-gold hover:text-gold-light hover:bg-shit">
              🎨
            </Button>
            <Button variant="ghost" size="sm" className="text-gold hover:text-gold-light hover:bg-shit">
              📸
            </Button>
            <EmojiPicker onEmojiSelect={(emoji) => setContent((prev) => prev + emoji)} />
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-sm ${remaining < 20 ? "text-red" : "text-shit-light"}`}>
              {remaining}
            </span>
            <Button
              onClick={handleSubmit}
              disabled={!content.trim()}
              className="bg-gold text-shit-darker hover:bg-gold-light hover:text-shit-darker disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Drop a Shitpost
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
