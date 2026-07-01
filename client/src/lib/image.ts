/**
 * 将相对路径转为完整 URL（兼容本地 /uploads/ 和 Cloudinary）
 */
export function getImageUrl(path: string): string {
  if (!path || path.startsWith("http")) return path;
  const apiBase = import.meta.env.VITE_API_URL || "";
  if (apiBase) {
    const origin = apiBase.replace(/\/api\/?$/, "");
    return origin + path;
  }
  return path;
}

/**
 * 为 Cloudinary 图片添加压缩/裁剪参数
 * @param url 原始图片 URL
 * @param width 宽度（px）
 * @param height 高度（px），默认根据宽度等比缩放
 * @returns 优化后的 URL
 */
export function getOptimizedImage(
  url: string,
  width: number,
  height?: number
): string {
  if (!url) return url;
  // 只处理 Cloudinary URL
  if (!url.includes("res.cloudinary.com")) return url;

  const parts = url.split("/upload/");
  if (parts.length !== 2) return url;

  const params = height
    ? `w_${width},h_${height},c_fill,q_auto`
    : `w_${width},q_auto`;

  return `${parts[0]}/upload/${params}/${parts[1]}`;
}
