import React, { useState, useEffect } from 'react';
import { AspectRatio, ImageStyle } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { ImageUpload } from './ImageUpload';

interface PromptFormProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (ratio: AspectRatio) => void;
  quantity: number;
  setQuantity: (q: number) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  style: ImageStyle;
  setStyle: (style: ImageStyle) => void;
  characterImage: File | null;
  setCharacterImage: (file: File | null) => void;
  inspirationImage: File | null;
  setInspirationImage: (file: File | null) => void;
  colors: string;
  setColors: (colors: string) => void;
}

const QUANTITY_OPTIONS = [1, 2, 3, 4, 5, 6];

export const PromptForm: React.FC<PromptFormProps> = ({
  prompt,
  setPrompt,
  aspectRatio,
  setAspectRatio,
  quantity,
  setQuantity,
  onSubmit,
  isLoading,
  style,
  setStyle,
  characterImage,
  setCharacterImage,
  inspirationImage,
  setInspirationImage,
  colors,
  setColors,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoading) {
      setProgress(0);
      let currentProgress = 0;
      timer = setInterval(() => {
        currentProgress += 10;
        if (currentProgress > 90) {
          // Stay at 90% until loading is finished
        } else {
          setProgress(currentProgress);
        }
      }, 500);
    } else {
      setProgress(100);
      setTimeout(() => setProgress(0), 500); // Reset after completion animation
    }
    return () => clearInterval(timer);
  }, [isLoading]);

  return (
    <form onSubmit={onSubmit} className="w-full max-w-2xl mx-auto space-y-6">
      <div>
        <label htmlFor="prompt" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">
          Your Vision
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="A majestic lion king on a cliff, cinematic lighting..."
          rows={4}
          className="w-full p-3 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow duration-200 text-light-text-primary dark:text-dark-text-primary"
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
           <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">
              Aspect Ratio
            </label>
            <div className="flex space-x-2">
              {Object.values(AspectRatio).map((ratio) => (
                <button
                  key={ratio}
                  type="button"
                  onClick={() => setAspectRatio(ratio)}
                  className={`flex-1 py-2 px-1 text-xs font-semibold rounded-md transition-colors duration-200 ${
                    aspectRatio === ratio
                      ? 'bg-indigo-600 text-white'
                      : 'bg-light-surface dark:bg-dark-surface hover:bg-light-border dark:hover:bg-dark-border border border-light-border dark:border-dark-border'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
        </div>
        <div>
           <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">
              Number of Images
            </label>
            <div className="flex space-x-2">
              {QUANTITY_OPTIONS.map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setQuantity(num)}
                  className={`flex-1 py-2 px-1 text-xs font-semibold rounded-md transition-colors duration-200 ${
                    quantity === num
                      ? 'bg-indigo-600 text-white'
                      : 'bg-light-surface dark:bg-dark-surface hover:bg-light-border dark:hover:bg-dark-border border border-light-border dark:border-dark-border'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
        </div>
      </div>

      <div>
        <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center space-x-2 text-sm font-medium text-indigo-500 hover:text-indigo-600">
            <span>Advanced Settings</span>
            <ChevronDownIcon className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
        </button>
        {showAdvanced && (
            <div className="mt-4 p-4 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="style" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">Style Preset</label>
                    <select id="style" value={style} onChange={(e) => setStyle(e.target.value as ImageStyle)} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md">
                        {Object.values(ImageStyle).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="colors" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">Color Palette</label>
                    <input type="text" id="colors" value={colors} onChange={e => setColors(e.target.value)} placeholder="e.g., neon blue, crimson red" className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md" />
                </div>
                 <div className="md:col-span-1">
                    <ImageUpload label="Character Reference" imageFile={characterImage} setImageFile={setCharacterImage} />
                 </div>
                 <div className="md:col-span-1">
                    <ImageUpload label="Style Inspiration" imageFile={inspirationImage} setImageFile={setInspirationImage} />
                 </div>
            </div>
        )}
      </div>
      
      <div>
        <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center px-6 py-3 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 transition-all duration-300 disabled:bg-indigo-400 disabled:cursor-not-allowed"
        >
            <SparklesIcon className={`mr-2 h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Generating...' : `Generate ${quantity} Image${quantity > 1 ? 's' : ''}`}
        </button>
        {isLoading && (
            <div className="w-full bg-light-border dark:bg-dark-border rounded-full h-2 mt-4 overflow-hidden">
                <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{ width: `${progress}%`, transition: 'width 0.5s ease-in-out' }}
                ></div>
            </div>
        )}
      </div>
    </form>
  );
};