import { Link } from "react-router-dom";
import type { Book } from "../types";

const CONDITION_COLORS: Record<string, string> = {
  "全新": "bg-green-100 text-green-700",
  "几乎全新": "bg-blue-100 text-blue-700",
  "有笔记": "bg-yellow-100 text-yellow-700",
  "有破损": "bg-red-100 text-red-700",
};

interface Props {
  book: Book;
}

export default function BookCard({ book }: Props) {
  const coverImage = book.images?.split(",").filter(Boolean)[0] || null;
  const hasImage = !!coverImage;

  return (
    <Link
      to={`/books/${book.id}`}
      className="block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 no-underline group"
    >
      {/* 封面图 */}
      <div className="aspect-[3/4] bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden relative">
        {hasImage ? (
          <img
            src={coverImage}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
            }}
          />
        ) : null}
        {/* 无图片占位 */}
        <div className={`w-full h-full flex flex-col items-center justify-center text-gray-300 ${hasImage ? "hidden" : ""}`}>
          <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span className="text-xs">暂无封面</span>
        </div>
      </div>

      {/* 信息区 */}
      <div className="p-3">
        <h3 className="text-sm font-medium text-gray-900 truncate mb-1">
          {book.title}
        </h3>
        <p className="text-xs text-gray-500 truncate mb-2">{book.author}</p>

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-red-500">
            ¥{book.price.toFixed(2)}
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${CONDITION_COLORS[book.condition] || "bg-gray-100 text-gray-600"}`}
          >
            {book.condition}
          </span>
        </div>

        {book.courseName && (
          <p className="text-xs text-gray-400 mt-2 truncate">
            📖 {book.courseName}
          </p>
        )}
      </div>
    </Link>
  );
}
