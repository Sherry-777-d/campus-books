import { v2 as cloudinary } from "cloudinary";
import type { UploadApiResponse } from "cloudinary";

// 配置 Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * 上传图片到 Cloudinary
 * @param file multer 文件（需使用 memoryStorage）
 * @param folder 存放文件夹，如 "books" 或 "messages"
 * @returns Cloudinary 安全 URL
 */
export async function uploadToCloudinary(
  file: Express.Multer.File,
  folder: "books" | "messages"
): Promise<string> {
  return new Promise((resolve, reject) => {
    // 将 buffer 转为 base64 data URI
    const b64 = file.buffer.toString("base64");
    const dataURI = `data:${file.mimetype};base64,${b64}`;

    cloudinary.uploader.upload(
      dataURI,
      {
        folder,
        resource_type: "image",
      },
      (error, result: UploadApiResponse | undefined) => {
        if (error || !result) {
          console.error("Cloudinary 上传失败:", error);
          reject(error || new Error("上传失败"));
          return;
        }
        resolve(result.secure_url);
      }
    );
  });
}
