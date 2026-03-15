import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/search?q=query&type=posts|users|all
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase() || '';
    const type = searchParams.get('type') || 'all';

    if (!query) {
      return NextResponse.json({ error: 'Query required' }, { status: 400 });
    }

    // Check if query starts with # for hashtag search
    const isHashtag = query.startsWith('#');
    const searchTerm = isHashtag ? query.slice(1) : query;

    // If type is 'all', return both posts and users
    if (type === 'all') {
      const [users, posts, hashtags] = await Promise.all([
        prisma.user.findMany({
          where: {
            OR: [
              { username: { contains: searchTerm } },
              { displayName: { contains: searchTerm } },
              { bio: { contains: searchTerm } },
            ],
          },
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            bio: true,
          },
          take: 10,
        }),
        prisma.post.findMany({
          where: {
            OR: [
              { content: { contains: searchTerm } },
              ...(isHashtag ? [{ content: { contains: query } }] : []),
            ],
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
          orderBy: { createdAt: 'desc' },
          take: 20,
        }),
        // Extract hashtags from posts
        prisma.post.findMany({
          where: {
            content: { contains: '#' },
          },
          select: {
            id: true,
            content: true,
          },
          take: 100,
        }),
      ]);

      // Filter posts that contain the specific hashtag
      const hashtagPosts = isHashtag 
        ? posts.filter(p => p.content.toLowerCase().includes(query))
        : posts;

      // Extract unique hashtags
      const allHashtags = new Map<string, number>();
      for (const post of hashtags) {
        const matches = post.content.match(/#[\w]+/g) || [];
        for (const tag of matches) {
          const tagLower = tag.toLowerCase();
          if (!isHashtag || tagLower === query) {
            allHashtags.set(tagLower, (allHashtags.get(tagLower) || 0) + 1);
          }
        }
      }

      const hashtagResults = isHashtag 
        ? Array.from(allHashtags.entries()).map(([tag, count]) => ({ tag, count }))
        : Array.from(allHashtags.entries())
            .filter(([tag]) => tag.includes(searchTerm))
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

      return NextResponse.json({ 
        users, 
        posts: hashtagPosts,
        hashtags: hashtagResults,
      });
    }

    if (type === 'users') {
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { username: { contains: searchTerm } },
            { displayName: { contains: searchTerm } },
            { bio: { contains: searchTerm } },
          ],
        },
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true,
          bio: true,
        },
        take: 10,
      });
      return NextResponse.json({ users });
    }

    // Default to posts (including hashtag search)
    const posts = await prisma.post.findMany({
      where: {
        OR: [
          { content: { contains: searchTerm } },
          ...(isHashtag ? [{ content: { contains: query } }] : []),
        ],
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
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // Filter for hashtag if needed
    const filteredPosts = isHashtag 
      ? posts.filter(p => p.content.toLowerCase().includes(query))
      : posts;

    return NextResponse.json({ posts: filteredPosts });
  } catch (error) {
    console.error('Error searching:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}