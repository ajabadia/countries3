'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/login', { username, password });
            localStorage.setItem('token', res.data.access_token);
            router.push('/dashboard');
        } catch (err) {
            setError('Invalid credentials');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-950 text-white">
            <div className="w-full max-w-md rounded-lg bg-gray-900 p-8 shadow-xl border border-gray-800">
                <h2 className="mb-6 text-2xl font-bold text-center text-blue-400">Countries3 IAM</h2>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full rounded bg-gray-800 p-2 border border-gray-700 focus:border-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded bg-gray-800 p-2 border border-gray-700 focus:border-blue-500 outline-none"
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button
                        type="submit"
                        className="w-full rounded bg-blue-600 py-2 font-semibold hover:bg-blue-500 transition-colors"
                    >
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
}
