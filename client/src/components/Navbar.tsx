import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Navbar() {
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileOpen(false);
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* 左侧：Logo */}
        <Link to="/" className="text-xl font-bold text-blue-600 no-underline" onClick={closeMobile}>
          📚 Campus Books
        </Link>

        {/* 桌面端：导航链接 */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-gray-600 hover:text-blue-600 transition-colors no-underline text-sm">
            首页
          </Link>
          {isLoggedIn && (
            <Link to="/publish" className="text-gray-600 hover:text-blue-600 transition-colors no-underline text-sm">
              发布书籍
            </Link>
          )}
        </div>

        {/* 桌面端：用户状态 */}
        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <span className="text-sm text-gray-500">{user?.username}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-400 hover:text-red-500 transition-colors bg-transparent border-none cursor-pointer"
              >
                退出
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-gray-600 hover:text-blue-600 transition-colors no-underline">
                登录
              </Link>
              <Link to="/register" className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors no-underline">
                注册
              </Link>
            </>
          )}
        </div>

        {/* 移动端：汉堡按钮 */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-gray-600 bg-transparent border-none cursor-pointer text-2xl p-1"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* 移动端：下拉菜单 */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-3 flex flex-col gap-3">
          <Link to="/" onClick={closeMobile} className="text-gray-700 no-underline text-sm py-1">
            首页
          </Link>
          {isLoggedIn && (
            <Link to="/publish" onClick={closeMobile} className="text-gray-700 no-underline text-sm py-1">
              发布书籍
            </Link>
          )}
          <hr className="border-gray-100" />
          {isLoggedIn ? (
            <>
              <span className="text-sm text-gray-500">{user?.username}</span>
              <button onClick={handleLogout} className="text-left text-sm text-red-500 bg-transparent border-none cursor-pointer py-1">
                退出登录
              </button>
            </>
          ) : (
            <div className="flex gap-3">
              <Link to="/login" onClick={closeMobile} className="flex-1 text-center text-sm py-2 border border-gray-300 rounded-md text-gray-700 no-underline">
                登录
              </Link>
              <Link to="/register" onClick={closeMobile} className="flex-1 text-center text-sm py-2 rounded-md bg-blue-600 text-white no-underline">
                注册
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
