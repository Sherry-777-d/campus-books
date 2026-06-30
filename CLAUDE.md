# 校园二手书交易平台 — Campus Books

## 项目背景
- 为大一下学期实习/就业准备的全栈项目
- 目标是做一个「有用户、能上线」的真实 Web 应用，而非玩具项目

## 功能规划

### MVP（最先做）
1. 用户注册和登录
2. 浏览所有二手书（分页）
3. 按书名/课程名搜索
4. 发布二手书信息（书名、价格、成色、图片、描述）
5. 查看书籍详情

### 后续迭代
6. 收藏/心愿单
7. 站内私信
8. 按学院/专业分类
9. 书籍评价和打分

## 技术栈

| 层 | 技术 |
|----|------|
| 前端 | React + TypeScript + Vite |
| 样式 | Tailwind CSS |
| 后端 | Node.js + Express + TypeScript |
| 数据库 | SQLite（开发）→ PostgreSQL（上线） |
| ORM | Prisma |
| 部署 | Vercel（前端）+ Railway（后端） |

## 项目结构

```
campus-books/
├── client/                  # 前端 React 项目
│   ├── src/
│   │   ├── components/      # 可复用的 UI 组件
│   │   ├── pages/           # 页面
│   │   ├── hooks/           # 自定义 Hook
│   │   └── App.tsx
│   └── package.json
├── server/                  # 后端 Express 项目
│   ├── src/
│   │   ├── routes/          # API 路由
│   │   ├── controllers/     # 请求处理逻辑
│   │   ├── middleware/       # 中间件
│   │   └── index.ts
│   ├── prisma/
│   │   └── schema.prisma    # 数据库表结构
│   └── package.json
└── README.md
```

## 数据库设计

### User 表
- id, username, email, password, avatar, createdAt

### Book 表
- id, title, author, sellerId(关联User), price, condition, courseName, images, description, status(在售/已售), createdAt

## 开发路线图

| 步骤 | 内容 |
|------|------|
| 1 | 搭建项目脚手架（前端 + 后端初始化） |
| 2 | 设计数据库 + Prisma 配置 |
| 3 | 用户注册/登录 API |
| 4 | 书籍 CRUD API |
| 5 | 前端首页（书籍列表 + 搜索） |
| 6 | 前端发布页 + 详情页 |
| 7 | 前后端对接 + 联调 |
| 8 | 部署上线 |

## 关键原则
- 一个高质量项目 >> 五个半成品
- 先做最简版本（MVP），再迭代
- 代码在 GitHub 上公开 + README 写清楚

## 关于开发者
- 大一学生，Mac + VS Code + DeepSeek 后端
- 正在学习 Claude Code，边学边做项目
- 喜欢详细、耐心的解释
- 不主动提交 git，需要确认后再操作

---

## 开发日志

### 2026-06-29 — 步骤 1：搭建项目脚手架

#### 1.1 后端初始化

**已创建：** `server/` 目录，`npm init -y` 完成

**已安装运行时依赖：**
| 包名 | 用途 |
|------|------|
| express | Web 框架，处理 HTTP 请求 |
| cors | 允许前端跨域请求后端 API |
| dotenv | 读取 .env 环境变量文件 |
| @prisma/client | Prisma 数据库查询客户端 |
| bcryptjs | 对用户密码进行哈希加密 |
| jsonwebtoken | 生成和验证 JWT 登录令牌 |
| multer | 处理文件上传（书籍图片） |

**已安装开发依赖：**
| 包名 | 用途 |
|------|------|
| typescript | TypeScript 编译器，把 .ts 编译成 .js |
| ts-node | 直接运行 .ts 文件，不用手动编译 |
| nodemon | 监听文件改动，自动重启服务器 |
| @types/express | Express 的类型定义（编辑器智能提示） |
| @types/cors | cors 的类型定义 |
| @types/bcryptjs | bcryptjs 的类型定义 |
| @types/jsonwebtoken | jsonwebtoken 的类型定义 |
| @types/multer | multer 的类型定义 |
| @types/node | Node.js 内置模块的类型定义 |

