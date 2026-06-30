import { Router } from "express";
import {
  getConversations,
  getChatHistory,
  sendMessage,
  getUnreadCount,
} from "../controllers/messages";
import { authMiddleware } from "../middleware/auth";
import { upload } from "../middleware/upload";

const router = Router();

// 所有私信操作都需要登录
router.use(authMiddleware);

// GET /api/messages/unread-count — 未读消息数量（必须放在 /:userId 前面）
router.get("/unread-count", getUnreadCount);

// GET /api/messages — 对话列表
router.get("/", getConversations);

// GET /api/messages/:userId — 和某人的聊天记录
router.get("/:userId", getChatHistory);

// POST /api/messages — 发送消息（支持可选图片上传）
router.post("/", upload.single("image"), sendMessage);

export default router;
