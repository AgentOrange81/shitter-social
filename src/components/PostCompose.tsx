"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface PostComposeProps {
  onSuccess?: () => void;
  placeholder?: string;
}

export function PostCompose({ onSuccess, placeholder = "What's on your mind?" }: PostComposeProps) {
  const { connected, publicKey, signMessage } = useWallet();
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
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
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
    if (!content.trim() && !imageFile) {
      toast.error("Post content is required");
      return;
    }

    if (content.length > MAX_CHARS) {
      toast.error(`Post must be ${MAX_CHARS} characters or less`);
      return;
    }

    if (!connected || !publicKey) {
      toast.error("Connect wallet to post");
      router.push("/login");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      let mediaUrl: string | null = null;

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
          toast.error("Failed to get upload URL");
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
          toast.error("Failed to upload image");
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
          authorId: publicKey.toString(),
          mediaUrl: mediaUrl,
          mediaType: imageFile?.type,
        }),
      });

      const postData = await postRes.json();

      if (!postRes.ok) {
        toast.error(postData.error || "Failed to create post");
        throw new Error(postData.error || "Failed to create post");
      }

      // Success
      toast.success("Your post is live!");
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
      toast.error(err.message || "Failed to create post");
      setError(err.message || "Failed to create post");
    } finally {
      setSubmitting(false);
    }
  };

  if (!connected) {
    return (
      <Card className="border-shit-brown/30 bg-shit-brown/20 p-6 shadow-lifted">
        <p className="text-cream/70 mb-4">Connect your wallet to post</p>
        <Button
          onClick={() => router.push("/login")}
          className="bg-glass hover:bg-gold text-shit-darker shadow-glow"
        >
          Connect Wallet
        </Button>
      </Card>
    );
  }

  return (
    <Card className="border-shit-brown/30 bg-shit-brown/10 p-4 shadow-lifted">
      {/* Text Area */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        maxLength={MAX_CHARS}
        rows={3}
        className="w-full bg-shit-brown/5 border border-shit-brown/30 rounded-lg p-3 text-cream placeholder:text-shit-medium focus:outline-none focus:border-glass focus:ring-1 focus:ring-glass resize-none transition-all"
      />

      {/* Character Counter + Image Upload */}
      <div className="flex items-center justify-between mt-2">
        <span className={`text-sm ${content.length > MAX_CHARS ? "text-red-400" : "text-shit-medium"}`}>
          {content.length}/{MAX_CHARS}
        </span>

        {/* Image Upload */}
        <div className="flex items-center space-x-2">
          <label className="cursor-pointer text-shit-medium hover:text-glass transition-colors">
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
            className="rounded-lg max-h-40 object-cover shadow-lifted"
          />
          <button
            onClick={removeImage}
            className="absolute top-2 right-2 bg-shit-brown/80 text-cream rounded-full p-1 hover:bg-glass hover:text-shit-darker transition-all"
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
        <div />
        <Button
          onClick={handleSubmit}
          disabled={!content.trim() || submitting || uploading || content.length > MAX_CHARS}
          className="bg-glass hover:bg-gold text-shit-darker shadow-glow disabled:bg-shit-brown/30 disabled:shadow-none"
        >
          {submitting ? "Posting..." : uploading ? "Uploading..." : "Post"}
        </Button>
      </div>
    </Card>
  );
}
