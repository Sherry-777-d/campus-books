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

**待做（部署上线）**
