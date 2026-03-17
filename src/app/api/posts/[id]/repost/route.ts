import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

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
    const body = await request.json();
    const { comment } = body;

    // Validate comment length if provided
    if (comment && comment.length > 280) {
      return NextResponse.json({ error: 'Comment must be 280 characters or less' }, { status: 400 });
    }

    // Use session user ID directly
    const userId = session.user.id;

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
      // Create repost (quote post if comment provided)
      await prisma.repost.create({
        data: {
          userId: user.id,
          postId,
          comment: comment?.trim() || null,
        },
      });

      const repostCount = await prisma.repost.count({
        where: { postId },
      });

      return NextResponse.json({
        reposted: true,
        repostCount,
        isQuote: !!comment?.trim(),
      });
    }
  } catch (error) {
    console.error('Error toggling repost:', error);
    return NextResponse.json({ error: 'Failed to toggle repost' }, { status: 500 });
  }
}