#### 1.2 Prisma + SQLite 初始化 ✅

**已创建数据库：**
- `server/dev.db` — SQLite 数据库文件
- `server/prisma/schema.prisma` — 数据库模型定义
- `server/prisma/migrations/` — 数据库迁移记录

**数据库模型：**

**User 表**
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int (自增) | 主键 |
| username | String (唯一) | 用户名 |
| email | String (唯一) | 邮箱 |
| password | String | 哈希密码 |
| avatar | String? | 头像URL（可选） |
| createdAt | DateTime | 注册时间 |

**Book 表**
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int (自增) | 主键 |
| title | String | 书名 |
| author | String | 作者 |
| price | Float | 价格 |
| condition | String | 成色 |
| courseName | String? | 课程名（可选） |
| images | String | 图片路径 |
| description | String? | 描述（可选） |
| status | String (默认"在售") | 在售/已售 |
| sellerId | Int (外键) | 关联用户 |
| createdAt | DateTime | 发布时间 |

**待做：**
- [x] 配置 tsconfig.json
- [x] 配置 nodemon.json
- [x] 初始化 Prisma + SQLite
- [x] 编写后端代码

#### 1.3 后端代码 ✅

**目录结构：**
```
server/src/
├── index.ts              # 服务器入口（端口 3001）
├── lib/prisma.ts         # Prisma 客户端单例
├── utils/jwt.ts          # JWT 生成/验证
├── middleware/
│   ├── auth.ts           # 认证中间件（保护需要登录的接口）
│   └── upload.ts         # multer 图片上传
├── routes/
│   ├── auth.ts           # 认证路由
│   └── books.ts          # 书籍路由
└── controllers/
    ├── auth.ts           # 注册/登录/获取用户
    └── books.ts          # 书籍 CRUD
```

**API 接口清单：**
| 方法 | 路径 | 说明 | 需要登录 |
|------|------|------|----------|
| GET | /api/health | 健康检查 | 否 |
| POST | /api/auth/register | 注册 | 否 |
| POST | /api/auth/login | 登录 | 否 |
| GET | /api/auth/me | 获取当前用户 | 是 |
| GET | /api/books | 书籍列表（分页+搜索） | 否 |
| GET | /api/books/my | 我的书籍 | 是 |
| GET | /api/books/:id | 书籍详情 | 否 |
| POST | /api/books | 发布书籍 | 是 |
| PATCH | /api/books/:id | 更新状态 | 是 |

**已验证：**
- 服务器正常启动在 http://localhost:3001
- 健康检查 `/api/health` 返回 OK
- 注册接口成功返回 token
- 书籍列表返回空数组 `[]`

**注意：** Prisma 使用了 v5.22.0（降级），因为 v7 需要额外的数据库适配器，不适合学习项目。

---

### 2. 前端初始化 ✅

#### 2.1 项目创建
- `npm create vite@latest client -- --template react-ts`

#### 2.2 已安装依赖
| 包名 | 用途 |
|------|------|
| react-router-dom@7 | 前端路由（URL ↔ 页面映射） |
| axios | HTTP 请求库 |
| @tailwindcss/vite | Tailwind CSS v4 Vite 插件 |
| tailwindcss | Tailwind CSS 框架 |

