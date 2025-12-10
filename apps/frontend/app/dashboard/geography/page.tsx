'use client';

import { useState } from 'react';
import { Plus, Trash2, FileUp } from 'lucide-react';
import { IArea } from '@countries3/shared';
import AreaTree from '@/components/geography/AreaTree';
import AreaForm from '@/components/geography/AreaForm';
import ImportModal from '@/components/geography/ImportModal';
import { geographyService } from '@/services/geography.service';
import DevFooter from '@/components/common/DevFooter';

export default function GeographyPage() {
    const [selectedArea, setSelectedArea] = useState<IArea | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [refreshTreeKey, setRefreshTreeKey] = useState(0);

    const handleSelect = (area: IArea) => {
        setSelectedArea(area);
        setIsCreating(false);
    };

    const handleCreateChild = () => {
        setIsCreating(true);
    };

    const handleSuccess = () => {
        setRefreshTreeKey(prev => prev + 1); // Reload tree to show changes
        setIsCreating(false);
        // We keep selection or clear it? Keeping it is safer for now
    };

    const handleDelete = async () => {
        if (!selectedArea) return;
        if (!confirm(`Are you sure you want to delete ${selectedArea.name}? This cannot be undone.`)) return;

        try {
            await geographyService.delete(selectedArea._id);
            setSelectedArea(null);
            setIsCreating(false);
            setRefreshTreeKey(prev => prev + 1);
        } catch (error) {
            alert('Failed to delete area');
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white p-6 flex flex-col">
            <header className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-blue-400">Geography Manager</h1>
                    <p className="text-gray-400 text-sm">Manage countries, continents, and regions</p>
                </div>
            </header>

            <div className="flex flex-1 gap-6 h-[calc(100vh-150px)]">
                {/* Left Panel: Tree */}
                <div className="w-1/3 bg-gray-900 rounded-lg border border-gray-800 flex flex-col">
                    <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                        <h2 className="font-semibold">Hierarchy</h2>
                        <button
                            onClick={() => setRefreshTreeKey(prev => prev + 1)}
                            className="text-xs text-blue-400 hover:text-blue-300"
                        >
                            Refresh
                        </button>
                    </div>
                    <div className="flex-1 overflow-auto p-2">
                        <AreaTree
                            key={refreshTreeKey}
                            onSelect={handleSelect}
                            selectedId={selectedArea?._id}
                        />
                    </div>
                </div>

                {/* Right Panel: Actions & Details */}
                <div className="w-2/3 flex flex-col gap-6">
                    {/* Toolbar */}
                    <div className="bg-gray-900 p-4 rounded-lg border border-gray-800 flex items-center gap-4">
                        <button
                            onClick={handleCreateChild}
                            disabled={!selectedArea}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                        >
                            <Plus className="w-4 h-4" />
                            Add Child
                        </button>

                        <div className="flex-1"></div>

                        <button
                            onClick={() => setIsImporting(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 text-sm font-medium text-gray-300"
                        >
                            <FileUp className="w-4 h-4" />
                            Import JSON
                        </button>

                        <button
                            onClick={handleDelete}
                            disabled={!selectedArea}
                            className="flex items-center gap-2 px-4 py-2 bg-red-900/50 text-red-200 rounded hover:bg-red-900 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete Selected
                        </button>
                    </div>

                    {/* Form Area */}
                    <div className="flex-1">
                        {isCreating ? (
                            <AreaForm
                                parent={selectedArea || undefined}
                                onSuccess={handleSuccess}
                                onCancel={() => setIsCreating(false)}
                            />
                        ) : selectedArea ? (
                            <AreaForm
                                areaToEdit={selectedArea}
                                onSuccess={handleSuccess}
                                onCancel={() => { }} // No cancel on edit mode, stays in view
                            />
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500 bg-gray-900/50 rounded-lg border-2 border-dashed border-gray-800">
                                <p>Select an area from the tree to view details</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isImporting && (
                <ImportModal
                    onClose={() => setIsImporting(false)}
                    onSuccess={() => {
                        setRefreshTreeKey(prev => prev + 1);
                    }}
                />
            )}
            <DevFooter filePath="apps/frontend/app/dashboard/geography/page.tsx" />
        </div>
    );
}
