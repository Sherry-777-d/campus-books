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

const CONDITION_TAGS = ["全新", "几乎全新", "有笔记", "有破损"];

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
  const currentCourse = searchParams.get("course") || "";
  const currentCondition = searchParams.get("condition") || "";
  const currentCategory = searchParams.get("category") || "";
  const currentMinPrice = searchParams.get("minPrice") || "";
  const currentMaxPrice = searchParams.get("maxPrice") || "";

  // 是否有任何筛选条件
  const hasFilters = !!(currentSearch || currentCategory || currentCourse || currentCondition || currentMinPrice || currentMaxPrice);

  // 构建 URL params 的辅助函数：保留所有筛选，page 默认重置为 1
  const buildParams = (overrides: Record<string, string>) => {
    const base: Record<string, string> = {
      search: currentSearch,
      category: currentCategory,
      course: currentCourse,
      condition: currentCondition,
      minPrice: currentMinPrice,
      maxPrice: currentMaxPrice,
      page: "1",
    };
    const merged = { ...base, ...overrides };
    // 过滤掉空值
    const result: Record<string, string> = {};
    for (const [k, v] of Object.entries(merged)) {
      if (v) result[k] = v;
    }
    // page 为 1 时不显示在 URL 中
    if (result.page === "1") delete result.page;
    return result;
  };

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/books", {
        params: {
          page: currentPage,
          search: currentSearch || undefined,
          category: currentCategory || undefined,
          courseName: currentCourse || undefined,
          condition: currentCondition || undefined,
          minPrice: currentMinPrice || undefined,
          maxPrice: currentMaxPrice || undefined,
        },
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
  }, [currentPage, currentSearch, currentCategory, currentCourse, currentCondition, currentMinPrice, currentMaxPrice, isLoggedIn]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleSearch = (keyword: string) => {
    setSearchParams(buildParams({ search: keyword }));
  };

  const handlePageChange = (page: number) => {
    const params = buildParams({ page: String(page) });
    // 保留 page
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 清除所有筛选
  const handleClearFilters = () => {
    setSearchParams({});
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
      {/* Hero 区域：只在无任何筛选时显示 */}
      {!hasFilters && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 mb-10">
          {/* 装饰性模糊圆 */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-rose-400/20 rounded-full translate-y-1/3 -translate-x-1/4 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-amber-300/20 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl" />

          <div className="relative px-6 py-12 md:py-16 flex flex-col items-center text-center">
            <span className="text-6xl md:text-7xl mb-4 animate-float">📚</span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-3 tracking-tight">
              NUAA 校园二手书
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

      {/* 分类筛选 */}
      <div className="mb-3 flex flex-wrap gap-2 items-center">
        <span className="text-xs text-slate-400 self-center mr-1">📂 分类：</span>
        {["", "教材", "课外书"].map((cat) => {
          const label = cat || "全部";
          const isActive = currentCategory === cat || (!currentCategory && !cat);
          return (
            <button
              key={cat}
              onClick={() =>
                setSearchParams(buildParams({ category: cat }))
              }
              className={`px-3 py-1.5 text-xs rounded-full border transition-colors cursor-pointer ${
                isActive
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* 课程分类标签（选课外书时隐藏） */}
      {currentCategory !== "课外书" && (
      <div className="mb-3 flex flex-wrap gap-2">
        <span className="text-xs text-slate-400 self-center mr-1">📖 课程：</span>
        {COURSE_TAGS.map((tag) => {
          const isActive = currentCourse === tag;
          return (
            <button
              key={tag}
              onClick={() =>
                setSearchParams(buildParams({ course: isActive ? "" : tag }))
              }
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
      </div>
      )}

      {/* 成色筛选（多选） */}
      <div className="mb-3 flex flex-wrap gap-2 items-center">
        <span className="text-xs text-slate-400 self-center mr-1">🏷️ 成色：</span>
        {(() => {
          const selectedConditions = new Set(currentCondition.split(",").filter(Boolean));
          return CONDITION_TAGS.map((tag) => {
            const isActive = selectedConditions.has(tag);
            return (
              <button
                key={tag}
                onClick={() => {
                  if (isActive) {
                    selectedConditions.delete(tag);
                  } else {
                    selectedConditions.add(tag);
                  }
                  const newCondition = [...selectedConditions].join(",");
                  setSearchParams(buildParams({ condition: newCondition }));
                }}
                className={`px-3 py-1.5 text-xs rounded-full border transition-colors cursor-pointer ${
                  isActive
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50"
                }`}
              >
                {tag}
              </button>
            );
          });
        })()}
      </div>

      {/* 价格区间 */}
      <div className="mb-4 flex flex-wrap gap-2 items-center">
        <span className="text-xs text-slate-400 self-center mr-1">💰 价格：</span>
        <input
          type="number"
          placeholder="最低价"
          value={currentMinPrice}
          onChange={(e) =>
            setSearchParams(buildParams({ minPrice: e.target.value }))
          }
          className="w-24 px-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 transition-colors"
        />
        <span className="text-xs text-slate-400">—</span>
        <input
          type="number"
          placeholder="最高价"
          value={currentMaxPrice}
          onChange={(e) =>
            setSearchParams(buildParams({ maxPrice: e.target.value }))
          }
          className="w-24 px-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 transition-colors"
        />
        {hasFilters && (
          <button
            onClick={handleClearFilters}
            className="ml-2 px-3 py-1.5 text-xs rounded-full border border-rose-200 text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
          >
            清除全部 ✕
          </button>
        )}
      </div>

      {hasFilters && (
        <p className="text-sm text-slate-500 mb-4">
          {currentSearch && <>搜索 "<span className="text-slate-700 font-medium">{currentSearch}</span>"</>}
          {currentSearch && (currentCourse || currentCondition || currentMinPrice || currentMaxPrice) && " · "}
          共 {pagination.total} 本
        </p>
      )}

      {/* 内容区 */}
      {loading ? (
        <SkeletonGrid />
      ) : books.length === 0 ? (
        <div className="flex flex-col items-center py-16">
          <p className="text-6xl mb-4">📭</p>
          <p className="text-slate-500 text-lg mb-2">
            {hasFilters ? "没有找到匹配的书籍" : "还没有人发布书籍"}
          </p>
          <p className="text-slate-400 text-sm mb-6">
            {hasFilters ? "试试调整筛选条件吧" : "成为第一个卖书的人！"}
          </p>
          {hasFilters ? (
            <button
              onClick={handleClearFilters}
              className="px-6 py-2.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer active:scale-95"
            >
              清除所有筛选
            </button>
          ) : (
            !isLoggedIn ? (
              <Link
                to="/register"
                className="px-6 py-2.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors no-underline active:scale-95"
              >
                注册并发布 →
              </Link>
            ) : (
              <Link
                to="/publish"
                className="px-6 py-2.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors no-underline active:scale-95"
              >
                发布第一本书 →
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
