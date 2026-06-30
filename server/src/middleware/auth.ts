import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

/**
 * JWT 认证中间件
 * 从请求头 Authorization 中提取 token，验证后将 userId 挂到 req 上
 *
 * 使用方式：router.post("/publish", authMiddleware, controller)
 */
export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  // 没有 Authorization 头
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "请先登录" });
    return;
  }

  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);

  // token 无效或过期
  if (!decoded) {
    res.status(401).json({ message: "登录已过期，请重新登录" });
    return;
  }

  // 把 userId 挂到请求对象上，后续 controller 可以直接取用
  (req as any).userId = decoded.userId;
  next();
}
