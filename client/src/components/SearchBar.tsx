import { useState, type FormEvent } from "react";

interface Props {
  onSearch: (keyword: string) => void;
  initialValue?: string;
}

export default function SearchBar({ onSearch, initialValue = "" }: Props) {
  const [keyword, setKeyword] = useState(initialValue);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch(keyword.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="搜索书名、作者或课程名..."
        className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      />
      <button
        type="submit"
        className="px-5 py-2.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap cursor-pointer"
      >
        搜索
      </button>
    </form>
  );
}
