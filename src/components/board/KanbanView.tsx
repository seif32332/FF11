"use client";

import { useState, useEffect } from "react";
import { Plus, MoreHorizontal, MessageSquare, Paperclip, User as UserIcon } from "lucide-react";

interface Item {
    id: string;
    name: string;
    status?: { label: string; color: string };
    assignments: { user: { id: string; name: string } }[];
    _count?: { comments: number; attachments: number };
}

interface Column {
    id: string;
    label: string;
    color: string;
    items: Item[];
}

interface KanbanViewProps {
    boardId: string;
    statusColumnId: string;
    statusOptions: { label: string; color: string }[];
    items: Item[];
    onItemMove: (itemId: string, newStatus: { label: string; color: string }) => void;
    onItemClick: (itemId: string) => void;
}

export default function KanbanView({
    statusOptions,
    items,
    onItemMove,
    onItemClick
}: KanbanViewProps) {
    const [columns, setColumns] = useState<Column[]>([]);
    const [draggedItem, setDraggedItem] = useState<string | null>(null);
    const [dropTarget, setDropTarget] = useState<string | null>(null);

    useEffect(() => {
        // Group items by status
        const groupedColumns = statusOptions.map(option => ({
            id: option.label,
            label: option.label,
            color: option.color,
            items: items.filter(item => item.status?.label === option.label)
        }));
        setColumns(groupedColumns);
    }, [items, statusOptions]);

    const handleDragStart = (e: React.DragEvent, itemId: string) => {
        setDraggedItem(itemId);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent, columnId: string) => {
        e.preventDefault();
        setDropTarget(columnId);
    };

    const handleDragLeave = () => {
        setDropTarget(null);
    };

    const handleDrop = (e: React.DragEvent, columnId: string) => {
        e.preventDefault();
        if (draggedItem) {
            const targetColumn = columns.find(c => c.id === columnId);
            if (targetColumn) {
                onItemMove(draggedItem, { label: targetColumn.label, color: targetColumn.color });
            }
        }
        setDraggedItem(null);
        setDropTarget(null);
    };

    return (
        <div className="kanban-board">
            {columns.map((column) => (
                <div
                    key={column.id}
                    className={`kanban-column ${dropTarget === column.id ? "drag-over" : ""}`}
                    onDragOver={(e) => handleDragOver(e, column.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, column.id)}
                >
                    {/* Column Header */}
                    <div className="kanban-column-header">
                        <div className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ background: column.color }}
                            />
                            <span className="font-medium">{column.label}</span>
                            <span className="text-xs text-gray-500 bg-gray-700 px-2 py-0.5 rounded-full">
                                {column.items.length}
                            </span>
                        </div>
                        <button className="p-1 rounded hover:bg-white/10">
                            <MoreHorizontal className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>

                    {/* Column Content */}
                    <div className="kanban-column-content">
                        {column.items.map((item) => (
                            <div
                                key={item.id}
                                className={`kanban-card ${draggedItem === item.id ? "dragging" : ""}`}
                                draggable
                                onDragStart={(e) => handleDragStart(e, item.id)}
                                onClick={() => onItemClick(item.id)}
                            >
                                <div className="font-medium mb-2">{item.name}</div>

                                <div className="flex items-center justify-between">
                                    {/* Assignees */}
                                    <div className="flex items-center gap-1">
                                        {item.assignments.length > 0 ? (
                                            <div className="avatar-group">
                                                {item.assignments.slice(0, 2).map((a) => (
                                                    <div key={a.user.id} className="avatar avatar-sm" title={a.user.name}>
                                                        {a.user.name[0]}
                                                    </div>
                                                ))}
                                                {item.assignments.length > 2 && (
                                                    <div className="avatar avatar-sm bg-gray-600">
                                                        +{item.assignments.length - 2}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <button className="w-6 h-6 rounded-full border border-dashed border-gray-500 flex items-center justify-center">
                                                <UserIcon className="w-3 h-3 text-gray-500" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Meta info */}
                                    <div className="flex items-center gap-2 text-gray-500">
                                        {item._count && item._count.comments > 0 && (
                                            <span className="flex items-center gap-1 text-xs">
                                                <MessageSquare className="w-3 h-3" />
                                                {item._count.comments}
                                            </span>
                                        )}
                                        {item._count && item._count.attachments > 0 && (
                                            <span className="flex items-center gap-1 text-xs">
                                                <Paperclip className="w-3 h-3" />
                                                {item._count.attachments}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Add Card Button */}
                        <button className="w-full p-2 rounded-lg border border-dashed border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 flex items-center justify-center gap-2 mt-2">
                            <Plus className="w-4 h-4" />
                            إضافة عنصر
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