#### 2.3 前端目录结构
```
client/src/
├── App.tsx                  # 路由配置（6 个路由）
├── main.tsx                 # 入口
├── index.css                # Tailwind + 全局样式
├── types/index.ts           # 共享 TypeScript 类型
├── lib/api.ts               # axios 实例（自动带 token）
├── hooks/useAuth.ts         # 认证 Hook（登录/注册/退出）
├── components/
│   ├── Navbar.tsx           # 顶部导航栏
│   ├── Layout.tsx           # 页面布局壳
│   ├── BookCard.tsx         # 书籍卡片
│   ├── SearchBar.tsx        # 搜索栏
│   ├── Pagination.tsx       # 分页组件
│   └── ProtectedRoute.tsx   # 需要登录的路由保护
└── pages/
    ├── Home.tsx             # 首页（书籍列表+搜索+分页）
    ├── Login.tsx            # 登录页
    ├── Register.tsx         # 注册页
    ├── BookDetail.tsx       # 书籍详情页
    ├── PublishBook.tsx      # 发布书籍页
    └── NotFound.tsx         # 404 页面
```

#### 2.4 Vite 配置
- **代理配置**: `/api` → `http://localhost:3001`（开发时前后端联通）
- **Tailwind 插件**: `@tailwindcss/vite`

#### 2.5 路由设计
| 路径 | 页面 | 需要登录 |
|------|------|----------|
| `/` | 首页（书籍列表） | 否 |
| `/login` | 登录 | 否 |
| `/register` | 注册 | 否 |
| `/books/:id` | 书籍详情 | 否 |
| `/publish` | 发布书籍 | 是 🔒 |
| `*` | 404 | 否 |

---

### 步骤 1 总结 ✅

**项目脚手架搭建完成！**

```
campus-books/
├── server/                  # 后端 — Express + Prisma + SQLite
│   ├── src/                 # 源码（9 个 API）
│   ├── prisma/              # 数据库模型 + 迁移
│   └── dev.db               # SQLite 数据库文件
├── client/                  # 前端 — React + Vite + Tailwind
│   └── src/                 # 源码（5 组件 + 6 页面）
└── CLAUDE.md                # 项目文档 + 开发日志
```

**启动方式：**
```bash
# 终端 1：启动后端
cd server && npm run dev    # → http://localhost:3001

# 终端 2：启动前端
cd client && npm run dev    # → http://localhost:5173
```

---

### UI/UX 打磨 (2026-06-30) ✅

#### 全局改进
- 浏览器标签页标题改为「Campus Books - 校园二手书」
- favicon 改为 📚 emoji
- 加载状态优化：骨架屏（skeleton shimmer）+ spinner 动画
- 添加 Toast 全局通知系统（成功/失败/提示）

#### 状态管理修复
- 用 AuthContext 解决「登录后需要刷新页面才能看到效果」的 bug
- 所有组件共享同一份认证状态，一处修改处处同步

#### 组件改进
- **Navbar**: 移动端汉堡菜单（☰）+ 桌面端完整导航
- **Home**: Hero 标题区 + 空状态引导按钮 + 加载骨架
- **BookCard**: 悬停上浮效果 + 图片缩放 + 优化无图占位（书本图标）
- **PublishBook**: 字段级验证（红框提示）+ 图片上传虚线区域 + 预览可删除
- **BookDetail**: 响应式布局（手机上下、桌面左右）+ 卖家信息卡片
- **Login/Register**: 按钮 loading spinner + Toast 成功提示

#### 新建文件
- `client/src/context/AuthContext.tsx` — 全局认证状态
- `client/src/context/ToastContext.tsx` — 全局 Toast 状态
- `client/src/components/Toast.tsx` — Toast 组件
- `client/src/components/ProtectedRoute.tsx` — 登录保护路由

---

### 部署上线 (2026-06-30) ⏸️ 暂缓

#### 已完成
- 代码推送到 GitHub：`https://github.com/Sherry-777-d/campus-books`
- 前端部署到 Vercel：`https://campus-books-beryl.vercel.app`（空白页，因为后端未部署）
- 后端代码已切换 PostgreSQL（`server/prisma/schema.prisma`）

#### 遇到的问题
- Railway 网页从国内加载很慢，无法操作
- Railway CLI 安装时下载 GitHub 文件超时（ETIMEDOUT）
- 根本原因：网络访问国外服务不稳定

