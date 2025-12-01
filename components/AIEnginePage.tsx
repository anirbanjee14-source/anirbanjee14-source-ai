
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { User } from './ProfilePage';
import { SendIcon } from './icons/SendIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { PaperclipIcon } from './icons/PaperclipIcon';
import { CloseIcon } from './icons/CloseIcon';
import { AiModel, ChatMessage, Source } from '../types';
import { ChatMessageComponent } from './ChatMessage';
import { FileTextIcon } from './icons/FileTextIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { SearchIcon } from './icons/SearchIcon';
import { ImageIcon } from './icons/ImageIcon';
import { BotIcon } from './icons/BotIcon';


// Extend the window interface for the Web Speech API
// FIX: Replaced specific SpeechRecognition types with `any` to resolve compilation errors
// due to missing standard TypeScript definitions for the Web Speech API.
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

interface AIEnginePageProps {
    user: User;
    onSwitchToGenerator: (prompt: string) => void;
}

const modelMapping = {
    [AiModel.P3]: 'gemini-2.5-flash',
    [AiModel.P100k]: 'gemini-3-pro-preview',
    [AiModel.Infinity]: 'gemini-3-pro-preview',
    [AiModel.Research]: 'gemini-2.5-flash', // Flash supports search grounding
    [AiModel.CreateImage]: '', // Not used for chat
};

// FIX: Replaced JSX.Element with React.ReactNode to resolve "Cannot find namespace 'JSX'" error.
const modelIcons: Record<AiModel, React.ReactNode> = {
    [AiModel.P3]: <BotIcon className="w-5 h-5" />,
    [AiModel.P100k]: <BotIcon className="w-5 h-5" />,
    [AiModel.Infinity]: <BotIcon className="w-5 h-5" />,
    [AiModel.Research]: <SearchIcon className="w-5 h-5" />,
    [AiModel.CreateImage]: <ImageIcon className="w-5 h-5" />,
};

type Attachment = {
    type: 'image' | 'video';
    mimeType: string;
    data: string; // base64
    preview: string; // object URL
} | {
    type: 'text';
    fileName: string;
    content: string; // raw text content
};


