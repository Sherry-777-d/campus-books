import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center py-20">
      <p className="text-6xl mb-4">🔍</p>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">页面不存在</h1>
      <p className="text-gray-500 mb-6">你要找的页面可能已经被移除</p>
      <Link
        to="/"
        className="text-sm text-blue-600 hover:underline no-underline"
      >
        返回首页
      </Link>
    </div>
  );
}