#### 后续部署计划
- 等网络好转时，用 Railway 或 Render 部署后端
- 或者不依赖 Railway，直接在 Vercel 上用 serverless 函数
- 部署后需修改前端 API 地址指向后端

---

### 功能 6：收藏/心愿单 (2026-06-30) ✅

#### 数据库
新增 **Favorite 表**：
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int (自增) | 主键 |
| userId | Int | 收藏者 ID（外键 → User） |
| bookId | Int | 书籍 ID（外键 → Book） |
| createdAt | DateTime | 收藏时间 |

- `@@unique([userId, bookId])` — 同一用户不能重复收藏同一本书
- `onDelete: Cascade` — 删除用户或书籍时自动删除收藏记录

#### 后端新增 API
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/favorites | 我的收藏列表（分页） |
| GET | /api/favorites?bookIds=1,2,3 | 批量检查收藏状态 |
| GET | /api/favorites?bookId=123 | 检查单本书是否已收藏 |
| POST | /api/favorites/:bookId | 收藏一本书 |
| DELETE | /api/favorites/:bookId | 取消收藏 |

#### 前端改动
- **BookCard**: 右上角加 ❤️ 收藏按钮（空心=未收藏，实心=已收藏），点击不跳转详情页
- **Navbar**: 导航栏加「❤️ 心愿单」入口（桌面端 + 移动端）
- **MyFavorites 页面（新建）**: 展示收藏列表，支持分页和取消收藏
- **App.tsx**: 新增 `/favorites` 路由（ProtectedRoute 保护）
- **Home 页面**: 加载书籍后批量查询收藏状态

#### 新建文件
- `server/src/controllers/favorites.ts` — 收藏控制器
- `server/src/routes/favorites.ts` — 收藏路由
- `client/src/pages/MyFavorites.tsx` — 心愿单页面

#### 修改文件
- `server/prisma/schema.prisma` — 新增 Favorite 模型
- `server/src/index.ts` — 注册收藏路由
- `client/src/App.tsx` — 新增 /favorites 路由
- `client/src/components/BookCard.tsx` — 新增收藏按钮
- `client/src/components/Navbar.tsx` — 新增心愿单入口
- `client/src/pages/Home.tsx` — 批量查询收藏状态

---

### 交易地点功能 (2026-06-30) ✅

#### 改动
- **数据库**：Book 表新增 `tradeLocation` 字段（可选）
- **后端**：createBook 接口接受并存储 `tradeLocation`
- **发布页面**：新增「交易地点」输入框（选填），自由输入文本
- **详情页面**：如果有交易地点，显示「📍 交易地点：xxx」

#### 修改文件
- `server/prisma/schema.prisma` — Book 表新增 tradeLocation
- `server/src/controllers/books.ts` — createBook 接受 tradeLocation
- `client/src/types/index.ts` — Book 类型新增 tradeLocation
- `client/src/pages/PublishBook.tsx` — 新增交易地点输入框
- `client/src/pages/BookDetail.tsx` — 显示交易地点

---

### 「我发布的书籍」功能 (2026-06-30) ✅

#### 后端
- 新增 `DELETE /api/books/:id` 接口（只能删除自己发布的书籍，级联删除关联的收藏记录）
- 已有 `GET /api/books/my` 接口返回当前用户的书籍列表

#### 前端
- **MyBooks 页面（新建）**：列表展示我发布的书，支持「查看详情」和「下架」
- 下架前弹出确认对话框，防止误删
- **Navbar**：桌面端 + 移动端新增「📦 我的发布」导航
- **App.tsx**：新增 `/my-books` 路由（ProtectedRoute 保护）

#### 新建文件
- `client/src/pages/MyBooks.tsx`

#### 修改文件
- `server/src/controllers/books.ts` — 新增 deleteBook 函数
- `server/src/routes/books.ts` — 注册 DELETE 路由
- `client/src/App.tsx` — 新增 /my-books 路由
- `client/src/components/Navbar.tsx` — 新增我的发布入口

---

