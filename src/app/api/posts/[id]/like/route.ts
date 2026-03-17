import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

// POST /api/posts/[id]/like - Like or unlike a post
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get authenticated user from session
    const session = await auth();
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id: postId } = await params;

    // Use session user ID directly (it's the Prisma user ID)
    const userId = session.user.id;

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