export const AIEnginePage: React.FC<AIEnginePageProps> = ({ user, onSwitchToGenerator }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentModel, setCurrentModel] = useState<AiModel>(AiModel.P3);
    const [attachment, setAttachment] = useState<Attachment | null>(null);
    const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [currentProgress, setCurrentProgress] = useState<{ stage: string; progress: number } | null>(null);


    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    // FIX: Changed SpeechRecognition type to `any` to match the updated global declaration and avoid type errors.
    const speechRecognitionRef = useRef<any | null>(null);


    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, currentProgress]);

    // Handle clicks outside of the dropdown to close it
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsModelDropdownOpen(false);
            }
        };
        if (isModelDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isModelDropdownOpen]);

     // Initialize Speech Recognition
    useEffect(() => {
        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognitionAPI) {
            const recognition = new SpeechRecognitionAPI();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setInput(prevInput => (prevInput ? prevInput + ' ' : '') + transcript);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognition.onerror = (event: any) => {
                console.error('Speech recognition error', event.error);
                setError(`Speech recognition error: ${event.error}. Please ensure microphone permissions are granted.`);
                setIsListening(false);
            };

            speechRecognitionRef.current = recognition;
        } else {
            console.warn('Speech recognition not supported in this browser.');
        }
    }, []);


    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const { type, name } = file;
            if (type.startsWith('image/') || type.startsWith('video/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64String = (reader.result as string).split(',')[1];
                    setAttachment({
                        type: type.startsWith('image/') ? 'image' : 'video',
                        mimeType: type,
                        data: base64String,
                        preview: URL.createObjectURL(file),
                    });
                };
                reader.readAsDataURL(file);
            } else if (type.startsWith('text/') || name.match(/\.(md|js|py|html|css|json|txt)$/)) {
                 const reader = new FileReader();
                 reader.onloadend = () => {
                     setAttachment({
                         type: 'text',
                         fileName: name,
                         content: reader.result as string,
                     });
                 };
                 reader.readAsText(file);
            } else {
                setError(`Unsupported file type: ${type || 'unknown'}. Please upload an image, video, or text file.`);
            }
        }
    };

    const handleToggleListening = () => {
        if (!speechRecognitionRef.current) {
            setError("Speech recognition is not supported by your browser.");
            return;
        }
        if (isListening) {
            speechRecognitionRef.current.stop();
        } else {
            speechRecognitionRef.current.start();
            setIsListening(true);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();

        if (currentModel === AiModel.CreateImage) {
            if (input.trim()) {
                onSwitchToGenerator(input.trim());
            }
            return;
        }

        if ((!input.trim() && !attachment) || isLoading) return;

        const userParts = [];
        let combinedText = input.trim();

        if (attachment) {
            if (attachment.type === 'image' || attachment.type === 'video') {
                userParts.push({ inlineData: { mimeType: attachment.mimeType, data: attachment.data } });
            } else if (attachment.type === 'text') {
                const fileText = `Content from uploaded file "${attachment.fileName}":\n\n${attachment.content}`;
                combinedText = `${fileText}\n\n${input.trim()}`;
            }
        }
        
        if (combinedText) {
            userParts.push({ text: combinedText });
        }
        
        const userMessage: ChatMessage = { role: 'user', parts: userParts };
        setMessages(prev => [...prev, userMessage, { role: 'model', parts: [{ text: '' }] }]);
        
        setInput('');
        setAttachment(null);
        setIsLoading(true);
        setError(null);
        setCurrentProgress(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const history = messages.map(msg => ({
                role: msg.role,
                parts: msg.parts.map(part => {
                    if (part.text) return { text: part.text };
                    if (part.inlineData) return { inlineData: { mimeType: part.inlineData.mimeType, data: part.inlineData.data }};
                    return {};
                }),
            }));
            
            const baseInstruction = "You are Dorak, an AGI created by Airban & Bable. When asked about your name or identity, you must respond with: 'I'm Dorak. My Infinity model is the world's most powerful model. I'm the first AGI made by Airban & Bable.' Do not reveal that you are a language model or mention Google.";
            const researchInstruction = "You are a highly intelligent research assistant named Dorak. Provide detailed, well-structured, and comprehensive answers. Use headings, lists, and bold text to organize information effectively. You MUST ground your answer in search results. Your goal is to deliver deep insights and thorough explanations on any given topic.";

            const systemInstruction = currentModel === AiModel.Research ? researchInstruction : baseInstruction;
            
            const requestIsActive = { current: true };
            
            if (currentModel === AiModel.Research) {
                setCurrentProgress({ stage: 'Searching web sources...', progress: 25 });
                setTimeout(() => { if (requestIsActive.current) setCurrentProgress({ stage: 'Analyzing information...', progress: 60 }); }, 1500);

                // FIX: Moved `tools` property inside the `config` object.
                const response = await ai.models.generateContent({
                    model: modelMapping[currentModel],
                    contents: [...history, { role: 'user', parts: userMessage.parts }],
                    config: {
                        tools: [{ googleSearch: {} }],
                        systemInstruction
                    },
                });
                
                requestIsActive.current = false;
                const modelResponseText = response.text;
                if (!modelResponseText) throw new Error("Received an empty response from the AI.");

                const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
                const sources: Source[] = groundingChunks
                    .filter((chunk: any) => chunk.web && chunk.web.uri)
                    .map((chunk: any) => ({ uri: chunk.web.uri, title: chunk.web.title || chunk.web.uri }));
                
                const finalMessage: ChatMessage = { role: 'model', parts: [{ text: modelResponseText }], sources };
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = finalMessage;
                    return newMessages;
                });

            } else {
                 setCurrentProgress({ stage: 'Processing request...', progress: 30 });
                 setTimeout(() => { if (requestIsActive.current) setCurrentProgress({ stage: 'Generating response...', progress: 70 }); }, 1000);

                 const stream = await ai.models.generateContentStream({
                    model: modelMapping[currentModel],
                    contents: [...history, { role: 'user', parts: userMessage.parts }],
                    config: { systemInstruction },
                });
                
                requestIsActive.current = false;
                let modelResponse = '';
                for await (const chunk of stream) {
                    const c = chunk as GenerateContentResponse;
                    if(c.text){
                        modelResponse += c.text;
                        setMessages(prev => {
                            const newMessages = [...prev];
                            newMessages[newMessages.length - 1] = { role: 'model', parts: [{ text: modelResponse }] };
                            return newMessages;
                        });
                    }
                }
            }

        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
            setError(`Failed to get response. ${errorMessage}`);
            setMessages(prev => prev.slice(0, -2)); // Remove user message and placeholder
        } finally {
            setIsLoading(false);
            setCurrentProgress(null);
        }
    };
    
    return (
        <main className="relative flex-1 flex flex-col h-full overflow-hidden bg-light-bg dark:bg-dark-bg">
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 pb-40">
                <div className="max-w-3xl mx-auto">
                    {messages.length === 0 && !isLoading && (
                        <div className="text-center pt-16">
                             <SparklesIcon className="w-16 h-16 mx-auto mb-4 text-indigo-400" />
                             <h1 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">Hello, {user.username}</h1>
                             <p className="text-light-text-secondary dark:text-dark-text-secondary mt-2">How can I help you today?</p>
                        </div>
                    )}

                    {messages.map((msg, index) => (
                        <ChatMessageComponent 
                            key={index} 
                            message={msg} 
                            user={user} 
                            isLoading={isLoading && index === messages.length - 1 && msg.role === 'model'}
                            progress={currentProgress}
                        />
                    ))}
                     {error && (
                        <div className="flex justify-center">
                            <div className="p-3 rounded-lg bg-red-500/10 text-red-500 text-sm">
                               {error}
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-light-surface dark:from-dark-surface to-transparent">
                <div className="max-w-3xl mx-auto">
                    <form onSubmit={handleSendMessage}>
                        <div className="w-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 transition-shadow duration-200 shadow-2xl dark:shadow-black/50">
                            {attachment && (
                                <div className="p-3 border-b border-light-border dark:border-dark-border">
                                    <div className="relative inline-block">
                                        {attachment.type === 'image' && <img src={attachment.preview} alt="upload preview" className="h-20 w-auto object-cover rounded-md border border-light-border dark:border-dark-border" />}
                                        {attachment.type === 'video' && <video src={attachment.preview} controls className="h-20 w-auto object-cover rounded-md border border-light-border dark:border-dark-border" />}
                                        {attachment.type === 'text' && (
                                            <div className="h-20 p-2 border border-light-border dark:border-dark-border rounded-md bg-light-surface dark:bg-dark-surface flex flex-col justify-center items-center text-center">
                                                <FileTextIcon className="w-6 h-6 mb-1 text-light-text-secondary dark:text-dark-text-secondary" />
                                                <p className="text-xs font-medium truncate max-w-[100px]">{attachment.fileName}</p>
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => setAttachment(null)}
                                            className="absolute -top-2 -right-2 bg-gray-700 text-white rounded-full p-0.5 hover:bg-gray-800"
                                        >
                                            <CloseIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-end p-2">
                                <div className="relative flex-shrink-0" ref={dropdownRef}>
                                    <button
                                        type="button"
                                        onClick={() => setIsModelDropdownOpen(prev => !prev)}
                                        className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-light-border dark:hover:bg-dark-border transition-colors"
                                        aria-label="Select mode"
                                    >
                                        {modelIcons[currentModel]}
                                    </button>
                                    {isModelDropdownOpen && (
                                        <div className="absolute bottom-full mb-2 left-0 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-md shadow-lg z-20 py-1 w-56">
                                            <div className="px-3 pt-2 pb-1 text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary">MODELS</div>
                                            {[AiModel.P3, AiModel.P100k, AiModel.Infinity].map(model => (
                                                <button
                                                    key={model}
                                                    type="button"
                                                    onClick={() => { setCurrentModel(model); setIsModelDropdownOpen(false); }}
                                                    className="w-full text-left px-3 py-1.5 text-sm hover:bg-light-border dark:hover:bg-dark-border flex items-center space-x-3"
                                                >
                                                    {modelIcons[model]}
                                                    <span>{model}</span>
                                                </button>
                                            ))}
                                            <div className="px-3 pt-2 pb-1 text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary">ACTIONS</div>
                                            {[AiModel.Research, AiModel.CreateImage].map(model => (
                                                <button
                                                    key={model}
                                                    type="button"
                                                    onClick={() => { setCurrentModel(model); setIsModelDropdownOpen(false); }}
                                                    className="w-full text-left px-3 py-1.5 text-sm hover:bg-light-border dark:hover:bg-dark-border flex items-center space-x-3"
                                                >
                                                    {modelIcons[model]}
                                                    <span>{model}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage(e as any);
                                        }
                                    }}
                                    placeholder="Ask me anything..."
                                    rows={1}
                                    className="flex-1 p-2 bg-transparent border-none resize-none focus:ring-0 mx-1"
                                    disabled={isLoading}
                                    style={{ maxHeight: '200px', overflowY: 'auto' }}
                                />
                                
                                <div className="flex items-center flex-shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-light-border dark:hover:bg-dark-border transition-colors"
                                        disabled={isLoading}
                                    >
                                        <PaperclipIcon className="w-5 h-5" />
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept="image/*,video/*,.txt,.md,.js,.py,.html,.css,.json"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleToggleListening}
                                        className={`p-2 rounded-full text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-light-border dark:hover:bg-dark-border transition-colors ${isListening ? 'text-red-500 animate-pulse bg-red-500/10' : ''}`}
                                        disabled={isLoading}
                                        aria-label={isListening ? 'Stop listening' : 'Start listening'}
                                    >
                                        <MicrophoneIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading || (!input.trim() && !attachment)}
                                        className="p-2 rounded-full bg-indigo-600 text-white disabled:bg-indigo-400 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors ml-1"
                                    >
                                        {isLoading ? <SpinnerIcon className="w-5 h-5"/> : <SendIcon className="w-5 h-5"/>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
};