### 编辑书籍功能 (2026-06-30) ✅

#### 后端
- 新增 `PUT /api/books/:id` 接口（只能编辑自己发布的书籍）
- 支持修改所有字段：书名、作者、价格、成色、课程、地点、描述
- 图片处理：支持保留已有图片 + 上传新图片，自动合并

#### 前端
- **PublishBook 改造**：同一组件支持发布模式和编辑模式
  - URL `/publish` → 发布新书
  - URL `/books/:id/edit` → 编辑已有书籍
  - 编辑模式下自动加载原数据，表单已填好
  - 已有图片可逐张删除，新图片可追加
- **MyBooks**：每本书新增蓝色「编辑」按钮
- **App.tsx**：新增 `/books/:id/edit` 路由

#### 修改文件
- `server/src/controllers/books.ts` — 新增 updateBook 函数
- `server/src/routes/books.ts` — 注册 PUT 路由
- `client/src/pages/PublishBook.tsx` — 改造支持编辑模式
- `client/src/pages/MyBooks.tsx` — 新增编辑按钮
- `client/src/App.tsx` — 新增编辑路由

---

---

### 按课程分类 (2026-06-30) ✅

#### 设计
- 使用已有的 `courseName` 字段，不加新字段
- 预设 9 个常见课程 + 「其他」（手动输入）
- 课程列表：高等数学、大学物理、线性代数、概率论、计算机、数据结构、大学英语、马克思主义原理、模拟电子技术

#### 前端改动
- **发布/编辑页面**：课程改为下拉选择框，选「其他」时出现手动输入框
- **首页**：搜索栏下方增加课程分类标签，点击即可筛选，再次点击或点「清除筛选」取消
- 标签有高亮状态（蓝底白字=已选中）

#### 修改文件
- `client/src/pages/PublishBook.tsx` — 课程下拉框 + 自定义输入
- `client/src/pages/Home.tsx` — 课程分类标签

---

---

### 站内私信 (2026-06-30) ✅

#### 数据库
新增 **Message 表**：
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int (自增) | 主键 |
| senderId | Int | 发送者 ID |
| receiverId | Int | 接收者 ID |
| bookId | Int? | 关联书籍（可选） |
| content | String | 消息内容 |
| isRead | Boolean | 是否已读（默认 false） |
| createdAt | DateTime | 发送时间 |

#### 后端新增 API
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/messages | 对话列表（按人分组，显示最后一条） |
| GET | /api/messages/unread-count | 未读消息数量 |
| GET | /api/messages/:userId | 和某人的聊天记录（自动标记已读） |
| POST | /api/messages | 发送消息 |

#### 前端改动
- **Messages 页面（新建）**：对话列表，类似微信聊天列表，显示最后一条消息预览和时间
- **Chat 页面（新建）**：聊天界面，右侧蓝色=自己的消息，左侧灰色=对方的消息，底部输入框+发送按钮
- **Navbar**：新增「💬 消息」入口（桌面+移动），带红色未读数角标，每 30 秒自动更新
- **BookDetail**：新增「💬 联系卖家」按钮（自己不能联系自己）
- **App.tsx**：新增 `/messages` 和 `/chat/:userId` 路由

#### 新建文件
- `server/src/controllers/messages.ts`
- `server/src/routes/messages.ts`
- `client/src/pages/Messages.tsx`
- `client/src/pages/Chat.tsx`

#### 修改文件
- `server/prisma/schema.prisma` — 新增 Message 模型
- `server/src/index.ts` — 注册消息路由
- `client/src/App.tsx` — 新增消息路由
- `client/src/components/Navbar.tsx` — 新增消息入口+未读角标
- `client/src/pages/BookDetail.tsx` — 新增联系卖家按钮
- `client/src/types/index.ts` — 新增 Message、Conversation 类型

---

## 后续功能

| 序号 | 功能 | 说明 |
|------|------|------|
| 8 | 书籍评价和打分 | 购买后可评价和打分 |
