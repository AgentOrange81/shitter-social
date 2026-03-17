"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface PostComposeProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function PostCompose({ onSuccess, onCancel, placeholder = "What's on your mind?", autoFocus = false }: PostComposeProps) {
  const { connected, publicKey } = useWallet();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const MAX_CHARS = 280;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      return;
    }

    setImageFile(file);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async () => {
    if (!connected) {
      setError("Please connect your wallet to post");
      return;
    }

    if (!content.trim()) {
      setError("Post content is required");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      let mediaUrl: string | undefined = undefined;

      // Upload image if attached
      if (imageFile) {
        setUploading(true);

        // Get presigned URL
        const mediaRes = await fetch("/api/media", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: imageFile.name,
            contentType: imageFile.type,
          }),
        });

        const mediaData = await mediaRes.json();

        if (!mediaData.uploadUrl) {
          throw new Error("Failed to get upload URL");
        }

        // Upload to R2
        const uploadRes = await fetch(mediaData.uploadUrl, {
          method: "PUT",
          body: imageFile,
          headers: {
            "Content-Type": imageFile.type,
          },
        });

        if (!uploadRes.ok) {
          throw new Error("Failed to upload image");
        }

        mediaUrl = mediaData.publicUrl;
        setUploading(false);
      }

      // Create post
      const postRes = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: content.trim(),
          authorId: publicKey?.toString() || "",
          mediaUrl: mediaUrl,
          mediaType: imageFile?.type,
        }),
      });

      const postData = await postRes.json();

      if (!postRes.ok) {
        throw new Error(postData.error || "Failed to create post");
      }

      // Success
      setContent("");
      setImageFile(null);
      setImagePreview(null);

      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
      }
    } catch (err: any) {
      console.error("Post error:", err);
      setError(err.message || "Failed to create post");
    } finally {
      setSubmitting(false);
    }
  };

  if (!connected) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <p className="text-zinc-400 mb-4">Connect your wallet to post</p>
        <button
          onClick={() => router.push("/login")}
          className="px-6 py-3 bg-amber-700 hover:bg-amber-600 text-white font-bold rounded-xl"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      {/* Text Area */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        maxLength={MAX_CHARS}
        rows={3}
        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-700 resize-none"
      />

      {/* Character Counter */}
      <div className="flex items-center justify-between mt-2">
        <span className={`text-sm ${content.length > MAX_CHARS ? "text-red-400" : "text-zinc-500"}`}>
          {content.length}/{MAX_CHARS}
        </span>

        {/* Image Upload */}
        <div className="flex items-center space-x-2">
          <label className="cursor-pointer text-zinc-500 hover:text-amber-700 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012 2l1.586 1.586m-6 0l-4-4m0 0l4-4m-4 4h12" />
            </svg>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Image Preview */}
      {imagePreview && (
        <div className="relative mt-3">
          <Image
            src={imagePreview}
            alt="Preview"
            width={200}
            height={150}
            className="rounded-lg max-h-40 object-cover"
          />
          <button
            onClick={removeImage}
            className="absolute top-2 right-2 bg-zinc-900/80 text-white rounded-full p-1 hover:bg-zinc-800"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-red-400 text-sm mt-3">{error}</p>
      )}

      {/* Submit Button */}
      <div className="flex items-center justify-between mt-4">
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={!content.trim() || submitting || uploading || content.length > MAX_CHARS}
          className="px-6 py-2 bg-amber-700 hover:bg-amber-600 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors"
        >
          {submitting ? "Posting..." : uploading ? "Uploading..." : "Post"}
        </button>
      </div>
    </div>
  );
}
