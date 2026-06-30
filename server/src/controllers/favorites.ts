import { Request, Response } from "express";
import prisma from "../lib/prisma";

/**
 * 收藏一本书
 * POST /api/favorites/:bookId
 */
export async function addFavorite(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const userId = (req as any).userId;
    const bookId = parseInt(req.params.bookId as string);

    if (isNaN(bookId)) {
      res.status(400).json({ message: "无效的书籍 ID" });
      return;
    }

    // 检查书籍是否存在
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) {
      res.status(404).json({ message: "书籍不存在" });
      return;
    }

    // 收藏（如果已收藏会报唯一约束错误）
    await prisma.favorite.create({
      data: { userId, bookId },
    });

    res.status(201).json({ message: "收藏成功" });
  } catch (error: any) {
    // Prisma 唯一约束错误码
    if (error.code === "P2002") {
      res.status(409).json({ message: "已经收藏过了" });
      return;
    }
    console.error("收藏书籍错误:", error);
    res.status(500).json({ message: "服务器错误，请稍后再试" });
  }
}

/**
 * 取消收藏
 * DELETE /api/favorites/:bookId
 */
export async function removeFavorite(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const userId = (req as any).userId;
    const bookId = parseInt(req.params.bookId as string);

    if (isNaN(bookId)) {
      res.status(400).json({ message: "无效的书籍 ID" });
      return;
    }

    // 删除收藏记录
    await prisma.favorite.deleteMany({
      where: { userId, bookId },
    });

    res.json({ message: "已取消收藏" });
  } catch (error) {
    console.error("取消收藏错误:", error);
    res.status(500).json({ message: "服务器错误，请稍后再试" });
  }
}

/**
 * 获取我的收藏列表（分页）
 * GET /api/favorites?page=1
 */
export async function getMyFavorites(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const userId = (req as any).userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = 12;
    const skip = (page - 1) * limit;

    // 查询收藏总数和当前页数据
    const [favorites, total] = await Promise.all([
      prisma.favorite.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          book: {
            include: {
              seller: {
                select: { id: true, username: true, avatar: true },
              },
            },
          },
        },
      }),
      prisma.favorite.count({ where: { userId } }),
    ]);

    // 提取书籍数据，让前端用起来更方便
    const books = favorites.map((f) => f.book);

    res.json({
      books,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("获取收藏列表错误:", error);
    res.status(500).json({ message: "服务器错误，请稍后再试" });
  }
}

/**
 * 批量检查多本书的收藏状态
 * GET /api/favorites?bookIds=1,2,3
 */
export async function checkFavorites(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const userId = (req as any).userId;
    const idsStr = req.query.bookIds as string;

    if (!idsStr) {
      res.status(400).json({ message: "请提供 bookIds 参数" });
      return;
    }

    const bookIds = idsStr.split(",").map((id) => parseInt(id.trim()));

    if (bookIds.some((id) => isNaN(id))) {
      res.status(400).json({ message: "无效的书籍 ID" });
      return;
    }

    const favorites = await prisma.favorite.findMany({
      where: {
        userId,
        bookId: { in: bookIds },
      },
      select: { bookId: true },
    });

    const favoritedIds = favorites.map((f) => f.bookId);

    res.json({ favoritedIds });
  } catch (error) {
    console.error("批量检查收藏状态错误:", error);
    res.status(500).json({ message: "服务器错误，请稍后再试" });
  }
}

/**
 * 检查某本书是否已收藏
 * GET /api/favorites?bookId=123
 */
export async function checkFavorite(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const userId = (req as any).userId;
    const bookId = parseInt(req.query.bookId as string);

    if (isNaN(bookId)) {
      res.status(400).json({ message: "无效的书籍 ID" });
      return;
    }

    const favorite = await prisma.favorite.findUnique({
      where: { userId_bookId: { userId, bookId } },
    });

    res.json({ isFavorited: !!favorite });
  } catch (error) {
    console.error("检查收藏状态错误:", error);
    res.status(500).json({ message: "服务器错误，请稍后再试" });
  }
}
