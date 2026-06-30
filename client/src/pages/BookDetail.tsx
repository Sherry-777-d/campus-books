import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import type { Book } from "../types";
import { useAuth } from "../hooks/useAuth";
import api from "../lib/api";

const CONDITION_LABELS: Record<string, string> = {
  "全新": "全新",
  "几乎全新": "几乎全新",
  "有笔记": "有笔记",
  "有破损": "有破损",
};

export default function BookDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .get(`/books/${id}`)
      .then((res) => setBook(res.data.book))
      .catch(() => setError("书籍不存在或已下架"))
      .finally(() => setLoading(false));
  }, [id]);

  // 加载骨架
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="h-4 skeleton w-20 mb-4" />
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2 aspect-square skeleton" />
            <div className="md:w-1/2 p-6 space-y-3">
              <div className="h-6 skeleton w-3/4" />
              <div className="h-4 skeleton w-1/2" />
              <div className="h-8 skeleton w-24 mt-4" />
              <div className="h-4 skeleton w-full" />
              <div className="h-4 skeleton w-2/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error || !book) {
    return (
      <div className="flex flex-col items-center py-20">
        <p className="text-6xl mb-4">🔍</p>
        <p className="text-gray-500 text-lg">{error || "书籍不存在"}</p>
        <Link to="/" className="mt-4 text-blue-600 hover:underline text-sm no-underline">
          ← 返回首页
        </Link>
      </div>
    );
  }

  const images = book.images?.split(",").filter(Boolean) || [];
  const publishDate = new Date(book.createdAt).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-3xl mx-auto">
      <Link to="/" className="text-sm text-gray-500 hover:text-blue-600 transition-colors no-underline inline-block mb-4">
        ← 返回列表
      </Link>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* 移动端：图片在上，详情在下 */}
        <div className="flex flex-col md:flex-row">
          {/* 图片区 */}
          <div className="md:w-1/2">
            <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
              {images.length > 0 ? (
                <img
                  src={images[currentImageIndex]}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center text-gray-300">
                  <svg className="w-20 h-20 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span className="text-sm">暂无图片</span>
                </div>
              )}
            </div>

            {/* 缩略图 */}
            {images.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto border-t border-gray-100">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    className={`flex-shrink-0 w-14 h-14 rounded-md overflow-hidden border-2 cursor-pointer transition-colors ${
                      i === currentImageIndex
                        ? "border-blue-500"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <img src={img} alt={`图${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 详情区 */}
          <div className="md:w-1/2 p-6 flex flex-col">
            <div className="flex-1">
              <div className="flex items-start justify-between mb-1">
                <h1 className="text-xl font-bold text-gray-900">{book.title}</h1>
                <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ml-2 ${
                  book.status === "在售"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}>
                  {book.status}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-4">{book.author}</p>

              {book.courseName && (
                <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
                  📖 相关课程：{book.courseName}
                </p>
              )}

              {book.tradeLocation && (
                <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
                  📍 交易地点：{book.tradeLocation}
                </p>
              )}

              <div className="text-3xl font-bold text-red-500 mb-4">
                ¥{book.price.toFixed(2)}
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-gray-500">成色：</span>
                <span className="text-sm px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                  {CONDITION_LABELS[book.condition] || book.condition}
                </span>
              </div>

              {book.description && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">📝 描述：</p>
                  <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-3">
                    {book.description}
                  </p>
                </div>
              )}
            </div>

            {/* 卖家信息 */}
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                    {book.seller.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{book.seller.username}</p>
                    <p className="text-xs text-gray-400">{publishDate} 发布</p>
                  </div>
                </div>
                {/* 联系卖家按钮（不给自己显示） */}
                {isLoggedIn && user?.id !== book.seller.id && (
                  <button
                    onClick={() => navigate(`/chat/${book.seller.id}`)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-full hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    💬 联系卖家
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
