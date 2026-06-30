import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BookDetail from "./pages/BookDetail";
import PublishBook from "./pages/PublishBook";
import MyFavorites from "./pages/MyFavorites";
import MyBooks from "./pages/MyBooks";
import Messages from "./pages/Messages";
import Chat from "./pages/Chat";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Layout 作为外壳，子路由渲染在 <Outlet /> 位置 */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/books/:id" element={<BookDetail />} />
          <Route
            path="/books/:id/edit"
            element={
              <ProtectedRoute>
                <PublishBook />
              </ProtectedRoute>
            }
          />

          {/* 需要登录才能访问的页面 */}
          <Route
            path="/publish"
            element={
              <ProtectedRoute>
                <PublishBook />
              </ProtectedRoute>
            }
          />
          <Route
            path="/favorites"
            element={
              <ProtectedRoute>
                <MyFavorites />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-books"
            element={
              <ProtectedRoute>
                <MyBooks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat/:userId"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
