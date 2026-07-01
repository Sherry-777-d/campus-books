import { useState, type FormEvent, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../lib/api";
import { useToast } from "../context/ToastContext";

const CONDITION_OPTIONS = ["全新", "几乎全新", "有笔记", "有破损"];

const COURSE_OPTIONS = [
  "高等数学",
  "大学物理",
  "线性代数",
  "概率论",
  "计算机",
  "数据结构",
  "大学英语",
  "马克思主义原理",
  "模拟电子技术",
  "其他",
];

interface FieldErrors {
  title?: string;
  author?: string;
  price?: string;
  condition?: string;
}

export default function PublishBook() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id; // 有 id 就是编辑模式，没有就是发布模式
  const navigate = useNavigate();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [price, setPrice] = useState("");
  const [conditions, setConditions] = useState<string[]>(["全新"]);
  const [courseName, setCourseName] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(""); // 下拉框选中的值
  const [customCourse, setCustomCourse] = useState(""); // 选「其他」时手动输入的内容
  const [description, setDescription] = useState("");
  const [tradeLocation, setTradeLocation] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]); // 编辑模式下已有的图片
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingBook, setLoadingBook] = useState(isEdit); // 编辑模式下先加载原数据

  // 编辑模式：加载书籍数据
  useEffect(() => {
    if (!id) return;
    setLoadingBook(true);
    api
      .get(`/books/${id}`)
      .then((res) => {
        const book = res.data.book;
        setTitle(book.title);
        setAuthor(book.author);
        setPrice(String(book.price));
        setConditions(book.condition?.split(",").filter(Boolean) || ["全新"]);
        setCourseName(book.courseName || "");
        setDescription(book.description || "");
        setTradeLocation(book.tradeLocation || "");
        // 课程：判断是否在预设列表中
        const bookCourse = book.courseName || "";
        if (COURSE_OPTIONS.includes(bookCourse) && bookCourse !== "其他") {
          setSelectedCourse(bookCourse);
          setCourseName(bookCourse);
        } else if (bookCourse) {
          setSelectedCourse("其他");
          setCustomCourse(bookCourse);
          setCourseName(bookCourse);
        }
        // 已有图片
        const images = book.images?.split(",").filter(Boolean) || [];
        setExistingImages(images);
      })
      .catch(() => {
        setError("加载书籍信息失败");
      })
      .finally(() => setLoadingBook(false));
  }, [id]);

  const validate = (): boolean => {
    const errors: FieldErrors = {};
    if (!title.trim()) errors.title = "请输入书名";
    if (!author.trim()) errors.author = "请输入作者";
    if (!price || parseFloat(price) <= 0) errors.price = "请输入有效价格";
    if (conditions.length === 0) errors.condition = "请至少选择一个成色";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const totalImages = existingImages.length + selectedFiles.length;
    if (totalImages > 5) {
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

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
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
      formData.append("condition", conditions.join(","));
      const finalCourse = selectedCourse === "其他" ? customCourse.trim() : selectedCourse;
      if (finalCourse) formData.append("courseName", finalCourse);
      // 向后兼容：如果 courseName 有值也传（编辑模式手动输入的情况）
      if (!finalCourse && courseName.trim()) formData.append("courseName", courseName.trim());
      if (description.trim())
        formData.append("description", description.trim());
      if (tradeLocation.trim())
        formData.append("tradeLocation", tradeLocation.trim());

      // 编辑模式：传递保留的已有图片
      if (isEdit && existingImages.length > 0) {
        formData.append("existingImages", existingImages.join(","));
      }

      files.forEach((f) => formData.append("images", f));

      if (isEdit) {
        await api.put(`/books/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        showToast("编辑成功！", "success");
        navigate(`/books/${id}`);
      } else {
        await api.post("/books", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        showToast("发布成功！", "success");
        navigate("/");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "操作失败，请稍后再试");
    } finally {
      setSubmitting(false);
    }
  };

  // 加载中骨架
  if (loadingBook) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="h-7 skeleton w-32 mx-auto mb-6" />
        <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <div className="h-4 skeleton w-12 mb-2" />
              <div className="h-10 skeleton w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-center mb-6 text-slate-900">
        {isEdit ? "编辑书籍" : "发布二手书"}
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

        {/* 书名 */}
        <div className="mb-4">
          <label className="block text-sm text-slate-700 mb-1">
            书名 <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setFieldErrors((p) => ({ ...p, title: undefined })); }}
            className={`w-full px-3 py-2.5 border rounded-md text-sm focus:outline-none focus:ring-2 transition-shadow ${
              fieldErrors.title
                ? "border-rose-300 focus:ring-rose-500"
                : "border-slate-300 focus:ring-indigo-500 focus:border-transparent"
            }`}
            placeholder="例如：高等数学（第七版）"
          />
          {fieldErrors.title && (
            <p className="text-rose-500 text-xs mt-1">{fieldErrors.title}</p>
          )}
        </div>

        {/* 作者 */}
        <div className="mb-4">
          <label className="block text-sm text-slate-700 mb-1">
            作者 <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={author}
            onChange={(e) => { setAuthor(e.target.value); setFieldErrors((p) => ({ ...p, author: undefined })); }}
            className={`w-full px-3 py-2.5 border rounded-md text-sm focus:outline-none focus:ring-2 transition-shadow ${
              fieldErrors.author
                ? "border-rose-300 focus:ring-rose-500"
                : "border-slate-300 focus:ring-indigo-500 focus:border-transparent"
            }`}
            placeholder="例如：同济大学数学系"
          />
          {fieldErrors.author && (
            <p className="text-rose-500 text-xs mt-1">{fieldErrors.author}</p>
          )}
        </div>

        {/* 价格 + 成色 */}
        <div className="mb-4 flex gap-4">
          <div className="flex-1">
            <label className="block text-sm text-slate-700 mb-1">
              价格 (元) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => { setPrice(e.target.value); setFieldErrors((p) => ({ ...p, price: undefined })); }}
              className={`w-full px-3 py-2.5 border rounded-md text-sm focus:outline-none focus:ring-2 transition-shadow ${
                fieldErrors.price
                  ? "border-rose-300 focus:ring-rose-500"
                  : "border-slate-300 focus:ring-indigo-500 focus:border-transparent"
              }`}
              placeholder="0.00"
            />
            {fieldErrors.price && (
              <p className="text-rose-500 text-xs mt-1">{fieldErrors.price}</p>
            )}
          </div>
          <div className="flex-1">
            <label className="block text-sm text-slate-700 mb-1">成色（可多选）</label>
            <div className="flex flex-wrap gap-1.5">
              {CONDITION_OPTIONS.map((opt) => {
                const isActive = conditions.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      if (isActive) {
                        setConditions((prev) => prev.filter((c) => c !== opt));
                      } else {
                        setConditions((prev) => [...prev, opt]);
                      }
                      setFieldErrors((p) => ({ ...p, condition: undefined }));
                    }}
                    className={`px-3 py-1.5 text-xs rounded-full border transition-colors cursor-pointer ${
                      isActive
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                        : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            {fieldErrors.condition && (
              <p className="text-rose-500 text-xs mt-1">{fieldErrors.condition}</p>
            )}
          </div>
        </div>

        {/* 课程名 */}
        <div className="mb-4">
          <label className="block text-sm text-slate-700 mb-1">
            相关课程（选填）
          </label>
          <select
            value={selectedCourse}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedCourse(val);
              if (val === "其他") {
                setCourseName(customCourse);
              } else if (val) {
                setCourseName(val);
                setCustomCourse("");
              }
            }}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">不选择课程</option>
            {COURSE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          {selectedCourse === "其他" && (
            <input
              type="text"
              value={customCourse}
              onChange={(e) => {
                setCustomCourse(e.target.value);
                setCourseName(e.target.value);
              }}
              className="w-full mt-2 px-3 py-2.5 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
              placeholder="请输入课程名称"
            />
          )}
        </div>

        {/* 交易地点 */}
        <div className="mb-4">
          <label className="block text-sm text-slate-700 mb-1">
            交易地点（选填）
          </label>
          <input
            type="text"
            value={tradeLocation}
            onChange={(e) => setTradeLocation(e.target.value)}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
            placeholder="例如：图书馆门口、一食堂二楼"
          />
        </div>

        {/* 描述 */}
        <div className="mb-4">
          <label className="block text-sm text-slate-700 mb-1">
            补充描述（选填）
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-shadow"
            placeholder="介绍一下书的状况、有没有笔记等..."
          />
        </div>

        {/* 已有图片（编辑模式） */}
        {isEdit && existingImages.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm text-slate-700 mb-2">
              已有图片
            </label>
            <div className="flex gap-2 flex-wrap">
              {existingImages.map((url, i) => (
                <div key={i} className="relative flex-shrink-0">
                  <img
                    src={url}
                    alt={`已有图片 ${i + 1}`}
                    className="w-20 h-20 object-cover rounded-md border border-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(i)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white rounded-full text-xs flex items-center justify-center cursor-pointer border-none hover:bg-rose-600 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 上传图片 */}
        <div className="mb-6">
          <label className="block text-sm text-slate-700 mb-2">
            {isEdit ? "上传新图片（选填，将替换已有图片）" : "上传图片（最多 5 张）"}
          </label>
          {/* 上传区域 */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors"
          >
            <p className="text-3xl mb-1">📷</p>
            <p className="text-sm text-slate-500">点击选择图片</p>
            <p className="text-xs text-slate-400 mt-0.5">支持 JPG、PNG，每张不超过 5MB</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          {/* 新文件预览 */}
          {previews.length > 0 && (
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {previews.map((url, i) => (
                <div key={i} className="relative flex-shrink-0">
                  <img
                    src={url}
                    alt={`新图片预览 ${i + 1}`}
                    className="w-20 h-20 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white rounded-full text-xs flex items-center justify-center cursor-pointer border-none hover:bg-rose-600 transition-colors"
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
          className="w-full py-2.5 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 transition-colors disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
        >
          {submitting && (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {submitting ? "保存中..." : isEdit ? "保存修改" : "发布"}
        </button>
      </form>
    </div>
  );
}
