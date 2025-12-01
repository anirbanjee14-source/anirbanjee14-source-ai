import React, { useState } from 'react';
import { User } from './ProfilePage';
import { CopyIcon } from './icons/CopyIcon';
import { ChatMessage, Source } from '../types';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { ExternalLinkIcon } from './icons/ExternalLinkIcon';
import { CheckIcon } from './icons/CheckIcon';
import { ExportIcon } from './icons/ExportIcon';
import { ThumbsUpIcon } from './icons/ThumbsUpIcon';
import { ThumbsDownIcon } from './icons/ThumbsDownIcon';


interface ChatMessageProps {
    message: ChatMessage;
    user: User;
    isLoading?: boolean;
    progress?: { stage: string; progress: number } | null;
}

// A new component specifically for rendering code blocks with a header and actions.
const CodeBlock: React.FC<{ language: string; code: string }> = ({ language, code }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleExport = () => {
        const extensionMap: { [key: string]: string } = {
            javascript: 'js',
            python: 'py',
            html: 'html',
            css: 'css',
            typescript: 'ts',
            json: 'json',
            markdown: 'md',
            java: 'java',
            csharp: 'cs',
            php: 'php',
            ruby: 'rb',
            go: 'go',
        };
        const extension = extensionMap[language.toLowerCase()] || 'txt';
        const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `code.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="bg-light-bg dark:bg-dark-bg rounded-md my-2 overflow-hidden border border-light-border dark:border-dark-border">
            <div className="flex justify-between items-center px-3 py-1.5 bg-light-surface dark:bg-dark-surface border-b border-light-border dark:border-dark-border text-xs">
                <span className="font-semibold text-light-text-secondary dark:text-dark-text-secondary capitalize">{language || 'code'}</span>
                <div className="flex items-center space-x-3">
                    <button onClick={handleExport} className="flex items-center space-x-1 text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors">
                        <ExportIcon className="w-3.5 h-3.5" />
                        <span>Export</span>
                    </button>
                    <button onClick={handleCopy} className="flex items-center space-x-1 text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors">
                        {copied ? <CheckIcon className="w-3.5 h-3.5 text-green-500" /> : <CopyIcon className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                </div>
            </div>
            <pre className="p-3 overflow-x-auto text-sm text-light-text-primary dark:text-dark-text-primary font-mono">
                <code>{code}</code>
            </pre>
        </div>
    );
};


// A simple but effective markdown-to-JSX converter
const renderMarkdown = (text: string) => {
    // Escape HTML to prevent XSS, except for our specific tags
    const escapeHtml = (unsafe: string) => 
        unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");

    // Process blocks first (code, lists)
    const blocks = text.split(/(```[\s\S]*?```|(?:\n|^)(?:[\*\-]\s.*|\d+\.\s.*)+)/g);

    return blocks.map((block, index) => {
        if (!block) return null;
        // Code blocks
        if (block.startsWith('```')) {
            const lines = block.trim().split('\n');
            const firstLine = lines[0] || '```';
            const language = firstLine.substring(3).trim().toLowerCase();
            const code = lines.length > 1 ? lines.slice(1, -1).join('\n') : '';
            return <CodeBlock key={index} language={language} code={code} />;
        }

        // List blocks
        if (block.match(/^(?:\n|^)(?:[\*\-]\s.*|\d+\.\s.*)+/)) {
            const listItems = block.trim().split('\n').map((item, i) => {
                const content = item.replace(/^([\*\-]\s|\d+\.\s)/, '');
                 // Inline formatting for list items
                const formattedContent = escapeHtml(content)
                    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-indigo-400 hover:underline">$1</a>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>');
                return <li key={i} dangerouslySetInnerHTML={{ __html: formattedContent }} />;
            });
            const isOrdered = /^\d+\.\s/.test(block.trim());
            if (isOrdered) return <ol key={index} className="list-decimal pl-5 space-y-1 my-2">{listItems}</ol>;
            return <ul key={index} className="list-disc pl-5 space-y-1 my-2">{listItems}</ul>;
        }

        // Process remaining text for headings and paragraphs with inline formatting
        const lines = block.split('\n');
        return lines.map((line, lineIndex) => {
            if (!line.trim()) return null;
            
            const formattedLine = escapeHtml(line)
                .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-indigo-400 hover:underline">$1</a>')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>');

            if (line.startsWith('###### ')) {
                return <h6 key={`${index}-${lineIndex}`} className="text-md font-bold mt-2" dangerouslySetInnerHTML={{ __html: formattedLine.substring(7) }} />;
            }
             if (line.startsWith('##### ')) {
                return <h5 key={`${index}-${lineIndex}`} className="text-lg font-bold mt-2 mb-1" dangerouslySetInnerHTML={{ __html: formattedLine.substring(6) }} />;
            }
             if (line.startsWith('#### ')) {
                return <h4 key={`${index}-${lineIndex}`} className="text-xl font-bold mt-2 mb-1" dangerouslySetInnerHTML={{ __html: formattedLine.substring(5) }} />;
            }
             if (line.startsWith('### ')) {
                return <h3 key={`${index}-${lineIndex}`} className="text-2xl font-bold mt-3 mb-1" dangerouslySetInnerHTML={{ __html: formattedLine.substring(4) }} />;
            }
            if (line.startsWith('## ')) {
                return <h2 key={`${index}-${lineIndex}`} className="text-3xl font-bold mt-3 mb-1" dangerouslySetInnerHTML={{ __html: formattedLine.substring(3) }} />;
            }
            if (line.startsWith('# ')) {
                return <h1 key={`${index}-${lineIndex}`} className="text-4xl font-bold mt-4 mb-2" dangerouslySetInnerHTML={{ __html: formattedLine.substring(2) }} />;
            }
            
            return <p key={`${index}-${lineIndex}`} className="my-1" dangerouslySetInnerHTML={{ __html: formattedLine }} />;
        });
    });
};

