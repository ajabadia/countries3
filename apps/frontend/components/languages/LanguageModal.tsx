'use client';

import { useState, useEffect } from 'react';
import { ILanguage, CreateLanguageDto, UpdateLanguageDto } from '@countries3/shared';

interface LanguageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: CreateLanguageDto | UpdateLanguageDto) => Promise<void>;
    language?: ILanguage | null;
}

export default function LanguageModal({ isOpen, onClose, onSave, language }: LanguageModalProps) {
    const [formData, setFormData] = useState<CreateLanguageDto>({
        _id: '',
        name: '',
        nativeName: '',
        active: true,
        translations: {}
    });

    useEffect(() => {
        if (language) {
            setFormData({
                _id: language._id,
                name: language.name,
                nativeName: language.nativeName || '',
                active: language.active,
                translations: language.translations || {}
            });
        } else {
            setFormData({ _id: '', name: '', nativeName: '', active: true, translations: {} });
        }
    }, [language, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave = language
            ? { name: formData.name, nativeName: formData.nativeName, active: formData.active, translations: formData.translations }
            : formData;
        await onSave(dataToSave);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md border border-gray-800">
                <h2 className="text-xl font-bold text-blue-400 mb-4">
                    {language ? 'Edit Language' : 'Create Language'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">ISO Code</label>
                        <input
                            type="text"
                            required
                            disabled={!!language}
                            value={formData._id}
                            onChange={(e) => setFormData({ ...formData, _id: e.target.value })}
                            className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white disabled:opacity-50"
                            placeholder="en, es, fr..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Name (English)</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Native Name</label>
                        <input
                            type="text"
                            value={formData.nativeName || ''}
                            onChange={(e) => setFormData({ ...formData, nativeName: e.target.value })}
                            className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white"
                        />
                    </div>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            checked={formData.active}
                            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                            className="mr-2"
                        />
                        <label className="text-sm">Active</label>
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
