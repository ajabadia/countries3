'use client';

import { useState, useEffect } from 'react';
import { ILanguage, CreateLanguageDto, UpdateLanguageDto } from '@countries3/shared';
import { languagesService } from '@/services/languages.service';
import LanguageModal from '@/components/languages/LanguageModal';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import DevFooter from '@/components/common/DevFooter';
import DashboardHeader from '@/components/common/DashboardHeader';

export default function LanguagesPage() {
    const [languages, setLanguages] = useState<ILanguage[]>([]);
    const [filteredLanguages, setFilteredLanguages] = useState<ILanguage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState<ILanguage | null>(null);
    const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchLanguages = async () => {
        try {
            setLoading(true);
            const data = await languagesService.getLanguages();
            setLanguages(data);
            setFilteredLanguages(data);
            setError('');
        } catch (err) {
            setError('Failed to load languages');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLanguages();
    }, []);

    useEffect(() => {
        let filtered = languages;

        // Filter by active status
        if (filterActive === 'active') {
            filtered = filtered.filter(lang => lang.active);
        } else if (filterActive === 'inactive') {
            filtered = filtered.filter(lang => !lang.active);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(lang =>
                lang._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lang.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredLanguages(filtered);
    }, [filterActive, searchTerm, languages]);

    const handleSave = async (data: CreateLanguageDto | UpdateLanguageDto) => {
        try {
            if (selectedLanguage) {
                await languagesService.updateLanguage(selectedLanguage._id, data as UpdateLanguageDto);
            } else {
                await languagesService.createLanguage(data as CreateLanguageDto);
            }
            await fetchLanguages();
        } catch (err) {
            setError('Failed to save language');
            console.error(err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to deactivate this language?')) return;
        try {
            await languagesService.deleteLanguage(id);
            await fetchLanguages();
        } catch (err) {
            setError('Failed to delete language');
            console.error(err);
        }
    };

    const openModal = (language?: ILanguage) => {
        setSelectedLanguage(language || null);
        setIsModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white p-6">
            <DashboardHeader />
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="p-2 hover:bg-gray-800 rounded-full transition">
                            <ArrowLeft className="w-5 h-5 text-gray-400" />
                        </Link>
                        <h1 className="text-3xl font-bold text-blue-400">Languages</h1>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500"
                    >
                        Add Language
                    </button>
                </div>

                {error && <div className="bg-red-900 text-red-200 p-3 rounded mb-4">{error}</div>}

                <div className="flex gap-4 mb-4">
                    <input
                        type="text"
                        placeholder="Search by code or name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 bg-gray-800 border border-gray-700 rounded p-2"
                    />
                    <select
                        value={filterActive}
                        onChange={(e) => setFilterActive(e.target.value as any)}
                        className="bg-gray-800 border border-gray-700 rounded p-2"
                    >
                        <option value="all">All</option>
                        <option value="active">Active Only</option>
                        <option value="inactive">Inactive Only</option>
                    </select>
                    <button
                        onClick={fetchLanguages}
                        className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
                    >
                        Refresh
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-8">Loading...</div>
                ) : (
                    <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-800">
                                <tr>
                                    <th className="px-4 py-3 text-left">Code</th>
                                    <th className="px-4 py-3 text-left">Name</th>
                                    <th className="px-4 py-3 text-left">Native Name</th>
                                    <th className="px-4 py-3 text-left">Status</th>
                                    <th className="px-4 py-3 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLanguages.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                            No languages found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLanguages.map((lang) => (
                                        <tr key={lang._id} className="border-t border-gray-800 hover:bg-gray-800/50">
                                            <td className="px-4 py-3 font-mono">{lang._id}</td>
                                            <td className="px-4 py-3">{lang.name}</td>
                                            <td className="px-4 py-3">{lang.nativeName || '-'}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded text-xs ${lang.active ? 'bg-green-900 text-green-200' : 'bg-gray-700 text-gray-400'}`}>
                                                    {lang.active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => openModal(lang)}
                                                    className="text-blue-400 hover:text-blue-300 mr-3"
                                                >
                                                    Edit
                                                </button>
                                                {lang.active && (
                                                    <button
                                                        onClick={() => handleDelete(lang._id)}
                                                        className="text-red-400 hover:text-red-300"
                                                    >
                                                        Deactivate
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                <LanguageModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    language={selectedLanguage}
                />
            </div>
            <DevFooter filePath="apps/frontend/app/dashboard/languages/page.tsx" />
        </div>
    );
}
