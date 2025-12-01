

import React from 'react';
import { User } from './ProfilePage';
import { Theme, Page } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { CloseIcon } from './icons/CloseIcon';
import { UserIcon } from './icons/UserIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import { BotIcon } from './icons/BotIcon';

const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m4.93 19.07 1.41-1.41"/><path d="m17.66 6.34 1.41-1.41"/></svg>
);

const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
);


interface SidebarProps {
    user: User;
    theme: Theme;
    currentPage: Page;
    toggleTheme: () => void;
    handleLogout: () => void;
    setCurrentPage: (page: Page) => void;
    isSidebarOpen: boolean;
    setIsSidebarOpen: (isOpen: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
    user,
    theme,
    currentPage,
    toggleTheme,
    handleLogout,
    setCurrentPage,
    isSidebarOpen,
    setIsSidebarOpen,
}) => {
    const navLinkClasses = "w-full text-left flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200";
    const activeClasses = "bg-light-border dark:bg-dark-border text-light-text-primary dark:text-dark-text-primary";
    const inactiveClasses = "text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-border dark:hover:bg-dark-border";
    
    return (
        <aside className={`fixed md:relative md:translate-x-0 top-0 left-0 h-full z-30 w-64 bg-light-surface dark:bg-dark-surface border-r border-light-border dark:border-dark-border flex flex-col transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex items-center justify-between p-4 border-b border-light-border dark:border-dark-border">
                <button onClick={() => { setCurrentPage('ai-engine'); setIsSidebarOpen(false); }} className="flex items-center space-x-2">
                    <SparklesIcon className="w-6 h-6 text-indigo-500" />
                    <span className="text-xl font-bold tracking-tighter">Dorak</span>
                </button>
                <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-1">
                    <CloseIcon className="w-6 h-6" />
                </button>
            </div>
            
            <nav className="flex-1 p-4 space-y-2">
                <button 
                    onClick={() => { setCurrentPage('ai-engine'); setIsSidebarOpen(false); }} 
                    className={`${navLinkClasses} ${currentPage === 'ai-engine' ? activeClasses : inactiveClasses}`}
                >
                    <BotIcon className="w-5 h-5 mr-3" />
                    AI Engine
                </button>
                <button 
                    onClick={() => { setCurrentPage('generator'); setIsSidebarOpen(false); }} 
                    className={`${navLinkClasses} ${currentPage === 'generator' ? activeClasses : inactiveClasses}`}
                >
                    <SparklesIcon className="w-5 h-5 mr-3" />
                    Image Generator
                </button>
            </nav>

            <div className="p-4 border-t border-light-border dark:border-dark-border">
                <button onClick={toggleTheme} className="w-full flex items-center justify-between p-2 rounded-md hover:bg-light-border dark:hover:bg-dark-border transition-colors">
                     <span className="text-sm font-medium">Toggle Theme</span>
                    {theme === 'light' ? <MoonIcon /> : <SunIcon />}
                </button>
                <div className="mt-4 p-3 bg-light-bg dark:bg-dark-bg rounded-lg">
                    <div className="flex items-center mb-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm mr-3 flex-shrink-0">
                            {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{user.username}</p>
                            <div className="flex items-center mt-1">
                                <SparklesIcon className="w-4 h-4 mr-1.5 text-indigo-400 flex-shrink-0" />
                                <p className="text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary">
                                    <span className="font-bold text-light-text-primary dark:text-dark-text-primary">{user.credits}</span> credits
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col space-y-1 mt-3">
                        <button 
                            onClick={() => { setCurrentPage('profile'); setIsSidebarOpen(false); }} 
                            className={`w-full text-left flex items-center px-2 py-1.5 text-xs rounded-md hover:bg-light-border dark:hover:bg-dark-border ${currentPage === 'profile' ? 'text-indigo-500' : ''}`}
                        >
                            <UserIcon className="w-4 h-4 mr-2" />
                            My Profile
                        </button>
                        <button 
                            onClick={handleLogout} 
                            className="w-full text-left flex items-center px-2 py-1.5 text-xs rounded-md text-red-600 dark:text-red-500 hover:bg-light-border dark:hover:bg-dark-border"
                        >
                            <LogoutIcon className="w-4 h-4 mr-2" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
};