import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

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

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check if already reposted
    const existingRepost = await prisma.repost.findFirst({
      where: {
        userId: user.id,
        postId,
      },
    });

    if (existingRepost) {
      // Remove repost
      await prisma.repost.delete({
        where: { id: existingRepost.id },
      });

      const repostCount = await prisma.repost.count({
        where: { postId },
      });

      return NextResponse.json({
        reposted: false,
        repostCount,
      });
    } else {
      // Create repost
      await prisma.repost.create({
        data: {
          userId: user.id,
          postId,
        },
      });

      const repostCount = await prisma.repost.count({
        where: { postId },
      });

      return NextResponse.json({
        reposted: true,
        repostCount,
      });
    }
  } catch (error) {
    console.error('Error toggling repost:', error);
    return NextResponse.json({ error: 'Failed to toggle repost' }, { status: 500 });
  }
}