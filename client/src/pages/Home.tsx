import { useEffect, useState, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import type { Book, Pagination as PaginationType } from "../types";
import { useAuth } from "../hooks/useAuth";
import api from "../lib/api";
import BookCard from "../components/BookCard";
import SearchBar from "../components/SearchBar";
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

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isLoggedIn } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [pagination, setPagination] = useState<PaginationType>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);

  const currentPage = parseInt(searchParams.get("page") || "1");
  const currentSearch = searchParams.get("search") || "";

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/books", {
        params: { page: currentPage, search: currentSearch },
      });
      setBooks(res.data.books);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error("获取书籍列表失败:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, currentSearch]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleSearch = (keyword: string) => {
    setSearchParams(keyword ? { search: keyword, page: "1" } : {});
  };

  const handlePageChange = (page: number) => {
    const params: Record<string, string> = { page: String(page) };
    if (currentSearch) params.search = currentSearch;
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div>
      {/* Hero 区域：只在首页无搜索时显示 */}
      {!currentSearch && (
        <div className="text-center mb-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📚 校园二手书交易平台
          </h1>
          <p className="text-gray-500 text-sm">
            买到便宜好书，卖掉闲置教材
          </p>
        </div>
      )}

      {/* 搜索栏 */}
      <div className="mb-6">
        <SearchBar onSearch={handleSearch} initialValue={currentSearch} />
        {currentSearch && (
          <p className="text-sm text-gray-500 mt-2">
            搜索 "{currentSearch}" 结果：共 {pagination.total} 本
          </p>
        )}
      </div>

      {/* 内容区 */}
      {loading ? (
        <SkeletonGrid />
      ) : books.length === 0 ? (
        <div className="flex flex-col items-center py-16">
          <p className="text-6xl mb-4">📭</p>
          <p className="text-gray-500 text-lg mb-2">
            {currentSearch ? "没有找到相关书籍" : "还没有人发布书籍"}
          </p>
          <p className="text-gray-400 text-sm mb-6">
            {currentSearch ? "试试其他关键词吧" : "成为第一个卖书的人！"}
          </p>
          {!currentSearch && (
            isLoggedIn ? (
              <Link
                to="/publish"
                className="px-6 py-2.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors no-underline"
              >
                发布第一本书 →
              </Link>
            ) : (
              <Link
                to="/register"
                className="px-6 py-2.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors no-underline"
              >
                注册并发布 →
              </Link>
            )
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
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
