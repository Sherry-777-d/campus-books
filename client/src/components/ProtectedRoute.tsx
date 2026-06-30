import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface Props {
  children: React.ReactNode;
}

/** 需要登录才能访问的路由包装器 */
export default function ProtectedRoute({ children }: Props) {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <p className="text-gray-400 text-sm">加载中...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
