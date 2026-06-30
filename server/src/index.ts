import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import authRoutes from "./routes/auth";
import booksRoutes from "./routes/books";
import favoritesRoutes from "./routes/favorites";
import messagesRoutes from "./routes/messages";

const app = express();
const PORT = process.env.PORT || 3001;

// ========== 中间件 ==========
app.use(cors());                              // 允许跨域
app.use(express.json());                      // 解析 JSON 请求体

// 确保 uploads 目录存在（生产环境需要手动创建）
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("📁 已创建 uploads 目录:", uploadsDir);
}
app.use("/uploads", express.static(           // 提供上传图片的静态访问
  path.join(__dirname, "../uploads")
));

// ========== 路由 ==========
app.get("/api/health", (_req, res) => {       // 健康检查
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);             // 认证相关
app.use("/api/books", booksRoutes);           // 书籍相关
app.use("/api/favorites", favoritesRoutes);    // 收藏相关
app.use("/api/messages", messagesRoutes);    // 私信相关

// ========== 启动服务器 ==========
app.listen(PORT, () => {
  console.log(`🚀 服务器已启动: http://localhost:${PORT}`);
  console.log(`📖 API 文档:`);
  console.log(`   GET  /api/health          — 健康检查`);
  console.log(`   POST /api/auth/register    — 注册`);
  console.log(`   POST /api/auth/login       — 登录`);
  console.log(`   GET  /api/auth/me          — 当前用户`);
  console.log(`   GET  /api/books            — 书籍列表`);
  console.log(`   GET  /api/books/my         — 我的书籍`);
  console.log(`   GET  /api/books/:id        — 书籍详情`);
  console.log(`   POST /api/books            — 发布书籍`);
  console.log(`   PATCH /api/books/:id       — 更新状态`);
  console.log(`   GET  /api/favorites        — 我的收藏`);
  console.log(`   POST /api/favorites/:id    — 添加收藏`);
  console.log(`   DELETE /api/favorites/:id  — 取消收藏`);
  console.log(`   GET  /api/messages        — 对话列表`);
  console.log(`   POST /api/messages        — 发送消息`);
  console.log(`   GET  /api/messages/:id    — 聊天记录`);
});

export default app;
