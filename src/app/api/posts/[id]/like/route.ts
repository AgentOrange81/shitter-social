import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// POST /api/posts/[id]/like - Like or unlike a post
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Auto-create user if they don't exist (wallet address)
    let user = await prisma.user.findUnique({
      where: { walletAddress: userId },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          walletAddress: userId,
          username: `user_${userId.slice(0, 8)}`,
          displayName: `User ${userId.slice(0, 6)}...`,
        },
      });
    }

    // Use the user's actual Prisma ID for the like
    const userIdForLike = user.id;

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: userIdForLike,
          postId,
        },
      },
    });

    if (existingLike) {
      // Unlike (remove the like)
      await prisma.like.delete({
        where: {
          userId_postId: {
            userId: userIdForLike,
            postId,
          },
        },
      });

      const likeCount = await prisma.like.count({
        where: { postId },
      });

      return NextResponse.json({
        liked: false,
        likeCount,
      });
    } else {
      // Like (create a new like)
      await prisma.like.create({
        data: {
          userId: userIdForLike,
          postId,
        },
      });

      const likeCount = await prisma.like.count({
        where: { postId },
      });

      return NextResponse.json({
        liked: true,
        likeCount,
      });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 });
  }
}