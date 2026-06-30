import { PrismaClient } from "@prisma/client";

// 全局单例：整个应用共用一个 Prisma 连接
const prisma = new PrismaClient();

export default prisma;
