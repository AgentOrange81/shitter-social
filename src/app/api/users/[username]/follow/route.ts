import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

// GET /api/users/[username]/follow - Check follow status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const { searchParams } = new URL(request.url);
    const follower = searchParams.get('follower');

    if (!follower) {
      return NextResponse.json({ error: 'Follower wallet address required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const followerUser = await prisma.user.findUnique({
      where: { walletAddress: follower },
      select: { id: true },
    });

    if (!followerUser) {
      return NextResponse.json({ isFollowing: false });
    }

    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: followerUser.id,
          followingId: user.id,
        },
      },
    });

    return NextResponse.json({ isFollowing: !!follow });
  } catch (error) {
    console.error('Error checking follow status:', error);
    return NextResponse.json({ error: 'Failed to check follow status' }, { status: 500 });
  }
}

// POST /api/users/[username]/follow - Follow/unfollow user
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    // Get authenticated user from session
    const session = await auth();
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { username } = await params;

    // Get the user to follow
    const userToFollow = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!userToFollow) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Use session user as follower
    const followerUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true },
    });

    if (!followerUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: followerUser.id,
          followingId: userToFollow.id,
        },
      },
    });

    if (existingFollow) {
      // Unfollow
      await prisma.follow.delete({
        where: {
          id: existingFollow.id,
        },
      });
      return NextResponse.json({ isFollowing: false });
    } else {
      // Follow
      await prisma.follow.create({
        data: {
          followerId: followerUser.id,
          followingId: userToFollow.id,
        },
      });

      // Create follow notification
      await prisma.notification.create({
        data: {
          type: 'follow',
          userId: userToFollow.id,
          fromUserId: followerUser.id,
        },
      });

      return NextResponse.json({ isFollowing: true });
    }
  } catch (error) {
    console.error('Error toggling follow:', error);
    return NextResponse.json({ error: 'Failed to toggle follow' }, { status: 500 });
  }
}