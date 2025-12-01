import React, { useRef, useState, useEffect } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { CloseIcon } from './icons/CloseIcon';

interface ImageUploadProps {
  label: string;
  imageFile: File | null;
  setImageFile: (file: File | null) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ label, imageFile, setImageFile }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [imageFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    if(inputRef.current) {
        inputRef.current.value = '';
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">{label}</label>
      {previewUrl ? (
        <div className="relative w-full h-24 border-2 border-dashed border-light-border dark:border-dark-border rounded-lg p-1">
          <img src={previewUrl} alt="Preview" className="w-full h-full object-contain rounded" />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-0.5 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full h-24 border-2 border-dashed border-light-border dark:border-dark-border rounded-lg flex flex-col items-center justify-center text-light-text-secondary dark:text-dark-text-secondary hover:border-indigo-500 hover:text-indigo-500 transition-colors"
        >
          <UploadIcon className="w-6 h-6 mb-1" />
          <span className="text-xs font-semibold">Upload Image</span>
        </button>
      )}
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
      />
    </div>
  );
};