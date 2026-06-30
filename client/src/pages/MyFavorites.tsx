import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import type { Book, Pagination as PaginationType } from "../types";
import { useToast } from "../context/ToastContext";
import api from "../lib/api";
import BookCard from "../components/BookCard";
import Pagination from "../components/Pagination";

/** 加载骨架屏 */
function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
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

export default function MyFavorites() {
  const { showToast } = useToast();
  const [books, setBooks] = useState<Book[]>([]);
  const [pagination, setPagination] = useState<PaginationType>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchFavorites = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const res = await api.get("/favorites", { params: { page } });
      setBooks(res.data.books);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error("获取收藏列表失败:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites(1);
  }, [fetchFavorites]);

  const handlePageChange = (page: number) => {
    fetchFavorites(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 取消收藏
  const handleToggleFavorite = async (bookId: number) => {
    try {
      await api.delete(`/favorites/${bookId}`);
      // 从列表中移除
      setBooks((prev) => prev.filter((b) => b.id !== bookId));
      setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
      showToast("已取消收藏", "info");
    } catch (err) {
      showToast("操作失败，请稍后再试", "error");
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">❤️ 我的心愿单</h1>
        <p className="text-gray-500 text-sm mt-1">
          共收藏了 {pagination.total} 本书
        </p>
      </div>

      {/* 内容区 */}
      {loading ? (
        <SkeletonGrid />
      ) : books.length === 0 ? (
        <div className="flex flex-col items-center py-16">
          <p className="text-6xl mb-4">💔</p>
          <p className="text-gray-500 text-lg mb-2">还没有收藏任何书籍</p>
          <p className="text-gray-400 text-sm mb-6">
            去首页逛逛，遇到感兴趣的书就收藏起来吧！
          </p>
          <Link
            to="/"
            className="px-6 py-2.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors no-underline"
          >
            去首页看看 →
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                showFavorite
                isFavorited
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}
