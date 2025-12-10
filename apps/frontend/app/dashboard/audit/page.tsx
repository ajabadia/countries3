'use client';

import { useEffect, useState } from 'react';
import { IAuditLog } from '@countries3/shared';
import { auditService } from '@/services/audit.service';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import DevFooter from '@/components/common/DevFooter';

export default function AuditPage() {
    const [logs, setLogs] = useState<IAuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const data = await auditService.getLogs(100); // Fetch last 100 logs
            setLogs(data);
            setError('');
        } catch (err) {
            setError('Failed to load audit logs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    return (
        <div className="min-h-screen bg-gray-950 text-white p-6">
            <header className="mb-6 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="p-2 hover:bg-gray-800 rounded-full transition">
                        <ArrowLeft className="w-5 h-5 text-gray-400" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-blue-400">System Logs</h1>
                        <p className="text-gray-400 text-sm">View recent system activities</p>
                    </div>
                </div>
                <button
                    onClick={fetchLogs}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 text-sm font-medium"
                    disabled={loading}
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </header>

            {error && (
                <div className="bg-red-900/50 border border-red-800 p-4 rounded mb-6 text-red-200">
                    {error}
                </div>
            )}

            <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-950 text-gray-400 border-b border-gray-800">
                        <tr>
                            <th className="p-4 font-medium">Timestamp</th>
                            <th className="p-4 font-medium">User</th>
                            <th className="p-4 font-medium">Action</th>
                            <th className="p-4 font-medium">Resource</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {logs.map((log) => (
                            <tr key={log._id} className="hover:bg-gray-800/50 transition">
                                <td className="p-4 font-mono text-gray-400">
                                    {new Date(log.timestamp).toLocaleString()}
                                </td>
                                <td className="p-4">{log.userId}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${log.method === 'GET' ? 'bg-blue-900 text-blue-200' :
                                        log.method === 'POST' ? 'bg-green-900 text-green-200' :
                                            log.method === 'DELETE' ? 'bg-red-900 text-red-200' :
                                                'bg-gray-700'
                                        }`}>
                                        {log.method}
                                    </span>
                                </td>
                                <td className="p-4 font-mono text-xs text-gray-300">{log.path}</td>
                                <td className="p-4">
                                    <span className={log.statusCode >= 400 ? 'text-red-400' : 'text-green-400'}>
                                        {log.statusCode}
                                    </span>
                                </td>
                                <td className="p-4 text-xs text-gray-500 max-w-xs truncate">
                                    {JSON.stringify(log.metadata || {})}
                                </td>
                            </tr>
                        ))}
                        {!loading && logs.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-gray-500">
                                    No logs found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <DevFooter filePath="apps/frontend/app/dashboard/audit/page.tsx" />
        </div>
    );
}
