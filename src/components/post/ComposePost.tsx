"use client"

import { useState, useRef } from "react"
import { Button } from "../ui/button"
import { EmojiPicker } from "./emoji-picker"
import { useWallet } from "@solana/wallet-adapter-react"
import { uploadImage } from "@/lib/media"

export function ComposePost({ onPost, placeholder }: { onPost: (content: string, mediaUrl?: string, mediaType?: string) => void; placeholder?: string }) {
  const [content, setContent] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const maxLength = 280
  const { connected } = useWallet()
  const defaultPlaceholder = connected ? "What's happening in the crypto world?" : "Connect wallet to post"

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image must be less than 10MB')
      return
    }

    setSelectedFile(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    
    setIsUploading(true)
    try {
      const url = await uploadImage(selectedFile)
      return url
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Failed to upload image')
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const removeMedia = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async () => {
    if (!content.trim() && !selectedFile) return
    
    let mediaUrl: string | undefined
    let mediaType: string | undefined
    
    if (selectedFile) {
      const uploadedUrl = await handleUpload()
      if (uploadedUrl) {
        mediaUrl = uploadedUrl
        mediaType = selectedFile.type
      }
    }
    
    if (content.trim() || mediaUrl) {
      onPost(content, mediaUrl, mediaType)
      setContent("")
      removeMedia()
    }
  }

  const remaining = Math.max(0, maxLength - content.length)

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

        {previewUrl && (
          <div className="relative mt-2">
            <img
              src={previewUrl}
              alt="Preview"
              className="max-h-48 rounded-lg border border-shit object-cover"
            />
            <button
              onClick={removeMedia}
              className="absolute top-2 right-2 bg-shit-dark text-cream rounded-full p-1 hover:bg-shit"
              type="button"
            >
              ✕
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex items-center justify-between pt-2 border-t border-shit">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-gold hover:text-gold-light hover:bg-shit"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || !connected}
              type="button"
            >
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
              disabled={(!content.trim() && !selectedFile) || isUploading || !connected}
              className="bg-gold text-shit-darker hover:bg-gold-light hover:text-shit-darker disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? "Uploading..." : "Drop a Shitpost"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
