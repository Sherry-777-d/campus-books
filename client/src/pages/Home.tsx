import { useEffect, useState, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import type { Book, Pagination as PaginationType } from "../types";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";
import api from "../lib/api";
import BookCard from "../components/BookCard";
import SearchBar from "../components/SearchBar";
import Pagination from "../components/Pagination";

const COURSE_TAGS = [
  "高等数学",
  "大学物理",
  "线性代数",
  "概率论",
  "计算机",
  "数据结构",
  "大学英语",
  "马克思主义原理",
  "模拟电子技术",
];

/** 加载骨架屏 */
function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden">
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
  const { showToast } = useToast();
  const [books, setBooks] = useState<Book[]>([]);
  const [pagination, setPagination] = useState<PaginationType>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  // 收藏状态：记录哪些 bookId 已被收藏
  const [favoritedIds, setFavoritedIds] = useState<Set<number>>(new Set());

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

      // 如果已登录，批量查询当前页书籍的收藏状态
      if (isLoggedIn && res.data.books.length > 0) {
        const ids: number[] = res.data.books.map((b: Book) => b.id);
        const favRes = await api.get("/favorites", {
          params: { bookIds: ids.join(",") },
        });
        // 后端返回 favoritedIds 数组
        setFavoritedIds(new Set(favRes.data.favoritedIds || []));
      }
    } catch (err) {
      console.error("获取书籍列表失败:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, currentSearch, isLoggedIn]);

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

  // 切换收藏
  const handleToggleFavorite = async (bookId: number) => {
    try {
      if (favoritedIds.has(bookId)) {
        // 取消收藏
        await api.delete(`/favorites/${bookId}`);
        setFavoritedIds((prev) => {
          const next = new Set(prev);
          next.delete(bookId);
          return next;
        });
        showToast("已取消收藏", "info");
      } else {
        // 添加收藏
        await api.post(`/favorites/${bookId}`);
        setFavoritedIds((prev) => new Set(prev).add(bookId));
        showToast("收藏成功！", "success");
      }
    } catch (err) {
      showToast("操作失败，请稍后再试", "error");
    }
  };

  return (
    <div>
      {/* Hero 区域：只在首页无搜索时显示 */}
      {!currentSearch && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 mb-10">
          {/* 装饰性模糊圆 */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-rose-400/20 rounded-full translate-y-1/3 -translate-x-1/4 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-amber-300/20 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl" />

          <div className="relative px-6 py-12 md:py-16 flex flex-col items-center text-center">
            <span className="text-6xl md:text-7xl mb-4 animate-float">📚</span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-3 tracking-tight">
              校园二手书
              <span className="block text-amber-200 mt-1">循环利用，知识传递</span>
            </h1>
            <p className="text-indigo-100 text-base md:text-lg max-w-md mb-6">
              买到便宜好书，卖掉闲置教材。让每一本书都找到下一个主人。
            </p>
            {!isLoggedIn && (
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 font-semibold rounded-full hover:bg-indigo-50 transition-all shadow-lg shadow-black/10 no-underline active:scale-95"
              >
                立即开始 →
              </Link>
            )}
          </div>
        </div>
      )}

      {/* 搜索栏 */}
      <div className="mb-4">
        <SearchBar onSearch={handleSearch} initialValue={currentSearch} />
      </div>

      {/* 课程分类标签 */}
      <div className="mb-4 flex flex-wrap gap-2">
        {COURSE_TAGS.map((tag) => {
          const isActive = currentSearch === tag;
          return (
            <button
              key={tag}
              onClick={() => handleSearch(isActive ? "" : tag)}
              className={`px-3 py-1.5 text-xs rounded-full border transition-colors cursor-pointer ${
                isActive
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50"
              }`}
            >
              {tag}
            </button>
          );
        })}
        {currentSearch && (
          <button
            onClick={() => handleSearch("")}
            className="px-3 py-1.5 text-xs rounded-full border border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-300 transition-colors cursor-pointer"
          >
            清除筛选 ✕
          </button>
        )}
      </div>

      {currentSearch && (
        <p className="text-sm text-slate-500 mb-4">
          搜索 "{currentSearch}" 结果：共 {pagination.total} 本
        </p>
        )}

      {/* 内容区 */}
      {loading ? (
        <SkeletonGrid />
      ) : books.length === 0 ? (
        <div className="flex flex-col items-center py-16">
          <p className="text-6xl mb-4">📭</p>
          <p className="text-slate-500 text-lg mb-2">
            {currentSearch ? "没有找到相关书籍" : "还没有人发布书籍"}
          </p>
          <p className="text-slate-400 text-sm mb-6">
            {currentSearch ? "试试其他关键词吧" : "成为第一个卖书的人！"}
          </p>
          {!currentSearch && (
            isLoggedIn ? (
              <Link
                to="/publish"
                className="px-6 py-2.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors no-underline active:scale-95"
              >
                发布第一本书 →
              </Link>
            ) : (
              <Link
                to="/register"
                className="px-6 py-2.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors no-underline active:scale-95"
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
              <BookCard
                key={book.id}
                book={book}
                showFavorite={isLoggedIn}
                isFavorited={favoritedIds.has(book.id)}
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
