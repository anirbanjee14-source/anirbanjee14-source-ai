
import React, { useState } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { GoogleIcon } from './icons/GoogleIcon';
import { MailIcon } from './icons/MailIcon';
import { LockIcon } from './icons/LockIcon';
import { UserIcon } from './icons/UserIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { User } from './ProfilePage';

interface AuthPageProps {
    onLogin: (user: User) => void;
}

type View = 'login' | 'signup' | 'forgotPassword' | 'awaitingReset' | 'resettingPassword';

interface PasswordStrength {
    score: number; // 0 to 4
    text: string;
    color: string;
    textColor: string;
}


export const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
    const [view, setView] = useState<View>('login');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [awaitingVerificationEmail, setAwaitingVerificationEmail] = useState<string | null>(null);
    const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
    const [resetEmail, setResetEmail] = useState<string>('');
    const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({ score: 0, text: '', color: '', textColor: '' });
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);


    // NOTE: This is a client-side simulation of authentication.
    // In a real application, this logic would be handled by a secure backend server.
    const clearFormState = () => {
        setEmail('');
        setUsername('');
        setPassword('');
        setConfirmPassword('');
        setError(null);
        setSuccess(null);
        setUnverifiedEmail(null);
        setPasswordStrength({ score: 0, text: '', color: '', textColor: '' });
    };

    const calculatePasswordStrength = (pass: string): PasswordStrength => {
        let score = 0;
        if (!pass) return { score: 0, text: '', color: '', textColor: '' };
        
        const hasNumbers = /\d/.test(pass);
        const hasLetters = /[a-zA-Z]/.test(pass);
        const hasSpecial = /[^A-Za-z0-9]/.test(pass);
        const hasUpper = /[A-Z]/.test(pass);
        const hasLower = /[a-z]/.test(pass);

        if (pass.length >= 8) score++;
        if (hasNumbers && hasLetters) score++;
        if (hasSpecial) score++;
        if (hasUpper && hasLower) score++;
        if (pass.length >= 12) score++;

        let text = '', color = '', textColor = '';
        switch (score) {
            case 0:
            case 1:
                text = 'Weak'; color = 'bg-red-500'; textColor = 'text-red-500'; break;
            case 2:
            case 3:
                text = 'Medium'; color = 'bg-yellow-500'; textColor = 'text-yellow-500'; break;
            case 4:
            case 5:
                text = 'Strong'; color = 'bg-green-500'; textColor = 'text-green-500'; break;
            default:
                break;
        }

        return { score, text, color, textColor };
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        setPasswordStrength(calculatePasswordStrength(newPassword));
    };

    const handleGoogleLogin = () => {
        setIsGoogleLoading(true);
        setError(null);
        setSuccess(null);
    
        setTimeout(() => {
            const googleUserKey = 'dorak_user_google_simulated';
            const storedUserJSON = localStorage.getItem(googleUserKey);
    
            if (storedUserJSON) {
                const user = JSON.parse(storedUserJSON);
                onLogin(user);
            } else {
                const name = window.prompt("This is a simulated Google login. Please enter your name to create a persistent simulated account:");
    
                if (name && name.trim()) {
                    const newUser: User = {
                        username: name.trim(),
                        email: `${name.trim().replace(/\s+/g, '.').toLowerCase()}@simulated-google.com`,
                        password: 'simulated_google_password', // Placeholder password
                        credits: 25,
                        verified: true,
                    };
                    localStorage.setItem(googleUserKey, JSON.stringify(newUser));
                    // Also set the main user key so profile page can find it
                    localStorage.setItem('dorak_vision_user', JSON.stringify(newUser));
                    onLogin(newUser);
                } else {
                    setError("Simulated Google sign-in was cancelled.");
                    setIsGoogleLoading(false);
                }
            }
        }, 1000);
    }

    const handleVerifyEmail = (userEmail: string) => {
        const userKey = `dorak_user_${userEmail}`;
        const storedUser = localStorage.getItem(userKey);
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            userData.verified = true;
            localStorage.setItem(userKey, JSON.stringify(userData));
            setAwaitingVerificationEmail(null);
            setView('login');
            setSuccess("Email verified successfully! You can now log in.");
        }
    };

    const handleForgotPassword = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        const userKey = `dorak_user_${email.trim()}`;
        const storedUser = localStorage.getItem(userKey);
        if (storedUser) {
            setResetEmail(email.trim());
            setView('awaitingReset');
        } else {
            setError("No account found with this email.");
        }
    };

    const handleResetPassword = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (passwordStrength.score < 3) {
             setError("Please choose a stronger password.");
             return;
        }
        const userKey = `dorak_user_${resetEmail}`;
        const storedUser = localStorage.getItem(userKey);
        if (storedUser) {
             const userData = JSON.parse(storedUser);
             userData.password = password;
             localStorage.setItem(userKey, JSON.stringify(userData));
        }

        setView('login');
        setSuccess("Password has been reset successfully. Please log in.");
        clearFormState();
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setUnverifiedEmail(null);
        const userKey = `dorak_user_${email.trim()}`;

        if (view === 'signup') {
            if (password !== confirmPassword) {
                setError("Passwords do not match.");
                return;
            }
            if (passwordStrength.score < 3) { 
                setError("Password is not strong enough.");
                return;
            }
             // Check if user already exists
            if (localStorage.getItem(userKey)) {
                setError("An account with this email already exists. Please log in.");
                return;
            }
            const newUserData: User = {
                username: username.trim(), 
                email: email.trim(),
                password: password,
                verified: false, 
                credits: 25,
            };
            localStorage.setItem(userKey, JSON.stringify(newUserData));
            setAwaitingVerificationEmail(email.trim());
        } else { // Login mode
            const storedUser = localStorage.getItem(userKey);
            if (storedUser) {
                const userData = JSON.parse(storedUser);
                if (userData.password !== password) {
                    setError("Incorrect password.");
                    return;
                }
                if (userData.verified) {
                    // Set main user key for App.tsx to find
                    localStorage.setItem('dorak_vision_user', JSON.stringify(userData));
                    onLogin(userData);
                } else {
                    setError("Account not verified. Please check your email.");
                    setUnverifiedEmail(email.trim());
                }
            } else {
                setError("No account found with this email. Please sign up.");
            }
        }
    };
    
    // Conditional rendering based on view state
    if (awaitingVerificationEmail) {
        return (
             <div className="flex flex-col items-center justify-center min-h-screen bg-light-bg dark:bg-dark-bg text-light-text-primary dark:text-dark-text-primary p-4">
                <div className="w-full max-w-md p-8 text-center bg-light-surface dark:bg-dark-surface rounded-2xl shadow-2xl border border-light-border dark:border-dark-border">
                    <MailIcon className="w-12 h-12 mx-auto mb-4 text-indigo-500" />
                    <h1 className="text-2xl font-bold mb-4">Check Your Inbox</h1>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">
                        We've sent a (simulated) verification email to <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">{awaitingVerificationEmail}</span>. Please click the link in the email to activate your account.
                    </p>
                    <button
                        onClick={() => handleVerifyEmail(awaitingVerificationEmail)}
                        className="w-full py-3 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 transition-all"
                    >
                       Verify Email (Simulated)
                    </button>
                </div>
            </div>
        )
    }

    if (view === 'forgotPassword' || view === 'awaitingReset' || view === 'resettingPassword') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-light-bg dark:bg-dark-bg text-light-text-primary dark:text-dark-text-primary p-4">
                <div className="w-full max-w-md p-8 bg-light-surface dark:bg-dark-surface rounded-2xl shadow-2xl border border-light-border dark:border-dark-border">
                    {view === 'forgotPassword' && (
                        <>
                            <h1 className="text-2xl font-bold mb-2 text-center">Forgot Password?</h1>
                            <p className="text-center text-light-text-secondary dark:text-dark-text-secondary mb-6">Enter your email to receive a reset link.</p>
                            <form onSubmit={handleForgotPassword} className="space-y-4">
                                <div className="relative">
                                    <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required className="w-full p-3 pl-10 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg" />
                                </div>
                                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                                <button type="submit" className="w-full py-3 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Send Reset Link</button>
                                <button type="button" onClick={() => { setView('login'); clearFormState(); }} className="w-full text-center text-sm text-indigo-500 hover:underline">Back to Login</button>
                            </form>
                        </>
                    )}
                    {view === 'awaitingReset' && (
                        <div className="text-center">
                            <MailIcon className="w-12 h-12 mx-auto mb-4 text-indigo-500" />
                            <h1 className="text-2xl font-bold mb-4">Check Your Inbox</h1>
                            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">We've sent a password reset link to <span className="font-semibold">{resetEmail}</span>.</p>
                            <button onClick={() => setView('resettingPassword')} className="w-full py-3 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Reset Your Password (Simulated)</button>
                        </div>
                    )}
                    {view === 'resettingPassword' && (
                        <>
                            <h1 className="text-2xl font-bold mb-4 text-center">Create a New Password</h1>
                            <form onSubmit={handleResetPassword} className="space-y-4">
                                <div className="relative">
                                    <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input type="password" value={password} onChange={handlePasswordChange} placeholder="New Password" required className="w-full p-3 pl-10 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg" />
                                </div>
                                {password.length > 0 && (
                                    <div className="flex items-center space-x-2">
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                            <div className={`h-1.5 rounded-full ${passwordStrength.color}`} style={{ width: `${passwordStrength.score * 20}%` }}></div>
                                        </div>
                                        <span className={`text-xs font-semibold ${passwordStrength.textColor}`}>{passwordStrength.text}</span>
                                    </div>
                                )}
                                <div className="relative">
                                    <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm New Password" required className="w-full p-3 pl-10 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg" />
                                </div>
                                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                                <button type="submit" className="w-full py-3 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Set New Password</button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        );
    }
    

    const AuthForm = (
        <form onSubmit={handleSubmit} className="space-y-4">
             <div className="relative">
                <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required
                    className="w-full p-3 pl-10 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>
            {view === 'signup' && (
                 <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required
                        className="w-full p-3 pl-10 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
            )}
             <div>
                <div className="relative">
                    <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="password" value={password} onChange={view === 'signup' ? handlePasswordChange : (e) => setPassword(e.target.value)} placeholder="Password" required
                        className="w-full p-3 pl-10 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                {view === 'signup' && password.length > 0 && (
                    <div className="mt-2 flex items-center space-x-2">
                        <div className="w-full bg-light-border dark:bg-dark-border rounded-full h-1.5">
                            <div className={`h-1.5 rounded-full transition-all duration-300 ${passwordStrength.color}`} style={{ width: `${passwordStrength.score * 20}%` }}></div>
                        </div>
                        <span className={`text-xs font-semibold whitespace-nowrap ${passwordStrength.textColor}`}>{passwordStrength.text}</span>
                    </div>
                )}
            </div>
            {view === 'signup' && (
                 <div className="relative">
                    <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm Password" required
                        className="w-full p-3 pl-10 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
            )}
            {view === 'login' && (
                <div className="text-right">
                    <button type="button" onClick={() => { setView('forgotPassword'); clearFormState(); }} className="text-sm text-indigo-500 hover:underline">
                        Forgot password?
                    </button>
                </div>
            )}
             {error && (
                <div className="text-red-500 text-sm text-center">
                    <p>{error}</p>
                    {unverifiedEmail && (
                        <button
                            type="button"
                            onClick={() => setAwaitingVerificationEmail(unverifiedEmail)}
                            className="font-semibold underline hover:text-red-400 mt-1"
                        >
                            Resend verification email (simulated)
                        </button>
                    )}
                </div>
            )}
             {success && <p className="text-green-500 text-sm text-center">{success}</p>}
            <button
                type="submit"
                className="w-full py-3 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 transition-all"
            >
                {view === 'login' ? 'Log In' : 'Create Account'}
            </button>
        </form>
    );

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-light-bg dark:bg-dark-bg text-light-text-primary dark:text-dark-text-primary p-4">
            <div className="w-full max-w-md p-8 bg-light-surface dark:bg-dark-surface rounded-2xl shadow-2xl border border-light-border dark:border-dark-border">
                <div className="text-center mb-8">
                    <SparklesIcon className="w-12 h-12 mx-auto mb-4 text-indigo-500" />
                    <h1 className="text-3xl font-bold">Welcome to Dorak</h1>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">
                        {view === 'login' ? 'Log in to continue' : 'Create an account to start'}
                    </p>
                </div>

                <div className="flex border-b border-light-border dark:border-dark-border mb-6">
                    <button onClick={() => {setView('login'); clearFormState();}} className={`flex-1 pb-2 text-center font-semibold transition-colors ${view === 'login' ? 'text-indigo-500 border-b-2 border-indigo-500' : 'text-light-text-secondary dark:text-dark-text-secondary'}`}>Login</button>
                    <button onClick={() => {setView('signup'); clearFormState();}} className={`flex-1 pb-2 text-center font-semibold transition-colors ${view === 'signup' ? 'text-indigo-500 border-b-2 border-indigo-500' : 'text-light-text-secondary dark:text-dark-text-secondary'}`}>Sign Up</button>
                </div>
                
                {AuthForm}

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-light-border dark:border-dark-border"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-light-surface dark:bg-dark-surface text-light-text-secondary dark:text-dark-text-secondary">OR</span>
                    </div>
                </div>

                <button 
                    onClick={handleGoogleLogin} 
                    disabled={isGoogleLoading}
                    className="w-full flex items-center justify-center py-3 border border-light-border dark:border-dark-border rounded-lg hover:bg-light-border dark:hover:bg-dark-border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isGoogleLoading ? (
                        <SpinnerIcon className="w-5 h-5 mr-3" />
                    ) : (
                        <GoogleIcon className="w-5 h-5 mr-3" />
                    )}
                    {isGoogleLoading ? 'Connecting...' : 'Sign in with Google'}
                </button>
            </div>
        </div>
    );
};
