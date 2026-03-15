/**
 * Skeleton loader components for loading states
 */

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-shit rounded ${className}`} />
  )
}

export function PostSkeleton() {
  return (
    <article className="flex gap-4 border-b border-shit-dark pb-4">
      <div className="flex-shrink-0">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
      <div className="flex-1 space-y-3">
        {/* Header skeleton */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
        {/* Content skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        {/* Image skeleton (sometimes) */}
        <Skeleton className="h-48 w-full rounded-lg" />
        {/* Actions skeleton */}
        <div className="flex justify-between max-w-md pt-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-10" />
        </div>
      </div>
    </article>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-4">
      {/* Banner */}
      <Skeleton className="h-32 w-full" />
      {/* Avatar & info */}
      <div className="px-4">
        <div className="flex items-end gap-4 -mt-12">
          <Skeleton className="h-24 w-24 rounded-full border-4 border-shit-darker" />
          <Skeleton className="h-10 w-24 mb-2" />
        </div>
        <div className="mt-4 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex gap-6 mt-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  )
}

export function FeedSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <PostSkeleton key={i} />
      ))}
    </div>
  )
}