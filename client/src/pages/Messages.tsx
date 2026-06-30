import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import type { Conversation } from "../types";
import api from "../lib/api";

/** 加载骨架 */
function SkeletonList() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200">
          <div className="w-10 h-10 rounded-full skeleton" />
          <div className="flex-1 space-y-2">
            <div className="h-4 skeleton w-20" />
            <div className="h-3 skeleton w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Messages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await api.get("/messages");
      setConversations(res.data.conversations || []);
    } catch (err) {
      console.error("获取对话列表失败:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);

    if (hours < 1) return "刚刚";
    if (hours < 24) return `${hours} 小时前`;
    if (hours < 48) return "昨天";
    return date.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">💬 消息</h1>

      {loading ? (
        <SkeletonList />
      ) : conversations.length === 0 ? (
        <div className="flex flex-col items-center py-16">
          <p className="text-6xl mb-4">💬</p>
          <p className="text-gray-500 text-lg mb-2">暂无消息</p>
          <p className="text-gray-400 text-sm mb-6">
            去首页找感兴趣的书，联系卖家吧！
          </p>
          <Link
            to="/"
            className="px-6 py-2.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors no-underline"
          >
            去首页看看 →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => {
            const isMyMessage =
              conv.lastMessage.senderId !== conv.otherUser.id;
            return (
              <Link
                key={conv.otherUser.id}
                to={`/chat/${conv.otherUser.id}`}
                className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-sm hover:border-blue-200 transition-all no-underline"
              >
                {/* 头像 */}
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
                  {conv.otherUser.username.charAt(0).toUpperCase()}
                </div>

                {/* 信息 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      {conv.otherUser.username}
                    </span>
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                      {formatTime(conv.lastMessage.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    {!conv.lastMessage.isRead && !isMyMessage && (
                      <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                    )}
                    <span className="text-sm text-gray-500 truncate">
                      {isMyMessage ? "我：" : ""}
                      {conv.lastMessage.image ? "📷 图片" : conv.lastMessage.content}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
