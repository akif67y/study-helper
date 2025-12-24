import React, { useState } from 'react';
import { User } from 'lucide-react';
import { createUserProfile } from '../hooks/useUserProfile';
import { Button } from '../components/ui/Button';

export const UsernameSetupPage = ({ user, onComplete }) => {
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (username.trim().length < 3) {
            setError('Username must be at least 3 characters');
            return;
        }
        setLoading(true);
        try {
            await createUserProfile(user, username);
            onComplete();
        } catch (err) {
            setError('Failed to create profile. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center py-12 px-4">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="bg-gradient-to-br from-[#00e054] to-[#40bcf4] p-4 rounded-2xl shadow-lg">
                        <User className="w-10 h-10 text-[#14181c]" />
                    </div>
                </div>
                <h2 className="text-center text-3xl font-bold text-white mb-2">
                    Choose your username
                </h2>
                <p className="text-center text-[#678]">
                    This will be visible to other users when sharing problems
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-[#1c2228] py-8 px-6 shadow-2xl rounded-2xl border border-[#2c3440]">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-[#99aabb] mb-1.5">Username</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="e.g., johndoe"
                                value={username}
                                onChange={(e) => {
                                    setUsername(e.target.value);
                                    setError('');
                                }}
                                autoFocus
                                required
                            />
                            {error && (
                                <p className="text-red-400 text-sm mt-1">{error}</p>
                            )}
                        </div>

                        <Button className="w-full" disabled={loading}>
                            {loading ? 'Setting up...' : 'Continue'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};
