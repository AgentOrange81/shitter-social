import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/posts/[id]/replies - Get replies for a post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    const replies = await prisma.post.findMany({
      where: { parentId: postId },
      take: limit,
      orderBy: { createdAt: 'asc' },
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
      },
    });

    return NextResponse.json({ replies });
  } catch (error) {
    console.error('Error fetching replies:', error);
    return NextResponse.json({ error: 'Failed to fetch replies' }, { status: 500 });
  }
}

// POST /api/posts/[id]/replies - Create a reply
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: parentId } = await params;
    const body = await request.json();
    const { content, authorId } = body;

    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    if (content.length > 280) {
      return NextResponse.json({ error: 'Content must be 280 characters or less' }, { status: 400 });
    }

    if (!authorId) {
      return NextResponse.json({ error: 'Author ID is required' }, { status: 400 });
    }

    // Auto-create user if they don't exist (wallet address)
    let user = await prisma.user.findUnique({
      where: { walletAddress: authorId },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          walletAddress: authorId,
          username: `user_${authorId.slice(0, 8)}`,
          displayName: `User ${authorId.slice(0, 6)}...`,
        },
      });
    }

    // Check parent post exists
    const parentPost = await prisma.post.findUnique({
      where: { id: parentId },
    });

    if (!parentPost) {
      return NextResponse.json({ error: 'Parent post not found' }, { status: 404 });
    }

    const reply = await prisma.post.create({
      data: {
        content: content.trim(),
        authorId: user.id,
        parentId,
      },
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
      },
    });

    return NextResponse.json(reply, { status: 201 });
  } catch (error) {
    console.error('Error creating reply:', error);
    return NextResponse.json({ error: 'Failed to create reply' }, { status: 500 });
  }
}