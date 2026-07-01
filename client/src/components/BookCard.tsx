import { Link } from "react-router-dom";
import type { Book } from "../types";

const CONDITION_COLORS: Record<string, string> = {
  "全新": "bg-emerald-100 text-emerald-700",
  "几乎全新": "bg-indigo-100 text-indigo-700",
  "有笔记": "bg-yellow-100 text-yellow-700",
  "有破损": "bg-rose-100 text-rose-700",
};

interface Props {
  book: Book;
  /** 是否显示收藏按钮（需要已登录） */
  showFavorite?: boolean;
  /** 是否已收藏 */
  isFavorited?: boolean;
  /** 点击收藏/取消收藏 */
  onToggleFavorite?: (bookId: number) => void;
}

export default function BookCard({
  book,
  showFavorite = false,
  isFavorited = false,
  onToggleFavorite,
}: Props) {
  const coverImage = book.images?.split(",").filter(Boolean)[0] || null;
  const hasImage = !!coverImage;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();   // 阻止 Link 导航
    e.stopPropagation();  // 阻止事件冒泡
    onToggleFavorite?.(book.id);
  };

  return (
    <div className="relative group/card">
      {/* 收藏按钮 */}
      {showFavorite && (
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-md backdrop-blur-sm transition-all duration-200 border-none cursor-pointer ${
            isFavorited
              ? "bg-rose-50 text-rose-500 hover:bg-rose-100"
              : "bg-white/80 text-slate-400 hover:text-rose-400 hover:bg-white"
          } ${isFavorited ? "animate-heart-pop" : ""}`}
          title={isFavorited ? "取消收藏" : "收藏"}
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill={isFavorited ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
          </svg>
        </button>
      )}

      <Link
        to={`/books/${book.id}`}
        className="block bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 no-underline"
      >
        {/* 封面图 */}
        <div className="aspect-[3/4] bg-gradient-to-br from-indigo-100 to-violet-100 overflow-hidden relative">
          {hasImage ? (
            <img
              src={coverImage}
              alt={book.title}
              className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
                (
                  e.target as HTMLImageElement
                ).nextElementSibling?.classList.remove("hidden");
              }}
            />
          ) : null}
          {/* 无图片占位 */}
          <div
            className={`w-full h-full flex flex-col items-center justify-center text-indigo-300 ${
              hasImage ? "hidden" : ""
            }`}
          >
            <svg
              className="w-12 h-12 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <span className="text-xs">暂无封面</span>
          </div>
        </div>

        {/* 信息区 */}
        <div className="p-3">
          <h3 className="text-sm font-semibold text-slate-900 truncate mb-1">
            {book.title}
          </h3>
          <p className="text-xs text-slate-500 truncate mb-2">{book.author}</p>

          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-rose-600">
              ¥{book.price.toFixed(2)}
            </span>
          </div>
          {/* 成色标签 */}
          {(() => {
            const condList = book.condition.split(",").filter(Boolean);
            return (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {condList.map((c) => (
                  <span
                    key={c}
                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                      CONDITION_COLORS[c] || "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {c}
                  </span>
                ))}
              </div>
            );
          })()}

          {book.courseName && (
            <p className="text-xs text-slate-400 mt-2 truncate">
              📖 {book.courseName}
            </p>
          )}
        </div>
      </Link>
    </div>
  );
}
