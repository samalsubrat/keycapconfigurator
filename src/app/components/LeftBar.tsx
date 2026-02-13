'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { ChevronRight, ChevronDown, Pencil, Redo2, Undo2, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "@/components/ui/combobox"

// ─── Layer tree types & data ────────────────────────────────────────────

interface LayerNode {
    id: string;
    name: string;
    type: 'group' | 'layer';
    children?: LayerNode[];
}

const initialLayers: LayerNode[] = [
    {
        id: 'r1',
        name: 'R1 Keycaps',
        type: 'group',
        children: [],
    },
    {
        id: 'r2',
        name: 'R2 Keycaps',
        type: 'group',
        children: [
            { id: 'r2-text-a', name: 'Text A', type: 'layer' },
        ],
    },
    {
        id: 'r3',
        name: 'R3 Keycaps',
        type: 'group',
        children: [
            { id: 'r3-text-w', name: 'Text W', type: 'layer' },
            { id: 'r3-text-q', name: 'Text Q', type: 'layer' },
        ],
    },
];

// ─── Helpers ────────────────────────────────────────────────────────────

function updateNodeName(nodes: LayerNode[], id: string, newName: string): LayerNode[] {
    return nodes.map(node => {
        if (node.id === id) return { ...node, name: newName };
        if (node.children) return { ...node, children: updateNodeName(node.children, id, newName) };
        return node;
    });
}

function getFlatVisibleIds(nodes: LayerNode[], expandedIds: Set<string>): string[] {
    const result: string[] = [];
    for (const node of nodes) {
        result.push(node.id);
        if (node.type === 'group' && expandedIds.has(node.id) && node.children) {
            result.push(...getFlatVisibleIds(node.children, expandedIds));
        }
    }
    return result;
}

// ─── LayerRow (recursive) ───────────────────────────────────────────────

interface LayerRowProps {
    node: LayerNode;
    depth: number;
    expandedIds: Set<string>;
    selectedIds: Set<string>;
    hiddenIds: Set<string>;
    hoveredId: string | null;
    renamingId: string | null;
    onToggleExpand: (id: string) => void;
    onSelect: (id: string, e: React.MouseEvent) => void;
    onToggleVisibility: (id: string) => void;
    onSetHovered: (id: string | null) => void;
    onStartRename: (id: string) => void;
    onFinishRename: (id: string, newName: string) => void;
    onCancelRename: () => void;
}

const LayerRow: React.FC<LayerRowProps> = ({
    node, depth, expandedIds, selectedIds, hiddenIds,
    hoveredId, renamingId, onToggleExpand, onSelect,
    onToggleVisibility, onSetHovered, onStartRename,
    onFinishRename, onCancelRename,
}) => {
    const isGroup = node.type === 'group';
    const isExpanded = expandedIds.has(node.id);
    const isSelected = selectedIds.has(node.id);
    const isHidden = hiddenIds.has(node.id);
    const isHovered = hoveredId === node.id;
    const isRenaming = renamingId === node.id;
    const renameRef = useRef<HTMLInputElement>(null);
    const [renameValue, setRenameValue] = useState(node.name);

    useEffect(() => {
        if (isRenaming && renameRef.current) {
            renameRef.current.focus();
            renameRef.current.select();
        }
    }, [isRenaming]);

    useEffect(() => {
        setRenameValue(node.name);
    }, [node.name, isRenaming]);

    const handleRenameKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            onFinishRename(node.id, renameValue);
        } else if (e.key === 'Escape') {
            onCancelRename();
        }
    };

    const paddingLeft = depth * 16 + 4;

    let bgClass = '';
    if (isSelected) bgClass = 'bg-gray-200 text-black font-medium';
    else if (isHovered) bgClass = 'bg-gray-100 ';

    return (
        <>
            <div
                className={`flex items-center text-sm h-7 cursor-default select-none rounded-sm ${bgClass} ${isHidden ? 'opacity-40' : ''}`}
                style={{ paddingLeft }}
                onMouseEnter={() => onSetHovered(node.id)}
                onMouseLeave={() => onSetHovered(null)}
                onClick={(e) => {
                    e.stopPropagation();
                    onSelect(node.id, e);
                }}
                onDoubleClick={(e) => {
                    e.stopPropagation();
                    if (!isGroup || depth > 0) onStartRename(node.id);
                }}
            >
                {/* Chevron */}
                {isGroup ? (
                    <span
                        className='shrink-0 mr-0.5 cursor-pointer'
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleExpand(node.id);
                        }}
                    >
                        <ChevronRight className={`size-3 transition-transform duration-200 ease-in-out ${isExpanded ? 'rotate-90' : 'rotate-0'} ${isSelected ? 'text-black' : ''}`} />
                    </span>
                ) : (
                    <span className='w-3 shrink-0 mr-0.5' />
                )}

                {/* Name / rename input */}
                {isRenaming ? (
                    <input
                        ref={renameRef}
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={handleRenameKeyDown}
                        onBlur={() => onFinishRename(node.id, renameValue)}
                        className='text-sm bg-white text-black border border-gray-300 rounded -ml-2 pl-2 pr-1  h-full outline-none flex-1 min-w-0'
                        onClick={(e) => e.stopPropagation()}
                    />
                ) : (
                    <span className='truncate flex-1'>{node.name}</span>
                )}

                {/* Visibility toggle (visible on hover or when hidden) */}
                {(isHovered || isHidden) && !isRenaming && (
                    <span
                        className='ml-auto mr-1 shrink-0 cursor-pointer'
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleVisibility(node.id);
                        }}
                    >
                        {isHidden
                            ? <EyeOff className={`size-3.5 ${isSelected ? 'text-black' : 'text-gray-400'}`} />
                            : <Eye className={`size-3.5 ${isSelected ? 'text-black' : 'text-gray-500'}`} />
                        }
                    </span>
                )}
            </div>

            {/* Children */}
            {isGroup && isExpanded && node.children?.map(child => (
                <LayerRow
                    key={child.id}
                    node={child}
                    depth={depth + 1}
                    expandedIds={expandedIds}
                    selectedIds={selectedIds}
                    hiddenIds={hiddenIds}
                    hoveredId={hoveredId}
                    renamingId={renamingId}
                    onToggleExpand={onToggleExpand}
                    onSelect={onSelect}
                    onToggleVisibility={onToggleVisibility}
                    onSetHovered={onSetHovered}
                    onStartRename={onStartRename}
                    onFinishRename={onFinishRename}
                    onCancelRename={onCancelRename}
                />
            ))}
        </>
    );
};

