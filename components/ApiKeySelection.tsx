
import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

interface ApiKeySelectionProps {
  onSelectKey: () => void;
}

export const ApiKeySelection: React.FC<ApiKeySelectionProps> = ({ onSelectKey }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-light-bg dark:bg-dark-bg text-light-text-primary dark:text-dark-text-primary p-4">
      <div className="w-full max-w-md p-8 text-center bg-light-surface dark:bg-dark-surface rounded-2xl shadow-2xl border border-light-border dark:border-dark-border">
        <SparklesIcon className="w-16 h-16 mx-auto mb-6 text-indigo-500" />
        <h1 className="text-3xl font-bold mb-4">API Key Required</h1>
        <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">
          To use the high-quality image generation model (gemini-3-pro-image-preview), you must select a paid API key from a Google Cloud project.
        </p>
        <button
          onClick={onSelectKey}
          className="w-full px-6 py-3 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 transition-all duration-300"
        >
          Select Your API Key
        </button>
        <p className="mt-4 text-xs text-light-text-secondary dark:text-dark-text-secondary">
          This is required for billing purposes. For more information, please visit the{' '}
          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">
            official billing documentation
          </a>.
        </p>
      </div>
    </div>
  );
};
