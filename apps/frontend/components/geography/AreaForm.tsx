'use client';

import { useState, useEffect } from 'react';
import { IArea, CreateAreaDto, AreaType, ILanguage } from '@countries3/shared';
import { geographyService } from '@/services/geography.service';
import { languagesService } from '@/services/languages.service';

interface AreaFormProps {
    parent?: IArea;       // If creating a child
    areaToEdit?: IArea;   // If editing
    onSuccess: () => void;
    onCancel: () => void;
}

export default function AreaForm({ parent, areaToEdit, onSuccess, onCancel }: AreaFormProps) {
    const isEdit = !!areaToEdit;

    // Form State
    const [id, setId] = useState('');
    const [name, setName] = useState('');
    const [type, setType] = useState<AreaType>('COUNTRY');
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
    const [availableLanguages, setAvailableLanguages] = useState<ILanguage[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Load active languages
        languagesService.getLanguages(true)
            .then(langs => setAvailableLanguages(langs))
            .catch(err => console.error('Failed to load languages:', err));

        if (areaToEdit) {
            setId(areaToEdit._id);
            setName(areaToEdit.name);
            setType(areaToEdit.type);
            setSelectedLanguages(areaToEdit.data?.languages || []);
        } else {
            // Defaults for creation
            setId('');
            setName('');
            setType(parent?.type === 'WORLD' ? 'CONTINENT' : 'COUNTRY');
            setSelectedLanguages([]);
        }
    }, [areaToEdit, parent]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isEdit && areaToEdit) {
                const updateData: any = { name };
                if (type === 'COUNTRY' && selectedLanguages.length > 0) {
                    updateData.data = { languages: selectedLanguages };
                }
                await geographyService.update(areaToEdit._id, updateData);
            } else {
                const payload: CreateAreaDto = {
                    _id: id,
                    name,
                    type,
                    parent: parent ? parent._id : undefined,
                    data: (type === 'COUNTRY' && selectedLanguages.length > 0)
                        ? { languages: selectedLanguages }
                        : undefined
                };
                await geographyService.create(payload);
            }
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Operation failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-gray-900 p-6 rounded border border-gray-800">
            <h2 className="text-xl font-bold mb-4 text-white">
                {isEdit ? `Edit ${areaToEdit.name}` : `Create New Area`}
            </h2>

            {!isEdit && parent && (
                <div className="mb-4 text-sm text-gray-400">
                    Parent: <span className="text-blue-400">{parent.name}</span>
                </div>
            )}

            {error && <div className="mb-4 p-2 bg-red-900 text-red-100 rounded text-sm">{error}</div>}

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400 mb-1">Code / ID (Unique)</label>
                <input
                    type="text"
                    value={id}
                    onChange={e => setId(e.target.value)}
                    disabled={isEdit} // ID cannot be changed after creation
                    placeholder="e.g. ES, US, EU"
                    className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:border-blue-500 outline-none disabled:opacity-50"
                    required
                />
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:border-blue-500 outline-none"
                    required
                />
            </div>

            {!isEdit && (
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-400 mb-1">Type</label>
                    <select
                        value={type}
                        onChange={e => setType(e.target.value as AreaType)}
                        className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:border-blue-500 outline-none"
                    >
                        <option value="WORLD">WORLD</option>
                        <option value="CONTINENT">CONTINENT</option>
                        <option value="REGION">REGION</option>
                        <option value="COUNTRY">COUNTRY</option>
                    </select>
                </div>
            )}

            {type === 'COUNTRY' && (
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-400 mb-1">Languages (Optional)</label>
                    <div className="bg-gray-800 border border-gray-700 rounded p-2 max-h-40 overflow-y-auto">
                        {availableLanguages.length === 0 ? (
                            <p className="text-gray-500 text-sm">Loading languages...</p>
                        ) : (
                            availableLanguages.map(lang => (
                                <label key={lang._id} className="flex items-center py-1 hover:bg-gray-700 px-2 rounded cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedLanguages.includes(lang._id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedLanguages([...selectedLanguages, lang._id]);
                                            } else {
                                                setSelectedLanguages(selectedLanguages.filter(id => id !== lang._id));
                                            }
                                        }}
                                        className="mr-2"
                                    />
                                    <span className="text-sm text-white">
                                        {lang._id} - {lang.name}
                                        {lang.nativeName && <span className="text-gray-400 ml-1">({lang.nativeName})</span>}
                                    </span>
                                </label>
                            ))
                        )}
                    </div>
                    {selectedLanguages.length > 0 && (
                        <p className="text-xs text-gray-400 mt-1">
                            Selected: {selectedLanguages.join(', ')}
                        </p>
                    )}
                </div>
            )}

            <div className="flex justify-end gap-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white text-sm"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white text-sm disabled:opacity-50"
                >
                    {loading ? 'Saving...' : 'Save'}
                </button>
            </div>
        </form>
    );
}
