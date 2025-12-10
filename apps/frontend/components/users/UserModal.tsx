'use client';

import { useState, useEffect } from 'react';
import { CreateUserDto, UpdateUserDto, IUser } from '@countries3/shared';
import { X } from 'lucide-react';

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: CreateUserDto | UpdateUserDto) => Promise<void>;
    user?: IUser; // If present, we are editing
}

export default function UserModal({ isOpen, onClose, onSave, user }: UserModalProps) {
    const [formData, setFormData] = useState<any>({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        roles: ['user'],
        isActive: true,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                email: user.email,
                password: '', // Don't fill password on edit
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                roles: user.roles || ['user'],
                isActive: user.isActive,
            });
        } else {
            // Reset for create
            setFormData({
                email: '',
                password: '',
                firstName: '',
                lastName: '',
                roles: ['user'],
                isActive: true,
            });
        }
    }, [user, isOpen]);

    if (!isOpen) return null;


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            // Remove empty password from update payload
            const dataToSubmit = { ...formData };
            if (user && !dataToSubmit.password) {
                delete dataToSubmit.password;
            }
            console.log('📤 Submitting formData:', JSON.stringify(dataToSubmit, null, 2));
            await onSave(dataToSubmit);
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save user');
            console.error('❌ Modal error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-gray-900 border border-gray-800 rounded-lg w-full max-w-md p-6 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">
                        {user ? 'Edit User' : 'Create User'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {error && (
                    <div className="bg-red-900/50 border border-red-800 text-red-200 p-3 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            disabled={!!(user && user._id)} // Disable email edit only if editing existing user
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">First Name</label>
                            <input
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Last Name</label>
                            <input
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                            Password {user && <span className="text-xs text-gray-500">(Leave blank to keep current)</span>}
                        </label>
                        <input
                            type="password"
                            required={!user}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Role</label>
                        <select
                            value={formData.roles ? formData.roles[0] : 'user'}
                            onChange={(e) => setFormData({ ...formData, roles: [e.target.value] })}
                            className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                            <option value="editor">Editor</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            className="w-4 h-4 rounded bg-gray-800 border-gray-700 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="isActive" className="text-sm font-medium text-gray-300">Active Account</label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded transition disabled:opacity-50 flex justify-center"
                    >
                        {loading ? 'Saving...' : 'Save User'}
                    </button>
                </form>
            </div>
        </div>
    );
}
