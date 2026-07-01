import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import api from "../lib/api";

export default function Navbar() {
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnread = useCallback(async () => {
    try {
      const res = await api.get("/messages/unread-count");
      setUnreadCount(res.data.count);
    } catch { /* ignore */ }
  }, []);

  // 定期检查未读消息数
  useEffect(() => {
    if (!isLoggedIn) return;
    fetchUnread();
    const timer = setInterval(fetchUnread, 30000); // 每 30 秒检查一次
    return () => clearInterval(timer);
  }, [isLoggedIn, fetchUnread]);

  // 监听「消息已读」事件，立即刷新未读数
  useEffect(() => {
    window.addEventListener("messages-read", fetchUnread);
    return () => window.removeEventListener("messages-read", fetchUnread);
  }, [fetchUnread]);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileOpen(false);
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <nav className="bg-white/70 backdrop-blur-md border-b border-indigo-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* 左侧：Logo */}
        <Link to="/" className="text-xl font-extrabold no-underline" onClick={closeMobile}>
          <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            📚 NUAA Campus Books
          </span>
        </Link>

        {/* 桌面端：导航链接 */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-slate-600 hover:text-indigo-600 transition-colors no-underline text-sm">
            首页
          </Link>
          {isLoggedIn && (
            <>
              <Link to="/publish" className="text-slate-600 hover:text-indigo-600 transition-colors no-underline text-sm">
                发布书籍
              </Link>
              <Link to="/my-books" className="text-slate-600 hover:text-indigo-600 transition-colors no-underline text-sm">
                📦 我的发布
              </Link>
              <Link to="/favorites" className="text-slate-600 hover:text-rose-500 transition-colors no-underline text-sm flex items-center gap-1">
                ❤️ 心愿单
              </Link>
              <Link to="/messages" className="text-slate-600 hover:text-indigo-600 transition-colors no-underline text-sm relative">
                💬 消息
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-3 bg-rose-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 animate-pulse">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
            </>
          )}
        </div>

        {/* 桌面端：用户状态 */}
        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <span className="text-sm text-slate-500">{user?.username}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-slate-400 hover:text-rose-500 transition-colors bg-transparent border-none cursor-pointer"
              >
                退出
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-slate-600 hover:text-indigo-600 transition-colors no-underline">
                登录
              </Link>
              <Link to="/register" className="text-sm bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-3 py-1.5 rounded-lg hover:from-indigo-700 hover:to-indigo-600 transition-all shadow-md shadow-indigo-500/25 no-underline active:scale-95 inline-block">
                注册
              </Link>
            </>
          )}
        </div>

        {/* 移动端：汉堡按钮 */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-slate-600 bg-transparent border-none cursor-pointer text-2xl p-1"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* 移动端：下拉菜单 */}
      {mobileOpen && (
        <div className="md:hidden border-t border-indigo-100 bg-white/95 backdrop-blur-md px-4 py-3 flex flex-col gap-3">
          <Link to="/" onClick={closeMobile} className="text-slate-700 no-underline text-sm py-1">
            首页
          </Link>
          {isLoggedIn && (
            <>
              <Link to="/publish" onClick={closeMobile} className="text-slate-700 no-underline text-sm py-1">
                发布书籍
              </Link>
              <Link to="/my-books" onClick={closeMobile} className="text-slate-700 no-underline text-sm py-1">
                📦 我的发布
              </Link>
              <Link to="/favorites" onClick={closeMobile} className="text-slate-700 no-underline text-sm py-1">
                ❤️ 心愿单
              </Link>
              <Link to="/messages" onClick={closeMobile} className="text-slate-700 no-underline text-sm py-1">
                💬 消息
                {unreadCount > 0 && (
                  <span className="ml-1 bg-rose-500 text-white text-xs rounded-full px-1.5 py-0.5">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
            </>
          )}
          <hr className="border-slate-100" />
          {isLoggedIn ? (
            <>
              <span className="text-sm text-slate-500">{user?.username}</span>
              <button onClick={handleLogout} className="text-left text-sm text-rose-500 bg-transparent border-none cursor-pointer py-1">
                退出登录
              </button>
            </>
          ) : (
            <div className="flex gap-3">
              <Link to="/login" onClick={closeMobile} className="flex-1 text-center text-sm py-2 border border-slate-300 rounded-lg text-slate-700 no-underline">
                登录
              </Link>
              <Link to="/register" onClick={closeMobile} className="flex-1 text-center text-sm py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 text-white no-underline">
                注册
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
