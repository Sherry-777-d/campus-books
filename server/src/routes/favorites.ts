import { Router } from "express";
import {
  addFavorite,
  removeFavorite,
  getMyFavorites,
  checkFavorite,
  checkFavorites,
} from "../controllers/favorites";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// 所有收藏操作都需要登录
router.use(authMiddleware);

// GET /api/favorites?bookIds=1,2,3  — 批量检查收藏状态
// GET /api/favorites?bookId=123     — 检查单本书是否已收藏
// GET /api/favorites?page=1         — 收藏列表
router.get("/", (req, res) => {
  if (req.query.bookIds) {
    return checkFavorites(req, res);
  }
  if (req.query.bookId) {
    return checkFavorite(req, res);
  }
  return getMyFavorites(req, res);
});

// POST /api/favorites/:bookId — 收藏一本书
router.post("/:bookId", addFavorite);

// DELETE /api/favorites/:bookId — 取消收藏
router.delete("/:bookId", removeFavorite);

export default router;
