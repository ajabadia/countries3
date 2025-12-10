'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import DevFooter from '@/components/common/DevFooter';
import DashboardHeader from '@/components/common/DashboardHeader';
import { Globe, Users, Languages, FileText } from 'lucide-react';

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
            <DashboardHeader />
            <h1 className="text-3xl font-bold text-blue-400 mb-4">Dashboard</h1>
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
                <p>Welcome, <span className="font-semibold text-white">{user.username}</span></p>
                <p className="text-sm text-gray-400 mt-2">ID: {user.userId}</p>

                <div className="mt-6 border-t border-gray-800 pt-4">
                    <h3 className="text-lg font-semibold mb-2">Modules</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <a href="/dashboard/geography" className="flex items-center gap-4 p-4 bg-gray-800 rounded hover:bg-gray-700 transition">
                            <Globe className="w-10 h-10 text-blue-400 flex-shrink-0" />
                            <div className="flex flex-col">
                                <h4 className="font-semibold text-lg">Geography</h4>
                                <p className="text-sm text-gray-400">Manage areas</p>
                            </div>
                        </a>
                        <a href="/dashboard/users" className="flex items-center gap-4 p-4 bg-gray-800 rounded hover:bg-gray-700 transition">
                            <Users className="w-10 h-10 text-green-400 flex-shrink-0" />
                            <div className="flex flex-col">
                                <h4 className="font-semibold text-lg">Users</h4>
                                <p className="text-sm text-gray-400">User management</p>
                            </div>
                        </a>
                        <a href="/dashboard/languages" className="flex items-center gap-4 p-4 bg-gray-800 rounded hover:bg-gray-700 transition">
                            <Languages className="w-10 h-10 text-purple-400 flex-shrink-0" />
                            <div className="flex flex-col">
                                <h4 className="font-semibold text-lg">Languages</h4>
                                <p className="text-sm text-gray-400">Language catalog</p>
                            </div>
                        </a>
                        <a href="/dashboard/audit" className="flex items-center gap-4 p-4 bg-gray-800 rounded hover:bg-gray-700 transition">
                            <FileText className="w-10 h-10 text-orange-400 flex-shrink-0" />
                            <div className="flex flex-col">
                                <h4 className="font-semibold text-lg">Audit Logs</h4>
                                <p className="text-sm text-gray-400">System activity</p>
                            </div>
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
