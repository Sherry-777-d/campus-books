import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";

export default function Register() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !email || !password) {
      setError("请填写所有必填字段");
      return;
    }

    if (password.length < 6) {
      setError("密码至少 6 位");
      return;
    }

    setSubmitting(true);
    try {
      await register(username, email, password);
      showToast("注册成功！欢迎加入", "success");
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "注册失败，请稍后再试");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-10">
      <h1 className="text-2xl font-bold text-center mb-6 text-slate-900">
        注册
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md border border-slate-200"
      >
        {error && (
          <div className="mb-4 p-2.5 bg-rose-50 text-rose-600 text-sm rounded-md border border-rose-200">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm text-slate-700 mb-1">用户名</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
            placeholder="你的用户名"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm text-slate-700 mb-1">邮箱</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
            placeholder="your@email.com"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm text-slate-700 mb-1">密码</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
            placeholder="至少 6 位"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 transition-colors disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
        >
          {submitting && (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {submitting ? "注册中..." : "注册"}
        </button>

        <p className="text-center text-sm text-slate-500 mt-4">
          已有账号？{" "}
          <Link to="/login" className="text-indigo-600 hover:underline">
            去登录
          </Link>
        </p>
      </form>
    </div>
  );
}
