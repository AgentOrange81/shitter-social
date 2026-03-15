import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/posts/feed - Get feed posts (for_you or following)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'for_you';
    const walletAddress = searchParams.get('walletAddress');
    const limit = parseInt(searchParams.get('limit') || '20');
    const cursor = searchParams.get('cursor');

    let userId: string | null = null;
    let userDbId: string | null = null;

    // If wallet provided, get or create the user and get their DB ID
    if (walletAddress) {
      let user = await prisma.user.findUnique({
        where: { walletAddress },
        select: { id: true },
      });
      if (!user) {
        user = await prisma.user.create({
          data: {
            walletAddress,
            username: `user_${walletAddress.slice(0, 8)}`,
            displayName: `User ${walletAddress.slice(0, 6)}...`,
          },
          select: { id: true },
        });
      }
      userDbId = user.id;
    }

    // If following type and wallet provided, get the user's ID
    if (type === 'following' && userDbId) {
      userId = userDbId;
    }

    // Build where clause based on type
    const where: Record<string, unknown> = {};

    if (type === 'following' && userId) {
      // Get posts from users that this user follows
      const follows = await prisma.follow.findMany({
        where: { followerId: userId },
        select: { followingId: true },
      });
      const followingIds = follows.map((f) => f.followingId);
      
      if (followingIds.length === 0) {
        // User follows nobody, return empty
        return NextResponse.json({
          posts: [],
          nextCursor: null,
          hasMore: false,
        });
      }
      
      where.authorId = { in: followingIds };
    }
    // for_you: no filter, gets all posts

    const posts = await prisma.post.findMany({
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            likes: true,
            reposts: true,
            replies: true,
          },
        },
        likes: userDbId ? {
          where: { userId: userDbId },
          select: { id: true },
        } : false,
      },
    });

    const hasMore = posts.length > limit;
    const data = hasMore ? posts.slice(0, -1) : posts;
    const nextCursor = hasMore ? data[data.length - 1]?.id : null;

    // Map posts to include liked status
    const postsWithLiked = data.map((post) => ({
      ...post,
      liked: post.likes && post.likes.length > 0,
    }));

    // Remove the likes array from response (it was just for checking)
    postsWithLiked.forEach((post) => {
      // @ts-expect-error - removing internal likes array
      delete post.likes;
    });

    return NextResponse.json({
      posts: postsWithLiked,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error('Error fetching feed:', error);
    return NextResponse.json({ error: 'Failed to fetch feed' }, { status: 500 });
  }
}