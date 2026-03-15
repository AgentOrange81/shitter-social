"use client"

import Link from "next/link"

interface ContentWithLinksProps {
  content: string
  className?: string
}

/**
 * Parses post content and renders clickable hashtags and @mentions.
 * - #hashtags link to /search?q=#hashtag&type=posts
 * - @mentions link to /{username}
 */
export function ContentWithLinks({ content, className = "" }: ContentWithLinksProps) {
  // Regex patterns
  const hashtagRegex = /#[\w]+/g
  const mentionRegex = /@[\w]+/g

  // Split content into segments while preserving order
  const parts: Array<{
    type: "text" | "hashtag" | "mention"
    value: string
  }> = []

  // Combine both patterns to find all matches
  const combinedRegex = /(#[\w]+)|(@[\w]+)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  // Reset regex state
  combinedRegex.lastIndex = 0

  while ((match = combinedRegex.exec(content)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        value: content.slice(lastIndex, match.index),
      })
    }

    // Determine if it's a hashtag or mention
    const matchedText = match[0]
    if (matchedText.startsWith("#")) {
      parts.push({
        type: "hashtag",
        value: matchedText,
      })
    } else if (matchedText.startsWith("@")) {
      parts.push({
        type: "mention",
        value: matchedText,
      })
    }

    lastIndex = match.index + matchedText.length
  }

  // Add remaining text after last match
  if (lastIndex < content.length) {
    parts.push({
      type: "text",
      value: content.slice(lastIndex),
    })
  }

  // If no matches found, return plain text
  if (parts.length === 0) {
    parts.push({
      type: "text",
      value: content,
    })
  }

  return (
    <div className={className}>
      {parts.map((part, index) => {
        if (part.type === "hashtag") {
          const tag = part.value.slice(1) // Remove #
          return (
            <Link
              key={index}
              href={`/search?q=%23${encodeURIComponent(tag)}&type=posts`}
              className="text-gold hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {part.value}
            </Link>
          )
        }

        if (part.type === "mention") {
          const username = part.value.slice(1) // Remove @
          return (
            <Link
              key={index}
              href={`/${encodeURIComponent(username)}`}
              className="text-gold hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {part.value}
            </Link>
          )
        }

        // Plain text - preserve whitespace and newlines
        return (
          <span key={index} style={{ whiteSpace: "pre-wrap" }}>
            {part.value}
          </span>
        )
      })}
    </div>
  )
}