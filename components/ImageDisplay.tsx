import React from 'react';
import { DownloadIcon } from './icons/DownloadIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface ImageDisplayProps {
  imageUrls: string[] | null;
  isLoading: boolean;
  error: string | null;
  prompt: string;
}

const LoadingState: React.FC = () => (
    <div className="flex flex-col items-center justify-center space-y-4">
        <SparklesIcon className="w-12 h-12 text-indigo-400 animate-pulse" />
        <p className="text-light-text-secondary dark:text-dark-text-secondary">Bringing your vision to life...</p>
        <div className="w-full bg-light-border dark:bg-dark-border rounded-full h-2.5">
            <div className="bg-indigo-600 h-2.5 rounded-full animate-pulse" style={{ width: '75%' }}></div>
        </div>
    </div>
);

const InitialState: React.FC = () => (
    <div className="w-full aspect-square bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl flex items-center justify-center p-4 transition-all duration-300 shadow-lg">
        <div className="flex flex-col items-center justify-center text-center">
            <SparklesIcon className="w-16 h-16 text-light-border dark:text-dark-border mb-4" />
            <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">Your masterpiece awaits</h3>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Enter a prompt above to generate an image.</p>
        </div>
    </div>
);

const ImageCard: React.FC<{ imageUrl: string; prompt: string }> = ({ imageUrl, prompt }) => {
    const handleDownload = () => {
        if (!imageUrl) return;
        const link = document.createElement('a');
        link.href = imageUrl;
        const safePrompt = prompt.substring(0, 30).replace(/[^a-z0-9]/gi, '_').toLowerCase();
        link.download = `dorak_vision_${safePrompt}_${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="relative group w-full aspect-square bg-light-surface dark:bg-dark-surface rounded-lg overflow-hidden border border-light-border dark:border-dark-border">
            <img src={imageUrl} alt={prompt} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-lg">
                <button onClick={handleDownload} className="flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors">
                   <DownloadIcon className="w-5 h-5 mr-2" />
                   Download
                </button>
            </div>
        </div>
    );
};

export const ImageDisplay: React.FC<ImageDisplayProps> = ({ imageUrls, isLoading, error, prompt }) => {
    if (isLoading) {
        return (
             <div className="w-full max-w-lg mx-auto aspect-square bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl flex items-center justify-center p-4 transition-all duration-300 shadow-lg">
                <LoadingState />
            </div>
        )
    }

    if (error) {
        return (
            <div className="w-full max-w-lg mx-auto aspect-square bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl flex items-center justify-center p-4 transition-all duration-300 shadow-lg">
                <div className="text-center text-red-500">
                    <p className="font-semibold">Generation Failed</p>
                    <p className="text-sm">{error}</p>
                </div>
            </div>
        )
    }

    if (imageUrls && imageUrls.length > 0) {
        return (
            <div className="w-full max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {imageUrls.map((url, index) => (
                    <ImageCard key={index} imageUrl={url} prompt={prompt} />
                ))}
            </div>
        );
    }
    
    return <InitialState />;
};