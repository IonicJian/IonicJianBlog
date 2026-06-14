import { useRef, useState } from 'react';
import apiClient from '../../api/client';

interface Props {
  onInsert: (markdown: string) => void;
}

export default function ImageUploadButton({ onInsert }: Props) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await apiClient.post('/upload/image', formData);
      const url = res.data.data.url;
      onInsert(`![](${url})`);
    } catch {
      // ignore
    } finally {
      setUploading(false);
      // Reset so same file can be re-selected
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={handleUpload}
      />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="text-xs px-2 py-0.5 rounded border border-black/5 dark:border-white/10 bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 cursor-pointer"
        title="上传图片"
      >
        {uploading ? '⏳' : '🖼'}
      </button>
    </>
  );
}
