import { Request, Response } from "express";
import prisma from "../lib/prisma";

/**
 * 获取所有在售书籍（分页 + 搜索）
 * GET /api/books?page=1&search=高等数学
 */
export async function getBooks(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 12; // 每页 12 本
    const skip = (page - 1) * limit;
    const search = req.query.search as string | undefined;

    // 构建查询条件
    const where: any = { status: "在售" };

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { author: { contains: search } },
        { courseName: { contains: search } },
        { description: { contains: search } },
      ];
    }

    // 同时查询总数和当前页数据
    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          seller: {
            select: { id: true, username: true, avatar: true },
          },
        },
      }),
      prisma.book.count({ where }),
    ]);

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
    console.error("获取书籍列表错误:", error);
    res.status(500).json({ message: "服务器错误，请稍后再试" });
  }
}

/**
 * 获取单本书籍详情
 * GET /api/books/:id
 */
export async function getBookById(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id as string);

    if (isNaN(id)) {
      res.status(400).json({ message: "无效的书籍 ID" });
      return;
    }

    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        seller: {
          select: { id: true, username: true, avatar: true },
        },
      },
    });

    if (!book) {
      res.status(404).json({ message: "书籍不存在" });
      return;
    }

    res.json({ book });
  } catch (error) {
    console.error("获取书籍详情错误:", error);
    res.status(500).json({ message: "服务器错误，请稍后再试" });
  }
}

/**
 * 发布书籍（需要登录）
 * POST /api/books
 */
export async function createBook(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).userId;
    const { title, author, price, condition, courseName, description } =
      req.body;

    // 校验必填字段
    if (!title || !author || !price || !condition) {
      res.status(400).json({ message: "请填写书名、作者、价格和成色" });
      return;
    }

    // 收集上传的图片路径
    const files = req.files as Express.Multer.File[] | undefined;
    const imagePaths = files
      ? files.map((f) => "/uploads/" + f.filename).join(",")
      : "";

    const book = await prisma.book.create({
      data: {
        title,
        author,
        price: parseFloat(price),
        condition,
        courseName: courseName || null,
        images: imagePaths,
        description: description || null,
        sellerId: userId,
      },
      include: {
        seller: {
          select: { id: true, username: true, avatar: true },
        },
      },
    });

    res.status(201).json({
      message: "发布成功",
      book,
    });
  } catch (error) {
    console.error("发布书籍错误:", error);
    res.status(500).json({ message: "服务器错误，请稍后再试" });
  }
}

/**
 * 更新书籍状态（标记为已售，需要书籍发布者本人操作）
 * PATCH /api/books/:id
 */
export async function updateBookStatus(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const userId = (req as any).userId;
    const id = parseInt(req.params.id as string);
    const { status } = req.body;

    if (isNaN(id)) {
      res.status(400).json({ message: "无效的书籍 ID" });
      return;
    }

    // 先查这本书是不是当前用户发布的
    const book = await prisma.book.findUnique({ where: { id } });

    if (!book) {
      res.status(404).json({ message: "书籍不存在" });
      return;
    }

    if (book.sellerId !== userId) {
      res.status(403).json({ message: "只能修改自己发布的书籍" });
      return;
    }

    const updatedBook = await prisma.book.update({
      where: { id },
      data: { status },
    });

    res.json({
      message: "更新成功",
      book: updatedBook,
    });
  } catch (error) {
    console.error("更新书籍错误:", error);
    res.status(500).json({ message: "服务器错误，请稍后再试" });
  }
}

/**
 * 获取当前用户发布的书籍
 * GET /api/books/my
 */
export async function getMyBooks(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).userId;

    const books = await prisma.book.findMany({
      where: { sellerId: userId },
      orderBy: { createdAt: "desc" },
      include: {
        seller: {
          select: { id: true, username: true, avatar: true },
        },
      },
    });

    res.json({ books });
  } catch (error) {
    console.error("获取我的书籍错误:", error);
    res.status(500).json({ message: "服务器错误，请稍后再试" });
  }
}
