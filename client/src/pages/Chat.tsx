import { useEffect, useState, useRef, useCallback, type FormEvent } from "react";
import { useParams, Link } from "react-router-dom";
import type { Message } from "../types";
import { useAuth } from "../hooks/useAuth";
import api from "../lib/api";

export default function Chat() {
  const { userId } = useParams<{ userId: string }>();
  const { user: me } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<{
    id: number;
    username: string;
    avatar: string | null;
  } | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // 图片相关 state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await api.get(`/messages/${userId}`);
      setMessages(res.data.messages || []);
      setOtherUser(res.data.otherUser);
      // 通知 Navbar 刷新未读计数
      window.dispatchEvent(new CustomEvent("messages-read"));
    } catch (err) {
      console.error("获取聊天记录失败:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // 滚动到底部
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 选择图片
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    // 生成本地预览 URL
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  // 清除已选图片
  const clearImage = () => {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    const content = newMessage.trim();
    if (!content && !imageFile) return;
    if (sending) return;

    setSending(true);
    try {
      let res;
      if (imageFile) {
        // 有图片时用 FormData
        const formData = new FormData();
        formData.append("receiverId", userId!);
        formData.append("content", content || "");
        formData.append("image", imageFile);
        res = await api.post("/messages", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        clearImage();
      } else {
        // 纯文字
        res = await api.post("/messages", {
          receiverId: parseInt(userId!),
          content,
        });
      }
      setMessages((prev) => [...prev, res.data.message]);
      setNewMessage("");
    } catch (err) {
      console.error("发送消息失败:", err);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("zh-CN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="h-10 skeleton w-32 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}
            >
              <div className={`h-10 skeleton rounded-lg ${i % 2 === 0 ? "w-48" : "w-56"}`} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      {/* 顶部栏 */}
      <div className="flex items-center gap-3 py-3 border-b border-gray-200 mb-3">
        <Link
          to="/messages"
          className="text-gray-500 hover:text-gray-700 no-underline text-sm"
        >
          ← 返回
        </Link>
        {otherUser && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
              {otherUser.username.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-gray-900">
              {otherUser.username}
            </span>
          </div>
        )}
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400 text-sm">还没有消息，发一条吧 👋</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.senderId === me?.id;
            const hasImage = !!msg.image;
            return (
              <div
                key={msg.id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl overflow-hidden ${
                    isMine
                      ? "bg-blue-600 text-white rounded-br-md"
                      : "bg-gray-100 text-gray-900 rounded-bl-md"
                  }`}
                >
                  {/* 图片 */}
                  {hasImage && (
                    <a
                      href={msg.image!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <img
                        src={msg.image!}
                        alt="图片"
                        className="max-w-full max-h-60 object-cover"
                      />
                    </a>
                  )}
                  {/* 文字 */}
                  {msg.content && (
                    <p className="px-4 pt-2.5 pb-1 text-sm whitespace-pre-wrap break-words">
                      {msg.content}
                    </p>
                  )}
                  {/* 时间 */}
                  <p
                    className={`text-xs mt-0.5 pb-2.5 px-4 ${
                      isMine ? "text-blue-200" : "text-gray-400"
                    }`}
                  >
                    {formatTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* 图片预览栏 */}
      {imagePreview && (
        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 flex items-center gap-3">
          <div className="relative">
            <img
              src={imagePreview}
              alt="预览"
              className="w-14 h-14 rounded-lg object-cover"
            />
            <button
              onClick={clearImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs border-none cursor-pointer"
            >
              ✕
            </button>
          </div>
          <span className="text-xs text-gray-500">点击发送图片</span>
        </div>
      )}

      {/* 发送区 */}
      <form
        onSubmit={handleSend}
        className="flex items-end gap-2 py-3 border-t border-gray-200"
      >
        {/* 图片按钮 */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex-shrink-0 w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-lg bg-white hover:bg-gray-50 cursor-pointer transition-colors"
        >
          🖼️
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={imageFile ? "添加文字说明（可选）..." : "输入消息..."}
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={(!newMessage.trim() && !imageFile) || sending}
          className="px-5 py-2.5 bg-blue-600 text-white text-sm rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex-shrink-0"
        >
          {sending ? "发送中" : "发送"}
        </button>
      </form>
    </div>
  );
}