export const ChatMessageComponent: React.FC<ChatMessageProps> = ({ message, isLoading = false, progress = null }) => {
    const { role, parts, sources } = message;
    const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);

    const textContent = parts.map(p => p.text).filter(Boolean).join('');

    const renderLoadingState = () => {
        if (progress) {
            return (
                <div className="w-64 p-1">
                    <p className="text-sm font-medium mb-1.5 text-light-text-secondary dark:text-dark-text-secondary">{progress.stage}</p>
                    <div className="w-full bg-light-border dark:bg-dark-border rounded-full h-1.5">
                        <div className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress.progress}%` }}></div>
                    </div>
                </div>
            );
        }
        return (
            <div className="flex items-center space-x-2">
                <SpinnerIcon className="w-5 h-5" /> 
                <span>Thinking...</span>
            </div>
        );
    };

    return (
        <div className={`flex my-4 ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex flex-col max-w-2xl ${role === 'user' ? 'items-end' : 'items-start'}`}>
                {parts.map((part, index) => {
                    if (part.inlineData) {
                        const isVideo = part.inlineData.mimeType.startsWith('video/');
                        return (
                            <div key={index} className="mb-2 rounded-lg overflow-hidden border border-light-border dark:border-dark-border">
                                {isVideo ? (
                                    <video
                                        src={`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`}
                                        controls
                                        className="max-w-xs max-h-64 object-contain"
                                    />
                                ) : (
                                    <img
                                        src={`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`}
                                        alt="User upload"
                                        className="max-w-xs max-h-64 object-contain"
                                    />
                                )}
                            </div>
                        );
                    }
                    return null;
                })}

                {(textContent || isLoading) && (
                     <div className={`p-3 rounded-2xl relative group ${role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-bl-none'}`}>
                        <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-0 prose-headings:my-2 prose-ul:my-2 prose-ol:my-2">
                           {isLoading ? renderLoadingState() : renderMarkdown(textContent)}
                        </div>
                    </div>
                )}
                
                {role === 'model' && !isLoading && textContent && (
                    <div className="flex items-center space-x-2 mt-2 ml-1">
                        <button 
                            onClick={() => setFeedback(prev => prev === 'like' ? null : 'like')}
                            className={`p-1 rounded-md text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-border dark:hover:bg-dark-border ${feedback === 'like' ? 'text-indigo-500 bg-indigo-500/10' : ''}`}
                        >
                            <ThumbsUpIcon className="w-4 h-4" />
                        </button>
                         <button 
                            onClick={() => setFeedback(prev => prev === 'dislike' ? null : 'dislike')}
                            className={`p-1 rounded-md text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-border dark:hover:bg-dark-border ${feedback === 'dislike' ? 'text-red-500 bg-red-500/10' : ''}`}
                        >
                            <ThumbsDownIcon className="w-4 h-4" />
                        </button>
                    </div>
                )}


                {sources && sources.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-light-border dark:border-dark-border max-w-2xl w-full">
                        <h4 className="text-sm font-semibold mb-2 text-light-text-secondary dark:text-dark-text-secondary">Sources</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {sources.map((source, i) => (
                                <a href={source.uri} target="_blank" rel="noopener noreferrer" key={i} className="text-xs p-2 rounded-md bg-light-surface dark:bg-dark-surface hover:bg-light-border dark:hover:bg-dark-border border border-light-border dark:border-dark-border flex items-start space-x-2 overflow-hidden">
                                    <ExternalLinkIcon className="w-3 h-3 mt-0.5 flex-shrink-0 text-light-text-secondary dark:text-dark-text-secondary" />
                                    <span className="truncate" title={source.title}>{source.title || source.uri}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};