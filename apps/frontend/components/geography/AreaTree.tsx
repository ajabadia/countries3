'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Folder, Globe, MapPin } from 'lucide-react';
import { IArea } from '@countries3/shared';
import { geographyService } from '@/services/geography.service';

interface AreaTreeProps {
    onSelect: (area: IArea) => void;
    selectedId?: string;
}

const TreeNode = ({ area, onSelect, selectedId }: { area: IArea; onSelect: (a: IArea) => void; selectedId?: string }) => {
    const [expanded, setExpanded] = useState(false);
    const [children, setChildren] = useState<IArea[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);

    const handleExpand = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!expanded && !hasLoaded) {
            setLoading(true);
            try {
                const data = await geographyService.getChildren(area._id);
                setChildren(data);
                setHasLoaded(true);
            } catch (error) {
                console.error('Failed to load children', error);
            } finally {
                setLoading(false);
            }
        }
        setExpanded(!expanded);
    };

    const isSelected = selectedId === area._id;

    // Icon selection based on type
    const getIcon = () => {
        if (area.type === 'WORLD') return <Globe className="w-4 h-4 text-blue-500" />;
        if (area.type === 'CONTINENT') return <Globe className="w-4 h-4 text-green-500" />;
        return <MapPin className="w-4 h-4 text-gray-500" />;
    };

    return (
        <div className="pl-4">
            <div
                className={`flex items-center py-1 px-2 cursor-pointer rounded hover:bg-gray-800 ${isSelected ? 'bg-blue-900' : ''}`}
                onClick={() => onSelect(area)}
            >
                <button onClick={handleExpand} className="p-1 mr-1 hover:bg-gray-700 rounded">
                    {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                <span className="mr-2">{getIcon()}</span>
                <span className="text-sm">{area.name}</span>
                {loading && <span className="ml-2 text-xs text-gray-500">Loading...</span>}
            </div>

            {expanded && (
                <div className="border-l border-gray-800 ml-2">
                    {children.map(child => (
                        <TreeNode
                            key={child._id}
                            area={child}
                            onSelect={onSelect}
                            selectedId={selectedId}
                        />
                    ))}
                    {children.length === 0 && hasLoaded && (
                        <div className="pl-6 py-1 text-xs text-gray-500 italic">No children</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default function AreaTree({ onSelect, selectedId }: AreaTreeProps) {
    const [roots, setRoots] = useState<IArea[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        geographyService.getRoots().then(data => {
            setRoots(data);
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="p-4 text-gray-400">Loading tree...</div>;

    return (
        <div className="w-full text-gray-300">
            {roots.map(root => (
                <TreeNode
                    key={root._id}
                    area={root}
                    onSelect={onSelect}
                    selectedId={selectedId}
                />
            ))}
        </div>
    );
}
