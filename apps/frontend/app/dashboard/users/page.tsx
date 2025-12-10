'use client';

import { useEffect, useState } from 'react';
import { IUser, CreateUserDto, UpdateUserDto } from '@countries3/shared';
import { usersService } from '@/services/users.service';
import UserModal from '@/components/users/UserModal';
import { ArrowLeft, UserPlus, Pencil, Trash2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DevFooter from '@/components/common/DevFooter';
import DashboardHeader from '@/components/common/DashboardHeader';

export default function UsersPage() {
    const [users, setUsers] = useState<IUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<IUser | undefined>(undefined);
    const router = useRouter();

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await usersService.getUsers();
            setUsers(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreate = () => {
        setSelectedUser(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (user: IUser) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to deactivate this user?')) return;
        try {
            console.log('Deleting user:', id);
            await usersService.deleteUser(id);
            console.log('User deleted successfully');
            await fetchUsers();
        } catch (err: any) {
            console.error('Delete error:', err);
            alert(`Failed to delete user: ${err.response?.data?.message || err.message || 'Unknown error'}`);
        }
    };

    const handleSubmit = async (data: CreateUserDto | UpdateUserDto) => {
        console.log('🎯 handleSubmit called with data:', JSON.stringify(data, null, 2));
        console.log('🎯 selectedUser:', selectedUser);
        try {
            if (selectedUser) {
                console.log('🔄 Calling updateUser for ID:', selectedUser._id);
                await usersService.updateUser(selectedUser._id, data);
                console.log('✅ Update successful');
            } else {
                console.log('➕ Calling createUser');
                await usersService.createUser(data as CreateUserDto);
                console.log('✅ Create successful');
            }
            fetchUsers();
        } catch (error) {
            console.error('❌ Error in handleSubmit:', error);
            throw error;
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white p-6">
            <DashboardHeader />
            <header className="mb-6 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="p-2 hover:bg-gray-800 rounded-full transition">
                        <ArrowLeft className="w-5 h-5 text-gray-400" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-blue-400">User Management</h1>
                        <p className="text-gray-400 text-sm">Manage system access and roles</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={fetchUsers}
                        className="p-2 bg-gray-800 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition"
                        title="Refresh"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleCreate}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded hover:bg-blue-500 text-white font-bold transition"
                    >
                        <UserPlus className="w-4 h-4" />
                        Add User
                    </button>
                </div>
            </header>

            <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-950 text-gray-400 border-b border-gray-800">
                        <tr>
                            <th className="p-4 font-medium">UserInfo</th>
                            <th className="p-4 font-medium">Role</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium">Created At</th>
                            <th className="p-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {users.map((user) => (
                            <tr key={user._id} className="hover:bg-gray-800/50 transition">
                                <td className="p-4">
                                    <div className="font-bold text-white">{user.firstName} {user.lastName}</div>
                                    <div className="text-gray-500 text-xs">{user.email}</div>
                                </td>
                                <td className="p-4">
                                    <span className="px-2 py-1 bg-gray-800 rounded text-xs uppercase font-bold text-gray-300">
                                        {user.roles ? user.roles.join(', ') : 'user'}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${user.isActive ? 'bg-green-900/30 text-green-400 border border-green-900' : 'bg-red-900/30 text-red-400 border border-red-900'}`}>
                                        {user.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="p-4 text-gray-500">
                                    {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => handleEdit(user)}
                                            className="p-1.5 hover:bg-blue-900/30 text-blue-400 rounded transition"
                                            title="Edit"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user._id)}
                                            className="p-1.5 hover:bg-red-900/30 text-red-400 rounded transition"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {!loading && users.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-500">
                                    No users found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <UserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSubmit}
                user={selectedUser}
            />
            <DevFooter filePath="apps/frontend/app/dashboard/users/page.tsx" />
        </div>
    );
}
