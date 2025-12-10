'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import DevFooter from '@/components/common/DevFooter';

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        api.get('/auth/profile')
            .then((res) => setUser(res.data))
            .catch(() => router.push('/auth/login'));
    }, [router]);

    if (!user) return <div className="p-8 text-white">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-950 text-white p-8">
            <h1 className="text-3xl font-bold text-blue-400 mb-4">Dashboard</h1>
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
                <p>Welcome, <span className="font-semibold text-white">{user.username}</span></p>
                <p className="text-sm text-gray-400 mt-2">ID: {user.userId}</p>

                <div className="mt-6 border-t border-gray-800 pt-4">
                    <h3 className="text-lg font-semibold mb-2">Modules</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <a href="/dashboard/geography" className="block p-4 bg-gray-800 rounded hover:bg-gray-700 transition">
                            <span className="block text-blue-400 font-bold">Geography</span>
                            <span className="text-xs text-gray-400">Manage areas & countries</span>
                        </a>
                        <a href="/dashboard/languages" className="block p-4 bg-gray-800 rounded hover:bg-gray-700 transition">
                            <span className="block text-blue-400 font-bold">Languages</span>
                            <span className="text-xs text-gray-400">Manage languages</span>
                        </a>
                        <a href="/dashboard/audit" className="block p-4 bg-gray-800 rounded hover:bg-gray-700 transition">
                            <span className="block text-blue-400 font-bold">System Logs</span>
                            <span className="text-xs text-gray-400">View audit history</span>
                        </a>
                        <a href="/dashboard/users" className="block p-4 bg-gray-800 rounded hover:bg-gray-700 transition">
                            <span className="block text-blue-400 font-bold">User Management</span>
                            <span className="text-xs text-gray-400">Admins & Editors</span>
                        </a>
                    </div>
                </div>

                <button
                    onClick={() => {
                        localStorage.removeItem('token');
                        router.push('/auth/login');
                    }}
                    className="mt-6 px-4 py-2 bg-red-600 rounded hover:bg-red-500 text-sm"
                >
                    Logout
                </button>
            </div>
            <DevFooter filePath="apps/frontend/app/dashboard/page.tsx" />
        </div>
    );
}
