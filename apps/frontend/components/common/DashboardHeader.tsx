'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { User, ChevronLeft, ChevronRight } from 'lucide-react';

export default function DashboardHeader() {
    const [user, setUser] = useState<any>(null);
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        api.get('/auth/profile')
            .then((res) => setUser(res.data))
            .catch(() => { });
    }, []);

    if (!user) return null;

    const roleText = user.roles && user.roles.length > 0 ? ` (${user.roles.join(', ')})` : '';

    return (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
            {!isCollapsed && (
                <>
                    <button
                        onClick={() => setIsCollapsed(true)}
                        className="p-2 hover:bg-gray-800 transition"
                        title="Collapse"
                    >
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                    <div className="flex items-center gap-2 pr-4">
                        <User className="w-4 h-4 text-blue-400" />
                        <div className="text-sm">
                            <p className="font-semibold text-white">
                                {user.username}{roleText}
                            </p>
                        </div>
                    </div>
                </>
            )}
            {isCollapsed && (
                <button
                    onClick={() => setIsCollapsed(false)}
                    className="p-2 hover:bg-gray-800 transition"
                    title={`${user.username}${roleText}`}
                >
                    <User className="w-4 h-4 text-blue-400" />
                </button>
            )}
        </div>
    );
}
