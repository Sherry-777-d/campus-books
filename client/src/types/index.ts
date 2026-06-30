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

/** API 通用响应格式 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface ApiResponse<T = unknown> {
  message?: string;
  data?: T;
}
