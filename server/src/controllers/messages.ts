import { Request, Response } from "express";
import prisma from "../lib/prisma";

/**
 * 获取我的对话列表（按对话人分组，显示最后一条消息）
 * GET /api/messages
 */
export async function getConversations(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const userId = (req as any).userId;

    // 获取当前用户收发过的所有消息，按时间倒序
    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      orderBy: { createdAt: "desc" },
      include: {
        sender: { select: { id: true, username: true, avatar: true } },
        receiver: { select: { id: true, username: true, avatar: true } },
      },
    });

    // 按对话人分组（去重，保留最新一条消息）
    const conversationMap = new Map<number, any>();
    for (const msg of messages) {
      const otherUser =
        msg.senderId === userId ? msg.receiver : msg.sender;
      if (!conversationMap.has(otherUser.id)) {
        conversationMap.set(otherUser.id, {
          otherUser,
          lastMessage: {
            id: msg.id,
            content: msg.content,
            image: msg.image,
            isRead: msg.isRead,
            createdAt: msg.createdAt,
            senderId: msg.senderId,
            bookId: msg.bookId,
          },
        });
      }
    }

    // 统计未读消息数（别人发给我的、未读的）
    const unreadCount = await prisma.message.count({
      where: { receiverId: userId, isRead: false },
    });

    const conversations = Array.from(conversationMap.values());

    res.json({ conversations, unreadCount });
  } catch (error) {
    console.error("获取对话列表错误:", error);
    res.status(500).json({ message: "服务器错误，请稍后再试" });
  }
}

/**
 * 获取和某个用户的聊天记录
 * GET /api/messages/:userId
 */
export async function getChatHistory(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const myId = (req as any).userId;
    const otherId = parseInt(req.params.userId as string);

    if (isNaN(otherId)) {
      res.status(400).json({ message: "无效的用户 ID" });
      return;
    }

    // 获取双方的聊天记录
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: myId, receiverId: otherId },
          { senderId: otherId, receiverId: myId },
        ],
      },
      orderBy: { createdAt: "asc" },
      include: {
        sender: { select: { id: true, username: true, avatar: true } },
      },
    });

    // 将对方发来的未读消息标记为已读
    await prisma.message.updateMany({
      where: { senderId: otherId, receiverId: myId, isRead: false },
      data: { isRead: true },
    });

    // 获取对方信息
    const otherUser = await prisma.user.findUnique({
      where: { id: otherId },
      select: { id: true, username: true, avatar: true },
    });

    res.json({ messages, otherUser });
  } catch (error) {
    console.error("获取聊天记录错误:", error);
    res.status(500).json({ message: "服务器错误，请稍后再试" });
  }
}

/**
 * 发送消息
 * POST /api/messages
 * 支持：纯文字、纯图片、文字+图片
 */
export async function sendMessage(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const senderId = (req as any).userId;
    const { receiverId, bookId, content } = req.body;

    if (!receiverId) {
      res.status(400).json({ message: "请指定接收者" });
      return;
    }

    // 获取上传的图片
    const file = req.file as Express.Multer.File | undefined;
    const imagePath = file ? "/uploads/" + file.filename : null;

    // 必须至少有一项：文字或图片
    const textContent = content?.trim() || "";
    if (!textContent && !imagePath) {
      res.status(400).json({ message: "消息内容不能为空" });
      return;
    }

    // 不能给自己发消息
    if (parseInt(receiverId) === senderId) {
      res.status(400).json({ message: "不能给自己发消息" });
      return;
    }

    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId: parseInt(receiverId),
        bookId: bookId ? parseInt(bookId) : null,
        content: textContent || "📷 图片",
        image: imagePath,
      },
      include: {
        sender: { select: { id: true, username: true, avatar: true } },
      },
    });

    res.status(201).json({ message });
  } catch (error) {
    console.error("发送消息错误:", error);
    res.status(500).json({ message: "服务器错误，请稍后再试" });
  }
}

/**
 * 获取未读消息数量
 * GET /api/messages/unread-count
 */
export async function getUnreadCount(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const userId = (req as any).userId;
    const count = await prisma.message.count({
      where: { receiverId: userId, isRead: false },
    });
    res.json({ count });
  } catch (error) {
    console.error("获取未读数量错误:", error);
    res.status(500).json({ message: "服务器错误，请稍后再试" });
  }
}
