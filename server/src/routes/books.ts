import { Router } from "express";
import {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  updateBookStatus,
  getMyBooks,
  deleteBook,
} from "../controllers/books";
import { authMiddleware } from "../middleware/auth";
import { upload } from "../middleware/upload";

const router = Router();

// GET /api/books — 获取书籍列表（无需登录）
router.get("/", getBooks);

// GET /api/books/my — 获取我的书籍（需要登录）
router.get("/my", authMiddleware, getMyBooks);

// GET /api/books/:id — 获取书籍详情（无需登录）
router.get("/:id", getBookById);

// POST /api/books — 发布书籍（需要登录 + 上传图片）
router.post("/", authMiddleware, upload.array("images", 5), createBook);

// PUT /api/books/:id — 编辑书籍（需要登录 + 图片上传）
router.put("/:id", authMiddleware, upload.array("images", 5), updateBook);

// PATCH /api/books/:id — 更新书籍状态（需要登录）
router.patch("/:id", authMiddleware, updateBookStatus);

// DELETE /api/books/:id — 下架书籍（需要登录）
router.delete("/:id", authMiddleware, deleteBook);

export default router;
