import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Book } from "../types";
import { useToast } from "../context/ToastContext";
import api from "../lib/api";

/** 确认对话框组件 */
function ConfirmModal({
  title,
  message,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl p-6 mx-4 max-w-sm w-full">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer"
          >
            确认下架
          </button>
        </div>
      </div>
    </div>
  );
}

/** 加载骨架屏 */
function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="aspect-[3/4] skeleton" />
          <div className="p-3 space-y-2">
            <div className="h-4 skeleton w-3/4" />
            <div className="h-3 skeleton w-1/2" />
            <div className="flex justify-between items-center mt-2">
              <div className="h-5 skeleton w-16" />
              <div className="h-5 skeleton w-12 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MyBooks() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  // 确认对话框状态（弹出时记录要删除的书的 ID）
  const [confirmBookId, setConfirmBookId] = useState<number | null>(null);

  const fetchMyBooks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/books/my");
      setBooks(res.data.books);
    } catch (err) {
      console.error("获取我的书籍失败:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyBooks();
  }, [fetchMyBooks]);

  const handleDelete = async () => {
    if (confirmBookId === null) return;

    try {
      await api.delete(`/books/${confirmBookId}`);
      setBooks((prev) => prev.filter((b) => b.id !== confirmBookId));
      showToast("书籍已下架", "info");
    } catch (err) {
      showToast("下架失败，请稍后再试", "error");
    } finally {
      setConfirmBookId(null);
    }
  };

  const bookToDelete = books.find((b) => b.id === confirmBookId);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📦 我发布的书籍</h1>
          <p className="text-gray-500 text-sm mt-1">
            共发布了 {books.length} 本书
          </p>
        </div>
        <Link
          to="/publish"
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors no-underline"
        >
          + 发布新书
        </Link>
      </div>

      {/* 内容区 */}
      {loading ? (
        <SkeletonGrid />
      ) : books.length === 0 ? (
        <div className="flex flex-col items-center py-16">
          <p className="text-6xl mb-4">📭</p>
          <p className="text-gray-500 text-lg mb-2">还没有发布过书籍</p>
          <p className="text-gray-400 text-sm mb-6">
            有闲置的二手书吗？快来发布吧！
          </p>
          <Link
            to="/publish"
            className="px-6 py-2.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors no-underline"
          >
            发布第一本书 →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {books.map((book) => (
            <div
              key={book.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center gap-4 p-4">
                {/* 缩略图 */}
                <Link
                  to={`/books/${book.id}`}
                  className="flex-shrink-0 w-16 h-20 bg-gray-100 rounded overflow-hidden no-underline"
                >
                  {(() => {
                    const cover = book.images?.split(",").filter(Boolean)[0];
                    return cover ? (
                      <img src={cover} alt={book.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                    );
                  })()}
                </Link>

                {/* 信息 */}
                <Link
                  to={`/books/${book.id}`}
                  className="flex-1 min-w-0 no-underline"
                >
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {book.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">{book.author}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-base font-bold text-red-500">
                      ¥{book.price.toFixed(2)}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        book.status === "在售"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {book.status}
                    </span>
                  </div>
                </Link>

                {/* 操作按钮 */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => navigate(`/books/${book.id}`)}
                    className="px-3 py-1.5 text-xs border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    查看
                  </button>
                  <button
                    onClick={() => navigate(`/books/${book.id}/edit`)}
                    className="px-3 py-1.5 text-xs border border-blue-200 text-blue-600 rounded-md hover:bg-blue-50 transition-colors cursor-pointer"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => setConfirmBookId(book.id)}
                    className="px-3 py-1.5 text-xs border border-red-200 text-red-500 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    下架
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 确认对话框 */}
      {confirmBookId !== null && (
        <ConfirmModal
          title="确认下架"
          message={`确定要下架「${bookToDelete?.title || "这本书"}」吗？下架后不可恢复。`}
          onConfirm={handleDelete}
          onCancel={() => setConfirmBookId(null)}
        />
      )}
    </div>
  );
}
