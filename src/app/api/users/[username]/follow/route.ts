import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

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
    const { username } = await params;
    const body = await request.json();
    const { follower } = body;

    if (!follower) {
      return NextResponse.json({ error: 'Follower wallet address required' }, { status: 400 });
    }

    // Get the user to follow
    const userToFollow = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!userToFollow) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get or create the follower user
    let followerUser = await prisma.user.findUnique({
      where: { walletAddress: follower },
      select: { id: true },
    });

    if (!followerUser) {
      // Create user if doesn't exist
      followerUser = await prisma.user.create({
        data: {
          walletAddress: follower,
          username: `user_${follower.slice(0, 8)}`,
          displayName: `User ${follower.slice(0, 6)}...`,
        },
        select: { id: true },
      });
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
      return NextResponse.json({ isFollowing: true });
    }
  } catch (error) {
    console.error('Error toggling follow:', error);
    return NextResponse.json({ error: 'Failed to toggle follow' }, { status: 500 });
  }
}