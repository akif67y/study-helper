import React, { useState } from 'react';
import { Layout } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const AuthPage = ({ login, signup }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isLogin) await login(email, password);
            else await signup(email, password);
        } catch (err) {
            setError(err.message.replace('Firebase:', '').replace(/\(auth\/[^)]+\)/g, '').trim());
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center py-12 px-4">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="bg-gradient-to-br from-[#00e054] to-[#40bcf4] p-4 rounded-2xl shadow-lg shadow-[#00e054]/20">
                        <Layout className="w-10 h-10 text-[#14181c]" />
                    </div>
                </div>
                <h2 className="text-center text-3xl font-bold text-white mb-2">
                    {isLogin ? 'Welcome back' : 'Create account'}
                </h2>
                <p className="text-center text-[#678]">
                    Your personal study companion
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-[#1c2228] py-8 px-6 shadow-2xl rounded-2xl border border-[#2c3440]">
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-medium text-[#99aabb] mb-1.5">Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#99aabb] mb-1.5">Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input"
                                placeholder="••••••••"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        <Button
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? 'Please wait...' : (isLogin ? 'Sign in' : 'Sign up')}
                        </Button>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-[#2c3440]" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-3 bg-[#1c2228] text-[#456]">
                                    {isLogin ? 'New here?' : 'Have an account?'}
                                </span>
                            </div>
                        </div>
                        <Button
                            variant="secondary"
                            className="w-full mt-4"
                            onClick={() => setIsLogin(!isLogin)}
                        >
                            {isLogin ? 'Create account' : 'Sign in'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
