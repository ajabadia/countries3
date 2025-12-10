'use client';

import { useState } from 'react';
import { CreateAreaDto } from '@countries3/shared';
import { geographyService } from '@/services/geography.service';

interface ImportModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export default function ImportModal({ onClose, onSuccess }: ImportModalProps) {
    const [jsonInput, setJsonInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleImport = async () => {
        setLoading(true);
        setError('');
        try {
            const parsed = JSON.parse(jsonInput);
            if (!Array.isArray(parsed)) {
                throw new Error('Input must be a JSON Array');
            }

            // Basic validation
            // In a real app we might validate using Zod or similar against the DTO

            await geographyService.createBulk(parsed as CreateAreaDto[]);
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Import failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] flex flex-col">
                <h2 className="text-xl font-bold text-white mb-4">Bulk Import Items</h2>
                <p className="text-sm text-gray-400 mb-2">
                    Paste a JSON array of areas to create. Ensure parents are created before children or order corresponds.
                </p>
                <div className="flex-1 min-h-[200px] mb-4">
                    <textarea
                        className="w-full h-full bg-gray-950 border border-gray-700 rounded p-4 text-sm font-mono text-gray-300 focus:border-blue-500 outline-none"
                        placeholder='[{"_id": "ES", "name": "Spain", "type": "COUNTRY", "parent": "EU"}, ...]'
                        value={jsonInput}
                        onChange={e => setJsonInput(e.target.value)}
                    />
                </div>

                {error && <div className="mb-4 text-sm text-red-400">{error}</div>}

                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-400 hover:text-white"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleImport}
                        disabled={loading || !jsonInput}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded disabled:opacity-50"
                    >
                        {loading ? 'Importing...' : 'Import JSON'}
                    </button>
                </div>
            </div>
        </div>
    );
}
