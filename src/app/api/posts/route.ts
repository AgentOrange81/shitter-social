import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/posts - List posts with pagination (latest first)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const cursor = searchParams.get('cursor');
    const username = searchParams.get('username');

    // Build where clause
    const where: Record<string, unknown> = {};
    if (username) {
      where.author = { username };
    }

    const posts = await prisma.post.findMany({
      take: limit + 1, // Fetch one extra to determine if there's a next page
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
      },
    });

    const hasMore = posts.length > limit;
    const data = hasMore ? posts.slice(0, -1) : posts;
    const nextCursor = hasMore ? data[data.length - 1]?.id : null;

    return NextResponse.json({
      posts: data,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

// POST /api/posts - Create a new post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, authorId, parentId } = body;

    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    if (content.length > 280) {
      return NextResponse.json({ error: 'Content must be 280 characters or less' }, { status: 400 });
    }

    if (!authorId) {
      return NextResponse.json({ error: 'Author ID is required' }, { status: 400 });
    }

    // Validate parentId if provided
    if (parentId) {
      const parentPost = await prisma.post.findUnique({ where: { id: parentId } });
      if (!parentPost) {
        return NextResponse.json({ error: 'Parent post not found' }, { status: 404 });
      }
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

    const post = await prisma.post.create({
      data: {
        content: content.trim(),
        authorId: user.id,
        parentId: parentId || null,
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

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}