
import React, { useState } from 'react';
import { UserIcon } from './icons/UserIcon';
import { MailIcon } from './icons/MailIcon';
import { LockIcon } from './icons/LockIcon';
import { CreditCardIcon } from './icons/CreditCardIcon';

export interface User {
  username: string;
  email: string;
  credits: number;
  password?: string; // Stored for simulation, NEVER do this in a real app
  verified?: boolean;
}

interface ProfilePageProps {
  user: User;
  onClose: () => void;
  onUpdateUser: (user: User) => void;
  onDeleteAccount: () => void;
}

const creditPlans = [
    { name: 'Starter', credits: 100, price: 5 },
    { name: 'Creator', credits: 250, price: 10 },
    { name: 'Pro', credits: 600, price: 20 },
    { name: 'Studio', credits: 1500, price: 45 },
];

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, onClose, onUpdateUser, onDeleteAccount }) => {
    const [username, setUsername] = useState(user.username);
    const [email, setEmail] = useState(user.email);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [profileMessage, setProfileMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
    const [passwordMessage, setPasswordMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
    const [creditMessage, setCreditMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

    const handleProfileUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        setProfileMessage(null);
        if (username.trim() === '' || email.trim() === '') {
            setProfileMessage({ type: 'error', text: 'Username and email cannot be empty.' });
            return;
        }

        const updatedUser = { ...user, username: username.trim(), email: email.trim() };
        onUpdateUser(updatedUser);

        // Also update the specific user entry if it exists
        const userKey = `dorak_user_${user.email}`;
        if (localStorage.getItem(userKey)) {
             localStorage.setItem(userKey, JSON.stringify(updatedUser));
        }

        setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
         setTimeout(() => setProfileMessage(null), 3000);
    };

    const handlePasswordChange = (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordMessage(null);

        if (currentPassword !== user.password) {
            setPasswordMessage({ type: 'error', text: 'Current password is incorrect.' });
            return;
        }
        if (newPassword.length < 8) {
             setPasswordMessage({ type: 'error', text: 'New password must be at least 8 characters.' });
             return;
        }
        if (newPassword !== confirmNewPassword) {
            setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
            return;
        }

        const updatedUser = { ...user, password: newPassword };
        onUpdateUser(updatedUser);
        
        const userKey = `dorak_user_${user.email}`;
        if (localStorage.getItem(userKey)) {
            localStorage.setItem(userKey, JSON.stringify(updatedUser));
        }

        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
        setTimeout(() => setPasswordMessage(null), 3000);
    };

    const handlePurchaseCredits = (amount: number) => {
        const updatedUser = { ...user, credits: user.credits + amount };
        onUpdateUser(updatedUser);

        const userKey = `dorak_user_${user.email}`;
        if (localStorage.getItem(userKey)) {
             localStorage.setItem(userKey, JSON.stringify(updatedUser));
        }

        setCreditMessage({ type: 'success', text: `${amount} credits added successfully!` });
        setTimeout(() => setCreditMessage(null), 3000);
    }
    

    return (
        <div className="flex-1 overflow-y-auto">
           <div className="container mx-auto max-w-4xl py-12 px-6">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Your Profile</h1>
                    <button onClick={onClose} className="py-2 px-4 rounded-lg hover:bg-light-border dark:hover:bg-dark-border">&times; Back to Generator</button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-8">
                        {/* Profile Settings */}
                        <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-lg border border-light-border dark:border-dark-border">
                            <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
                            <form onSubmit={handleProfileUpdate} className="space-y-4">
                                <div className="relative">
                                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full p-3 pl-10 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg" />
                                </div>
                                <div className="relative">
                                    <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 pl-10 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg" />
                                </div>
                                {profileMessage && <p className={profileMessage.type === 'success' ? 'text-green-500' : 'text-red-500'}>{profileMessage.text}</p>}
                                <button type="submit" className="w-full py-2 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Save Changes</button>
                            </form>
                        </div>

                         {/* Change Password */}
                        <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-lg border border-light-border dark:border-dark-border">
                            <h2 className="text-xl font-semibold mb-4">Change Password</h2>
                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                <div className="relative">
                                    <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input type="password" placeholder="Current Password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full p-3 pl-10 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg" required />
                                </div>
                                <div className="relative">
                                    <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full p-3 pl-10 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg" required />
                                </div>
                                <div className="relative">
                                    <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input type="password" placeholder="Confirm New Password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} className="w-full p-3 pl-10 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg" required />
                                </div>
                                {passwordMessage && <p className={passwordMessage.type === 'success' ? 'text-green-500' : 'text-red-500'}>{passwordMessage.text}</p>}
                                <button type="submit" className="w-full py-2 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Change Password</button>
                            </form>
                        </div>
                    </div>

                    {/* Right Column */}
                     <div className="space-y-8">
                        {/* Purchase Credits */}
                        <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-lg border border-light-border dark:border-dark-border">
                            <h2 className="text-xl font-semibold mb-4">Purchase Credits</h2>
                            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4">Your current balance is <span className="font-bold text-indigo-500">{user.credits} credits</span>.</p>
                            <div className="space-y-3">
                                {creditPlans.map(plan => (
                                    <div key={plan.name} className="flex justify-between items-center p-3 border border-light-border dark:border-dark-border rounded-lg">
                                        <div>
                                            <p className="font-semibold">{plan.name} - {plan.credits} Credits</p>
                                            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">${plan.price}</p>
                                        </div>
                                        <button onClick={() => handlePurchaseCredits(plan.credits)} className="flex items-center text-sm py-1.5 px-3 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                                            <CreditCardIcon className="w-4 h-4 mr-1.5"/>
                                            Purchase
                                        </button>
                                    </div>
                                ))}
                            </div>
                            {creditMessage && <p className={`mt-4 text-center ${creditMessage.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>{creditMessage.text}</p>}
                        </div>

                         {/* Danger Zone */}
                        <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-lg border border-red-500/30 dark:border-red-500/50">
                            <h2 className="text-xl font-semibold mb-2 text-red-600 dark:text-red-500">Danger Zone</h2>
                            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4">This action is permanent and cannot be undone.</p>
                            <button onClick={onDeleteAccount} className="w-full py-2 font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700">Delete My Account</button>
                        </div>
                     </div>
                </div>
            </div>
        </div>
    );
};
