import multer from "multer";

// 使用内存存储（文件直接通过 Cloudinary 上传，不落盘）
const storage = multer.memoryStorage();

// 只允许上传图片
const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("只允许上传图片文件"));
  }
};

// 最多上传 5 张图片，每张不超过 5MB
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});
