import jwt from "jsonwebtoken";

// JWT 密钥（后续移到 .env 文件管理）
const JWT_SECRET = process.env.JWT_SECRET || "campus-books-secret-key";

// 令牌过期时间：7 天
const EXPIRES_IN = "7d";

/**
 * 生成 JWT 令牌
 * @param userId - 用户 ID
 * @returns JWT 字符串
 */
export function generateToken(userId: number): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: EXPIRES_IN });
}

/**
 * 验证 JWT 令牌，返回解码后的用户 ID
 * @param token - JWT 字符串
 * @returns 解码后的 payload，验证失败返回 null
 */
export function verifyToken(token: string): { userId: number } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number };
  } catch {
    return null;
  }
}
