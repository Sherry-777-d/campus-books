import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import type { Book } from "../types";
import { getOptimizedImage } from "../lib/image";
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
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
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
        <p className="text-slate-500 text-lg">{error || "书籍不存在"}</p>
        <Link to="/" className="mt-4 text-indigo-600 hover:underline text-sm no-underline">
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
      <Link to="/" className="text-sm text-slate-500 hover:text-indigo-600 transition-colors no-underline inline-block mb-4">
        ← 返回列表
      </Link>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        {/* 移动端：图片在上，详情在下 */}
        <div className="flex flex-col md:flex-row">
          {/* 图片区 */}
          <div className="md:w-1/2">
            <div className="aspect-square bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
              {images.length > 0 ? (
                <img
                  src={getOptimizedImage(images[currentImageIndex], 800)}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center text-slate-300">
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
              <div className="flex gap-2 p-3 overflow-x-auto border-t border-slate-100">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    className={`flex-shrink-0 w-14 h-14 rounded-md overflow-hidden border-2 cursor-pointer transition-colors ${
                      i === currentImageIndex
                        ? "border-indigo-500"
                        : "border-slate-200 hover:border-slate-400"
                    }`}
                  >
                    <img src={getOptimizedImage(img, 150)} alt={`图${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 详情区 */}
          <div className="md:w-1/2 p-6 flex flex-col">
            <div className="flex-1">
              <div className="flex items-start justify-between mb-1">
                <h1 className="text-xl font-bold text-slate-900">{book.title}</h1>
                <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ml-2 ${
                  book.status === "在售"
                    ? "bg-green-100 text-green-700"
                    : "bg-slate-100 text-slate-500"
                }`}>
                  {book.status}
                </span>
              </div>
              <p className="text-sm text-slate-500 mb-4">{book.author}</p>

              <span className={`inline-block text-xs px-2 py-0.5 rounded-full mb-3 ${
                book.category === "课外书"
                  ? "bg-orange-100 text-orange-600"
                  : "bg-blue-100 text-blue-600"
              }`}>
                {book.category || "教材"}
              </span>

              {book.courseName && (
                <p className="text-sm text-slate-500 mb-4 flex items-center gap-1">
                  📖 相关课程：{book.courseName}
                </p>
              )}

              {book.tradeLocation && (
                <p className="text-sm text-slate-500 mb-4 flex items-center gap-1">
                  📍 交易地点：{book.tradeLocation}
                </p>
              )}

              <div className="text-3xl font-bold text-rose-500 mb-4">
                ¥{book.price.toFixed(2)}
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-slate-500">成色：</span>
                <div className="flex flex-wrap gap-1.5">
                  {book.condition.split(",").filter(Boolean).map((c) => (
                    <span key={c} className="text-sm px-2.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full font-medium">
                      {CONDITION_LABELS[c] || c}
                    </span>
                  ))}
                </div>
              </div>

              {book.description && (
                <div className="mb-4">
                  <p className="text-sm text-slate-500 mb-1">📝 描述：</p>
                  <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-lg p-3">
                    {book.description}
                  </p>
                </div>
              )}
            </div>

            {/* 卖家信息 */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                    {book.seller.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{book.seller.username}</p>
                    <p className="text-xs text-slate-400">{publishDate} 发布</p>
                  </div>
                </div>
                {/* 联系卖家按钮（不给自己显示） */}
                {isLoggedIn && user?.id !== book.seller.id && (
                  <button
                    onClick={() => navigate(`/chat/${book.seller.id}`)}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-full hover:bg-indigo-700 transition-colors cursor-pointer"
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
