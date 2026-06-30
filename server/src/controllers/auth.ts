import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../lib/prisma";
import { generateToken } from "../utils/jwt";

/**
 * 用户注册
 * POST /api/auth/register
 */
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { username, email, password } = req.body;

    // 1. 校验必填字段
    if (!username || !email || !password) {
      res.status(400).json({ message: "请填写所有必填字段" });
      return;
    }

    // 2. 检查用户名或邮箱是否已被注册
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existing) {
      res.status(409).json({
        message:
          existing.username === username ? "用户名已被注册" : "邮箱已被注册",
      });
      return;
    }

    // 3. 哈希加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. 创建用户
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        createdAt: true,
      },
    });

    // 5. 生成 token 并返回
    const token = generateToken(user.id);

    res.status(201).json({
      message: "注册成功",
      user,
      token,
    });
  } catch (error) {
    console.error("注册错误:", error);
    res.status(500).json({ message: "服务器错误，请稍后再试" });
  }
}

/**
 * 用户登录
 * POST /api/auth/login
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    // 1. 校验必填字段
    if (!email || !password) {
      res.status(400).json({ message: "请输入邮箱和密码" });
      return;
    }

    // 2. 查找用户（通过邮箱）
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({ message: "邮箱或密码错误" });
      return;
    }

    // 3. 比对密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "邮箱或密码错误" });
      return;
    }

    // 4. 生成 token 并返回
    const token = generateToken(user.id);

    res.json({
      message: "登录成功",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    console.error("登录错误:", error);
    res.status(500).json({ message: "服务器错误，请稍后再试" });
  }
}

/**
 * 获取当前登录用户信息
 * GET /api/auth/me
 */
export async function getMe(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: "用户不存在" });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error("获取用户信息错误:", error);
    res.status(500).json({ message: "服务器错误，请稍后再试" });
  }
}
