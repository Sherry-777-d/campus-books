import { Router } from "express";
import { register, login, getMe } from "../controllers/auth";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// POST /api/auth/register — 注册（无需登录）
router.post("/register", register);

// POST /api/auth/login — 登录（无需登录）
router.post("/login", login);

// GET /api/auth/me — 获取当前用户（需要登录）
router.get("/me", authMiddleware, getMe);

export default router;
