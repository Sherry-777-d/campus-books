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

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    const content = newMessage.trim();
    if (!content || sending) return;

    setSending(true);
    try {
      const res = await api.post("/messages", {
        receiverId: parseInt(userId!),
        content,
      });
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
            return (
              <div
                key={msg.id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                    isMine
                      ? "bg-blue-600 text-white rounded-br-md"
                      : "bg-gray-100 text-gray-900 rounded-bl-md"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  <p
                    className={`text-xs mt-1 ${
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

      {/* 发送区 */}
      <form
        onSubmit={handleSend}
        className="flex gap-2 py-3 border-t border-gray-200"
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="输入消息..."
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || sending}
          className="px-5 py-2.5 bg-blue-600 text-white text-sm rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {sending ? "发送中" : "发送"}
        </button>
      </form>
    </div>
  );
}
