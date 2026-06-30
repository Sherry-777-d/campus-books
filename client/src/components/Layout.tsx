import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

/** 页面布局壳：顶部导航 + 中间内容区 */
export default function Layout() {
  return (
    <div className="min-h-screen bg-stone-100">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