// ─── LeftBar ────────────────────────────────────────────────────────────

const LeftBar = () => {
    const [projectName, setProjectName] = useState('Keycap Configurator');
    const projectNameRef = useRef<HTMLInputElement>(null);
    const frameworks = ["Cherry", "OEM", "DSA", "XDA", "MDA"]
    const language = ["English", "Hindi", "German", "Japanese", "Chinese"]
    const subLegends = ["None", "Devanagari", "Japanese", "Roman"]
    const keycapUnits = ["Hide", "Show"]

    // ── Layers state ───────────────────────────────────────────────────
    const [layers, setLayers] = useState<LayerNode[]>(initialLayers);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['r2', 'r3']));
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);

    const toggleExpand = useCallback((id: string) => {
        setExpandedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const handleSelect = useCallback((id: string, e: React.MouseEvent) => {
        if (renamingId) return;

        if (e.ctrlKey || e.metaKey) {
            // Toggle individual selection
            setSelectedIds(prev => {
                const next = new Set(prev);
                if (next.has(id)) next.delete(id);
                else next.add(id);
                return next;
            });
            setLastSelectedId(id);
        } else if (e.shiftKey && lastSelectedId) {
            // Range selection
            const visibleIds = getFlatVisibleIds(layers, expandedIds);
            const startIdx = visibleIds.indexOf(lastSelectedId);
            const endIdx = visibleIds.indexOf(id);
            if (startIdx !== -1 && endIdx !== -1) {
                const [from, to] = startIdx < endIdx ? [startIdx, endIdx] : [endIdx, startIdx];
                setSelectedIds(new Set(visibleIds.slice(from, to + 1)));
            }
        } else {
            // Single selection
            setSelectedIds(new Set([id]));
            setLastSelectedId(id);
        }
    }, [renamingId, lastSelectedId, layers, expandedIds]);

    const toggleVisibility = useCallback((id: string) => {
        setHiddenIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const startRename = useCallback((id: string) => {
        setRenamingId(id);
    }, []);

    const finishRename = useCallback((id: string, newName: string) => {
        if (newName.trim()) {
            setLayers(prev => updateNodeName(prev, id, newName.trim()));
        }
        setRenamingId(null);
    }, []);

    const cancelRename = useCallback(() => {
        setRenamingId(null);
    }, []);

    const clearSelection = useCallback(() => {
        if (!renamingId) setSelectedIds(new Set());
    }, [renamingId]);

    const layersContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (layersContainerRef.current && !layersContainerRef.current.contains(e.target as Node)) {
                if (!renamingId) setSelectedIds(new Set());
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [renamingId]);

    return (
        <>
            <div className='bg-white w-64 border-r border-gray-300 h-lvh'>
            {/* header  */}
            <div className='border-b border-gray-300  p-3'>
                <div className='flex justify-between items-center pl-2 mb-2'>
                    Logo
                    <div className='flex gap-1 items-center justify-center'>
                        <Undo2 className='size-5 text-gray-500 hover:text-black cursor-pointer transition-all duration-300' />
                        <Redo2 className='size-5 text-gray-500 hover:text-black cursor-pointer transition-all duration-300' />
                    </div>
                </div>
                <div className='relative'>
                    <Input
                        ref={projectNameRef}
                        placeholder="Enter name"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className='pr-8 border-transparent shadow-none focus-visible:border-ring'
                    />
                    <Pencil
                        className='size-4 text-gray-500 hover:text-black cursor-pointer absolute right-2 top-1/2 -translate-y-1/2'
                        onClick={() => projectNameRef.current?.focus()}
                    />
                </div>
                {/* <h1 className='font-semibold px-2 py-1 bg-gray-200/60 rounded-sm flex justify-between items-center'>Ratna<Pencil className='size-5 text-gray-600'/></h1> */}
            </div>

            {/* selections */}
            <div className='border-b border-gray-300  p-3 grid grid-cols-2 gap-1'>
                <Combobox items={language} defaultValue="English">
                    <div className='relative' >
                        <span className='absolute top-1 left-3 text-xs text-muted-foreground z-10'>Language</span>
                        <ComboboxInput placeholder="Select a language" className='h-12 [&_input]:pt-4 bg-gray-100' />
                    </div>
                    <ComboboxContent >
                        <ComboboxEmpty>No items found.</ComboboxEmpty>
                        <ComboboxList>
                            {(item) => (
                                <ComboboxItem key={item} value={item}>
                                    {item}
                                </ComboboxItem>
                            )}
                        </ComboboxList>
                    </ComboboxContent>
                </Combobox>
                <Combobox items={frameworks} defaultValue="Cherry">
                    <div className='relative'>
                        <span className='absolute top-1 left-3 text-xs text-muted-foreground z-10'>Profile</span>
                        <ComboboxInput placeholder="Select a profile" className='h-12 [&_input]:pt-4 bg-gray-100' />
                    </div>
                    <ComboboxContent>
                        <ComboboxEmpty>No items found.</ComboboxEmpty>
                        <ComboboxList>
                            {(item) => (
                                <ComboboxItem key={item} value={item}>
                                    {item}
                                </ComboboxItem>
                            )}
                        </ComboboxList>
                    </ComboboxContent>
                </Combobox>
                <Combobox items={subLegends} defaultValue="None">
                    <div className='relative'>
                        <span className='absolute top-1 left-3 text-xs text-muted-foreground z-10'>Sub-legend</span>
                        <ComboboxInput placeholder="Select a Sub-legend" className='h-12 [&_input]:pt-4 bg-gray-100' />
                    </div>
                    <ComboboxContent>
                        <ComboboxEmpty>No items found.</ComboboxEmpty>
                        <ComboboxList>
                            {(item) => (
                                <ComboboxItem key={item} value={item}>
                                    {item}
                                </ComboboxItem>
                            )}
                        </ComboboxList>
                    </ComboboxContent>
                </Combobox>
                <Combobox items={keycapUnits} defaultValue="Hide">
                    <div className='relative'>
                        <span className='absolute top-1 left-3 text-xs text-muted-foreground z-10'>Keycap Units</span>
                        <ComboboxInput placeholder="Display units" className='h-12 [&_input]:pt-4 bg-gray-100' />
                    </div>
                    <ComboboxContent>
                        <ComboboxEmpty>No items found.</ComboboxEmpty>
                        <ComboboxList>
                            {(item) => (
                                <ComboboxItem key={item} value={item}>
                                    {item}
                                </ComboboxItem>
                            )}
                        </ComboboxList>
                    </ComboboxContent>
                </Combobox>

            </div>

            {/* layers  */}
            <div
                ref={layersContainerRef}
                className='border-b border-gray-300  p-3 space-y-2'
                onMouseDown={(e) => {
                    // Only clear if clicking directly on the container, not on a layer row
                    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('[data-layers-container]') === e.currentTarget) {
                        clearSelection();
                    }
                }}
                data-layers-container
            >
                <h1 className='text-black font-semibold text-sm'>Layers</h1>
                <div className='space-y-0.5'>
                    {layers.map(node => (
                        <LayerRow
                            key={node.id}
                            node={node}
                            depth={0}
                            expandedIds={expandedIds}
                            selectedIds={selectedIds}
                            hiddenIds={hiddenIds}
                            hoveredId={hoveredId}
                            renamingId={renamingId}
                            onToggleExpand={toggleExpand}
                            onSelect={handleSelect}
                            onToggleVisibility={toggleVisibility}
                            onSetHovered={setHoveredId}
                            onStartRename={startRename}
                            onFinishRename={finishRename}
                            onCancelRename={cancelRename}
                        />
                    ))}
                </div>
            </div>

            {/* Pages  */}
            <div className='p-3 space-y-2'>
                <h1 className='text-black font-semibold text-sm'>Pages</h1>
                <div className='-ml-1 pl-2 text-sm rounded-sm text-gray-700'>Design</div>
                <div className='-ml-1 pl-2 py-1 text-sm rounded-sm bg-gray-200 font-medium'>R1-R2 Template</div>
                <div className='-ml-1 pl-2 text-sm rounded-sm text-gray-700'>R3-R4 Template</div>
            </div>
            </div>
        </>
    )
}

export default LeftBar