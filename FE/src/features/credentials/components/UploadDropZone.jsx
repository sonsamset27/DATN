import { useState, useRef } from 'react';
import { Loader2, ImageUp } from 'lucide-react';

export default function UploadDropZone({ onFile, isLoading }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFile(file);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !isLoading && inputRef.current?.click()}
      className={`relative flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 group ${
        dragging
          ? 'border-primary bg-primary/10 scale-[1.01]'
          : 'border-gray-300 dark:border-gray-600 hover:border-primary hover:bg-primary/5'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ''; }}
      />
      {isLoading ? (
        <Loader2 size={36} className="text-primary animate-spin" />
      ) : (
        <div className={`p-4 rounded-2xl transition-colors ${dragging ? 'bg-primary/20' : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-primary/10'}`}>
          <ImageUp size={32} className={`transition-colors ${dragging ? 'text-primary' : 'text-gray-400 group-hover:text-primary'}`} />
        </div>
      )}
      <div className="text-center">
        <p className="font-semibold text-sm text-gray-700 dark:text-gray-200">
          {isLoading ? 'Đang đọc mã QR...' : dragging ? 'Thả ảnh vào đây' : 'Kéo thả hoặc nhấn để chọn ảnh QR'}
        </p>
        {!isLoading && (
          <p className="text-xs text-gray-400 mt-1">Hỗ trợ PNG, JPG, WEBP chứa mã QR</p>
        )}
      </div>
    </div>
  );
}
