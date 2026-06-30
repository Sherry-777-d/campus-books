# 📚 Campus Books — 校园二手书交易平台

一个为大学生打造的二手教材交易平台。发布、搜索、收藏你需要的书籍，站内私信联系卖家，轻松完成校内二手书交易。

**🌐 在线访问：[campus-books-app.vercel.app](https://campus-books-app.vercel.app)**

## ✨ 功能

### 已实现

- 🔐 **用户系统** — 注册、登录、JWT 认证
- 📖 **书籍发布** — 上传书名、价格、成色、课程、图片（最多 5 张）
- 🔍 **搜索筛选** — 按书名/作者/课程搜索，课程分类标签快速筛选
- 📄 **书籍详情** — 图片轮播、卖家信息、交易地点
- ✏️ **编辑书籍** — 修改已发布书籍的全部信息
- ❤️ **心愿单** — 收藏感兴趣的书籍，统一管理
- 📦 **我的发布** — 查看、编辑、下架自己的书籍
- 📍 **交易地点** — 自由填写交易地点
- 💬 **站内私信** — 买卖双方实时聊天，未读消息红色角标提醒
- 📱 **响应式设计** — 手机端、桌面端完美适配
- 🎨 **现代 UI** — 骨架屏加载、Toast 通知、悬停动效

### 规划中

- ⭐ 书籍评价和打分
- 🏷️ 更完善的专业/学院分类

## 🛠 技术栈

| 层 | 技术 |
|----|------|
| 前端 | React 19 + TypeScript + Vite |
| 样式 | Tailwind CSS 4 |
| 路由 | React Router v7 |
| HTTP | Axios |
| 后端 | Express 5 + TypeScript |
| ORM | Prisma 5 |
| 数据库 | SQLite（本地）→ PostgreSQL（生产环境） |
| 认证 | JWT + bcryptjs |
| 文件上传 | Multer |
| 部署 | Vercel（前端）+ Render（后端 + 数据库） |

## 📁 项目结构

```bash
campus-books/
├── client/                     # React 前端
│   └── src/
│       ├── components/         # Navbar, BookCard, SearchBar 等
│       ├── pages/              # Home, BookDetail, Chat 等 10 个页面
│       ├── hooks/              # useAuth 认证 Hook
│       ├── context/            # AuthContext, ToastContext
│       ├── lib/                # axios 实例 + 拦截器
│       └── types/              # TypeScript 类型定义
├── server/                     # Express 后端
│   └── src/
│       ├── controllers/        # auth, books, favorites, messages
│       ├── routes/             # API 路由定义
│       ├── middleware/         # auth（JWT 验证）, upload（图片上传）
│       ├── lib/                # Prisma 客户端单例
│       └── utils/              # JWT 工具函数
│   └── prisma/
│       ├── schema.prisma       # 数据库模型（User, Book, Favorite, Message）
│       └── migrations/         # 数据库迁移记录
└── render.yaml                 # Render 部署配置
```

## 🚀 本地运行

### 前提条件

- Node.js >= 18
- npm >= 9

### 启动步骤

```bash
# 1. 克隆项目
git clone https://github.com/Sherry-777-d/campus-books.git
cd campus-books

# 2. 启动后端
cd server
npm install
cp .env.example .env          # 编辑 .env 文件，配置 DATABASE_URL
npx prisma migrate dev        # 初始化数据库表
npm run dev                   # → http://localhost:3001

# 3. 启动前端（新终端）
cd client
npm install
npm run dev                   # → http://localhost:5173
```

## 📡 API 接口

### 认证

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/auth/register` | 注册 | ❌ |
| POST | `/api/auth/login` | 登录 | ❌ |
| GET | `/api/auth/me` | 当前用户信息 | ✅ |

### 书籍

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/books` | 书籍列表（分页 + 搜索） | ❌ |
| GET | `/api/books/my` | 我发布的书籍 | ✅ |
| GET | `/api/books/:id` | 书籍详情 | ❌ |
| POST | `/api/books` | 发布书籍 | ✅ |
| PUT | `/api/books/:id` | 编辑书籍 | ✅ |
| DELETE | `/api/books/:id` | 下架书籍 | ✅ |

### 收藏

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/favorites` | 我的收藏 | ✅ |
| POST | `/api/favorites/:bookId` | 收藏 | ✅ |
| DELETE | `/api/favorites/:bookId` | 取消收藏 | ✅ |

### 私信

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/messages` | 对话列表 | ✅ |
| GET | `/api/messages/unread-count` | 未读数 | ✅ |
| GET | `/api/messages/:userId` | 聊天记录 | ✅ |
| POST | `/api/messages` | 发送消息 | ✅ |

## 🗄 数据库设计

### User（用户）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int | 主键 |
| username | String | 用户名（唯一） |
| email | String | 邮箱（唯一） |
| password | String | bcrypt 哈希 |
| avatar | String? | 头像 URL |

### Book（书籍）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int | 主键 |
| title | String | 书名 |
| author | String | 作者 |
| price | Float | 价格 |
| condition | String | 成色 |
| courseName | String? | 关联课程 |
| tradeLocation | String? | 交易地点 |
| images | String | 图片路径（逗号分隔） |
| description | String? | 描述 |
| status | String | 在售 / 已售 |
| sellerId | Int | 卖家 ID（外键 → User） |

### Favorite（收藏）
| 字段 | 类型 | 说明 |
|------|------|------|
| userId | Int | 用户 ID |
| bookId | Int | 书籍 ID |
| \_\_unique\_\_ | | (userId, bookId) 联合唯一 |

### Message（私信）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int | 主键 |
| senderId | Int | 发送者 ID |
| receiverId | Int | 接收者 ID |
| bookId | Int? | 关联书籍 |
| content | String | 消息内容 |
| isRead | Boolean | 是否已读 |

## 🏗 部署架构

```
用户浏览器
    ↓
Vercel（前端 React SPA）
    ↓ /api 请求
Render（后端 Express API）
    ↓
Render PostgreSQL（数据库）
```

## 👨‍💻 关于

本项目是大一下学期为实习/就业准备的全栈项目。目标是做一个有真实用户、能上线的 Web 应用，而非玩具项目。

**开发原则**：一个高质量项目 >> 五个半成品

**开发者**：Sherry-777-d

---

*如果你觉得这个项目有帮助，欢迎 ⭐ Star！*
