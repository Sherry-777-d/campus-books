export type ToastType = "success" | "error" | "info";

interface Props {
  message: string;
  type: ToastType;
  onClose: () => void;
}

const ICONS: Record<ToastType, string> = {
  success: "✅",
  error: "❌",
  info: "ℹ️",
};

const COLORS: Record<ToastType, string> = {
  success: "bg-green-50 border-green-200 text-green-800",
  error: "bg-red-50 border-red-200 text-red-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
};

export default function Toast({ message, type, onClose }: Props) {
  return (
    <div
      className={`flex items-center gap-2 px-4 py-3 rounded-lg border shadow-lg text-sm animate-slide-in ${COLORS[type]}`}
    >
      <span>{ICONS[type]}</span>
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-2 text-current opacity-50 hover:opacity-100 bg-transparent border-none cursor-pointer text-sm"
      >
        ✕
      </button>
    </div>
  );
}
