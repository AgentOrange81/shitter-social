import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/messages - List conversations or get messages
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');
    const conversationId = searchParams.get('conversationId');

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { walletAddress },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ conversations: [] });
    }

    // Get messages in a conversation
    if (conversationId) {
      const messages = await prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'asc' },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
            },
          },
        },
      });

      // Mark as read
      await prisma.message.updateMany({
        where: {
          conversationId,
          senderId: { not: user.id },
          read: false,
        },
        data: { read: true },
      });

      return NextResponse.json({ messages });
    }

    // List conversations
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { participant1Id: user.id },
          { participant2Id: user.id },
        ],
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        participant1: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            walletAddress: true,
          },
        },
        participant2: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            walletAddress: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            messages: {
              where: {
                read: false,
                senderId: { not: user.id },
              },
            },
          },
        },
      },
    });

    const result = conversations.map((conv) => {
      const otherUser = conv.participant1.id === user.id ? conv.participant2 : conv.participant1;
      const lastMessage = conv.messages[0];
      return {
        id: conv.id,
        otherUser: {
          id: otherUser.id,
          username: otherUser.username,
          displayName: otherUser.displayName,
          avatar: otherUser.avatar,
          walletAddress: otherUser.walletAddress,
        },
        lastMessage: lastMessage ? {
          content: lastMessage.content,
          createdAt: lastMessage.createdAt,
          isMine: lastMessage.senderId === user.id,
        } : null,
        unreadCount: conv._count.messages,
      };
    });

    return NextResponse.json({ conversations: result });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

// POST /api/messages - Send a message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { senderWallet, recipientWallet, content, conversationId } = body;

    if (!content || !senderWallet) {
      return NextResponse.json({ error: 'Sender and content required' }, { status: 400 });
    }

    // Get sender
    let sender = await prisma.user.findUnique({
      where: { walletAddress: senderWallet },
      select: { id: true },
    });

    if (!sender) {
      sender = await prisma.user.create({
        data: {
          walletAddress: senderWallet,
          username: `user_${senderWallet.slice(0, 8)}`,
          displayName: `User ${senderWallet.slice(0, 6)}...`,
        },
        select: { id: true },
      });
    }

    // Find or create conversation
    let conversation;
    
    if (conversationId) {
      // Use existing conversation
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
      });
      if (!conversation) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      }
    } else if (recipientWallet) {
      // Find or create by wallet addresses
      let recipient = await prisma.user.findUnique({
        where: { walletAddress: recipientWallet },
        select: { id: true },
      });

      if (!recipient) {
        recipient = await prisma.user.create({
          data: {
            walletAddress: recipientWallet,
            username: `user_${recipientWallet.slice(0, 8)}`,
            displayName: `User ${recipientWallet.slice(0, 6)}...`,
          },
          select: { id: true },
        });
      }

      conversation = await prisma.conversation.findFirst({
        where: {
          OR: [
            { participant1Id: sender.id, participant2Id: recipient.id },
            { participant1Id: recipient.id, participant2Id: sender.id },
          ],
        },
      });

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            participant1Id: sender.id,
            participant2Id: recipient.id,
          },
        });
      }
    } else {
      return NextResponse.json({ error: 'Conversation ID or recipient required' }, { status: 400 });
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        content,
        conversationId: conversation.id,
        senderId: sender.id,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
      },
    });

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}