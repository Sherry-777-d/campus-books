interface Props {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null;

  // 生成页码按钮列表
  const pages: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    // 总是显示第一页、最后一页、当前页及前后各一页
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      {/* 上一页 */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors cursor-pointer"
      >
        上一页
      </button>

      {/* 页码 */}
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} className="px-2 text-gray-400 text-sm">
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`px-3 py-1.5 text-sm rounded-md border cursor-pointer transition-colors ${
              p === page
                ? "bg-blue-600 text-white border-blue-600"
                : "border-gray-300 bg-white hover:bg-gray-50"
            }`}
          >
            {p}
          </button>
        )
      )}

      {/* 下一页 */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors cursor-pointer"
      >
        下一页
      </button>
    </div>
  );
}
