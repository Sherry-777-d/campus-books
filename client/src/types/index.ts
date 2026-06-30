/** 用户信息 */
export interface User {
  id: number;
  username: string;
  email: string;
  avatar: string | null;
  createdAt: string;
}

/** 书籍信息 */
export interface Book {
  id: number;
  title: string;
  author: string;
  price: number;
  condition: string;
  courseName: string | null;
  images: string;
  description: string | null;
  tradeLocation: string | null;
  status: "在售" | "已售";
  createdAt: string;
  seller: Pick<User, "id" | "username" | "avatar">;
}

/** 分页信息 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** 消息 */
export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  bookId: number | null;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender: Pick<User, "id" | "username" | "avatar">;
}

/** 对话（和某个人的聊天概要） */
export interface Conversation {
  otherUser: Pick<User, "id" | "username" | "avatar">;
  lastMessage: {
    id: number;
    content: string;
    isRead: boolean;
    createdAt: string;
    senderId: number;
    bookId: number | null;
  };
}

/** API 通用响应格式 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface ApiResponse<T = unknown> {
  message?: string;
  data?: T;
}
