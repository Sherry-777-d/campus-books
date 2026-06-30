import { useState, type FormEvent, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useToast } from "../context/ToastContext";

const CONDITION_OPTIONS = ["全新", "几乎全新", "有笔记", "有破损"];

interface FieldErrors {
  title?: string;
  author?: string;
  price?: string;
}

export default function PublishBook() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("全新");
  const [courseName, setCourseName] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const validate = (): boolean => {
    const errors: FieldErrors = {};
    if (!title.trim()) errors.title = "请输入书名";
    if (!author.trim()) errors.author = "请输入作者";
    if (!price || parseFloat(price) <= 0) errors.price = "请输入有效价格";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 5) {
      setError("最多上传 5 张图片");
      return;
    }
    setFiles(selectedFiles);
    setPreviews(selectedFiles.map((f) => URL.createObjectURL(f)));
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validate()) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("author", author.trim());
      formData.append("price", price);
      formData.append("condition", condition);
      if (courseName.trim()) formData.append("courseName", courseName.trim());
      if (description.trim()) formData.append("description", description.trim());
      files.forEach((f) => formData.append("images", f));

      await api.post("/books", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showToast("发布成功！", "success");
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "发布失败，请稍后再试");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-center mb-6 text-gray-900">
        发布二手书
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md border border-gray-200"
      >
        {error && (
          <div className="mb-4 p-2.5 bg-red-50 text-red-600 text-sm rounded-md border border-red-200">
            {error}
          </div>
        )}

        {/* 书名 */}
        <div className="mb-4">
          <label className="block text-sm text-gray-700 mb-1">
            书名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setFieldErrors((p) => ({ ...p, title: undefined })); }}
            className={`w-full px-3 py-2.5 border rounded-md text-sm focus:outline-none focus:ring-2 transition-shadow ${
              fieldErrors.title
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500 focus:border-transparent"
            }`}
            placeholder="例如：高等数学（第七版）"
          />
          {fieldErrors.title && (
            <p className="text-red-500 text-xs mt-1">{fieldErrors.title}</p>
          )}
        </div>

        {/* 作者 */}
        <div className="mb-4">
          <label className="block text-sm text-gray-700 mb-1">
            作者 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={author}
            onChange={(e) => { setAuthor(e.target.value); setFieldErrors((p) => ({ ...p, author: undefined })); }}
            className={`w-full px-3 py-2.5 border rounded-md text-sm focus:outline-none focus:ring-2 transition-shadow ${
              fieldErrors.author
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500 focus:border-transparent"
            }`}
            placeholder="例如：同济大学数学系"
          />
          {fieldErrors.author && (
            <p className="text-red-500 text-xs mt-1">{fieldErrors.author}</p>
          )}
        </div>

        {/* 价格 + 成色 */}
        <div className="mb-4 flex gap-4">
          <div className="flex-1">
            <label className="block text-sm text-gray-700 mb-1">
              价格 (元) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => { setPrice(e.target.value); setFieldErrors((p) => ({ ...p, price: undefined })); }}
              className={`w-full px-3 py-2.5 border rounded-md text-sm focus:outline-none focus:ring-2 transition-shadow ${
                fieldErrors.price
                  ? "border-red-300 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500 focus:border-transparent"
              }`}
              placeholder="0.00"
            />
            {fieldErrors.price && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.price}</p>
            )}
          </div>
          <div className="flex-1">
            <label className="block text-sm text-gray-700 mb-1">成色</label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {CONDITION_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 课程名 */}
        <div className="mb-4">
          <label className="block text-sm text-gray-700 mb-1">
            相关课程（选填）
          </label>
          <input
            type="text"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            placeholder="例如：高等数学 A"
          />
        </div>

        {/* 描述 */}
        <div className="mb-4">
          <label className="block text-sm text-gray-700 mb-1">
            补充描述（选填）
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-shadow"
            placeholder="介绍一下书的状况、有没有笔记等..."
          />
        </div>

        {/* 上传图片 */}
        <div className="mb-6">
          <label className="block text-sm text-gray-700 mb-2">
            上传图片（最多 5 张）
          </label>
          {/* 上传区域 */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors"
          >
            <p className="text-3xl mb-1">📷</p>
            <p className="text-sm text-gray-500">点击选择图片</p>
            <p className="text-xs text-gray-400 mt-0.5">支持 JPG、PNG，每张不超过 5MB</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          {/* 预览 */}
          {previews.length > 0 && (
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {previews.map((url, i) => (
                <div key={i} className="relative flex-shrink-0">
                  <img
                    src={url}
                    alt={`预览 ${i + 1}`}
                    className="w-20 h-20 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center cursor-pointer border-none hover:bg-red-600 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
        >
          {submitting && (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {submitting ? "发布中..." : "发布"}
        </button>
      </form>
    </div>
  );
}
