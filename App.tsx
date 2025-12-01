

import React, { useState, useEffect, useRef } from 'react';
import { PromptForm } from './components/PromptForm';
import { ImageDisplay } from './components/ImageDisplay';
import { generateImages } from './services/geminiService';
import { AspectRatio, Theme, Page, ImageStyle } from './types';
import { AuthPage } from './components/AuthPage';
import { ProfilePage, User } from './components/ProfilePage';
import { Sidebar } from './components/Sidebar';
import { MenuIcon } from './components/icons/MenuIcon';
import { AIEnginePage } from './components/AIEnginePage';
import { SparklesIcon } from './components/icons/SparklesIcon';

const fileToBase64 = (file: File): Promise<{ data: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const data = result.split(',')[1];
            resolve({ data, mimeType: file.type });
        };
        reader.onerror = (error) => reject(error);
    });
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.SQUARE);
  const [quantity, setQuantity] = useState<number>(1);
  const [generatedImageUrls, setGeneratedImageUrls] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>('dark');
  const [currentPage, setCurrentPage] = useState<Page>('ai-engine');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  // New state for advanced options
  const [imageStyle, setImageStyle] = useState<ImageStyle>(ImageStyle.NONE);
  const [characterImage, setCharacterImage] = useState<File | null>(null);
  const [inspirationImage, setInspirationImage] = useState<File | null>(null);
  const [colors, setColors] = useState<string>('');


  useEffect(() => {
    // Auth check
    const savedUserJSON = localStorage.getItem('dorak_vision_user');
    if (savedUserJSON) {
        try {
            const savedUser = JSON.parse(savedUserJSON);
            if (savedUser && typeof savedUser === 'object' && 'username' in savedUser && 'email' in savedUser) {
                 setUser(savedUser);
            } else {
                localStorage.removeItem('dorak_vision_user');
            }
        } catch (e) {
            console.error("Failed to parse user from localStorage", e);
            localStorage.removeItem('dorak_vision_user');
        }
    }
    // Theme check
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const initialTheme = savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(initialTheme);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Handle clicks outside of the sidebar on mobile to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsSidebarOpen(false);
      }
    };
    if (isSidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSidebarOpen]);
  
  const handleLogin = (loggedInUser: User) => {
    localStorage.setItem('dorak_vision_user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    setCurrentPage('ai-engine');
  };
  
  const handleLogout = () => {
    localStorage.removeItem('dorak_vision_user');
    // Also clear simulated google user for a full logout
    localStorage.removeItem('dorak_user_google_simulated');
    setUser(null);
    setCurrentPage('ai-engine');
    setIsSidebarOpen(false);
  }

  const handleUpdateUser = (updatedUser: User) => {
      setUser(updatedUser);
      localStorage.setItem('dorak_vision_user', JSON.stringify(updatedUser));
  };

  const handleDeleteAccount = () => {
      if (window.confirm('Are you sure you want to permanently delete your account? This action cannot be undone.')) {
          // Find the user key (could be email or google key) and remove it
          if (user?.email) {
            localStorage.removeItem(`dorak_user_${user.email}`);
          }
          handleLogout();
      }
  };

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleImageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    if (user && user.credits < quantity * 5) {
        setError(`You need ${quantity * 5} credits to generate ${quantity} images, but you only have ${user.credits}. Please purchase more credits from your profile.`);
        return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImageUrls(null);

    try {
      const charImgData = characterImage ? await fileToBase64(characterImage) : null;
      const inspImgData = inspirationImage ? await fileToBase64(inspirationImage) : null;

      const imageUrls = await generateImages(prompt, aspectRatio, quantity, imageStyle, charImgData, inspImgData, colors);
      setGeneratedImageUrls(imageUrls);
      // Deduct credits
      if (user) {
          const updatedUser = { ...user, credits: user.credits - (quantity * 5) };
          handleUpdateUser(updatedUser);
      }
    } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError('An unknown error occurred.');
        }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchToGenerator = (newPrompt: string) => {
    setPrompt(newPrompt);
    setCurrentPage('generator');
  };

  if (!user) {
    return <AuthPage onLogin={handleLogin} />;
  }

  const renderCurrentPage = () => {
      switch (currentPage) {
          case 'ai-engine':
              return <AIEnginePage user={user} onSwitchToGenerator={handleSwitchToGenerator} />;
          case 'profile':
              return <ProfilePage 
                        user={user} 
                        onClose={() => setCurrentPage('ai-engine')} 
                        onUpdateUser={handleUpdateUser} 
                        onDeleteAccount={handleDeleteAccount}
                    />;
          case 'generator':
          default:
              return (
                <main className="py-12 px-6 flex-1 overflow-y-auto">
                    <div className="container mx-auto max-w-4xl flex flex-col items-center space-y-12">
                        <div className="text-center">
                            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">Dorak Imagine</h2>
                        </div>
                        <PromptForm
                          prompt={prompt}
                          setPrompt={setPrompt}
                          aspectRatio={aspectRatio}
                          setAspectRatio={setAspectRatio}
                          quantity={quantity}
                          setQuantity={setQuantity}
                          onSubmit={handleImageSubmit}
                          isLoading={isLoading}
                          style={imageStyle}
                          setStyle={setImageStyle}
                          characterImage={characterImage}
                          setCharacterImage={setCharacterImage}
                          inspirationImage={inspirationImage}
                          setInspirationImage={setInspirationImage}
                          colors={colors}
                          setColors={setColors}
                        />
                        <ImageDisplay
                        imageUrls={generatedImageUrls}
                        isLoading={isLoading}
                        error={error}
                        prompt={prompt}
                        />
                    </div>
                </main>
              );
      }
  }

  return (
    <div className="min-h-screen flex bg-light-bg dark:bg-dark-bg text-light-text-primary dark:text-dark-text-primary font-sans transition-colors duration-300">
      <div ref={sidebarRef}>
        <Sidebar
            user={user}
            theme={theme}
            currentPage={currentPage}
            toggleTheme={toggleTheme}
            handleLogout={handleLogout}
            setCurrentPage={setCurrentPage}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-screen">
          <header className="md:hidden p-4 flex justify-between items-center border-b border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface sticky top-0 z-10">
              <button onClick={() => setCurrentPage('ai-engine')} className="flex items-center space-x-2 text-xl font-bold tracking-tighter">
                <SparklesIcon className="w-6 h-6 text-indigo-500" />
                <span>Dorak</span>
              </button>
              <button onClick={() => setIsSidebarOpen(true)} className="p-2">
                  <MenuIcon className="w-6 h-6" />
              </button>
          </header>
        
          {renderCurrentPage()}
      </div>
    </div>
  );
}