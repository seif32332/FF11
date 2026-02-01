"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import {
    Plus,
    MoreHorizontal,
    ChevronDown,
    ChevronLeft,
    Trash2,
    Edit2,
    GripVertical,
    Search,
    Filter,
    SortAsc,
    LayoutGrid,
    List,
    Calendar,
    MessageSquare,
    Paperclip,
    User as UserIcon,
    Settings
} from "lucide-react";
import ColumnSettingsModal from "@/components/board/ColumnSettingsModal";

interface Column {
    id: string;
    title: string;
    type: string;
    width: number;
    position: number;
    settings: Record<string, unknown>;
}

interface ItemValue {
    id: string;
    columnId: string;
    value: unknown;
}

interface Item {
    id: string;
    name: string;
    position: number;
    values: ItemValue[];
    assignments: { user: { id: string; name: string; avatar?: string } }[];
    _count?: { comments: number; attachments: number };
}

interface Group {
    id: string;
    name: string;
    color: string;
    position: number;
    collapsed: boolean;
    items: Item[];
}

interface Board {
    id: string;
    name: string;
    description?: string;
    color: string;
    columns: Column[];
    groups: Group[];
}

const STATUS_OPTIONS = [
    { label: "جديد", color: "#579bfc" },
    { label: "قيد العمل", color: "#fdab3d" },
    { label: "عالق", color: "#e2445c" },
    { label: "مكتمل", color: "#00c875" },
];

export default function BoardPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [board, setBoard] = useState<Board | null>(null);
    const [loading, setLoading] = useState(true);
    const [collapsedGroups, setCollapsedGroups] = useState<string[]>([]);
    const [editingItem, setEditingItem] = useState<string | null>(null);
    const [newItemName, setNewItemName] = useState("");
    const [addingToGroup, setAddingToGroup] = useState<string | null>(null);
    const [selectedColumn, setSelectedColumn] = useState<Column | null>(null);

    useEffect(() => {
        fetchBoard();
    }, [id]);

    const fetchBoard = async () => {
        try {
            const response = await fetch(`/api/boards/${id}`);
            if (response.ok) {
                const data = await response.json();
                setBoard(data);
            } else {
                router.push("/dashboard");
            }
        } catch (error) {
            console.error("Error fetching board:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleGroup = (groupId: string) => {
        setCollapsedGroups(prev =>
            prev.includes(groupId) ? prev.filter(g => g !== groupId) : [...prev, groupId]
        );
    };

    const handleAddItem = async (groupId: string) => {
        if (!newItemName.trim()) return;

        try {
            const response = await fetch(`/api/boards/${id}/items`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newItemName, groupId }),
            });

            if (response.ok) {
                fetchBoard();
                setNewItemName("");
                setAddingToGroup(null);
            }
        } catch (error) {
            console.error("Error adding item:", error);
        }
    };

    const handleUpdateValue = async (itemId: string, columnId: string, value: unknown) => {
        try {
            await fetch(`/api/items/${itemId}/values`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ columnId, value }),
            });
            fetchBoard();
        } catch (error) {
            console.error("Error updating value:", error);
        }
    };

    const handleUpdateColumn = async (
        columnId: string,
        settings: { title: string; type: string; width: number; options?: { label: string; color: string }[] }
    ) => {
        try {
            await fetch(`/api/boards/${id}/columns/${columnId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            });
            fetchBoard();
        } catch (error) {
            console.error("Error updating column:", error);
        }
    };

    const handleDeleteColumn = async (columnId: string) => {
        try {
            await fetch(`/api/boards/${id}/columns/${columnId}`, {
                method: "DELETE",
            });
            fetchBoard();
        } catch (error) {
            console.error("Error deleting column:", error);
        }
    };

    const getItemValue = (item: Item, columnId: string) => {
        const itemValue = item.values.find(v => v.columnId === columnId);
        return itemValue?.value;
    };

    const renderCellContent = (item: Item, column: Column) => {
        const value = getItemValue(item, column.id);

        switch (column.type) {
            case "TEXT":
                return (
                    <span className="text-sm truncate">{value as string || "-"}</span>
                );

            case "STATUS":
                const statusValue = value as { label: string; color: string } | null;
                const options = (column.settings as { options?: typeof STATUS_OPTIONS })?.options || STATUS_OPTIONS;
                return (
                    <div className="relative group">
                        <div
                            className="status-cell cursor-pointer min-w-[100px]"
                            style={{ background: statusValue?.color || options[0].color }}
                        >
                            {statusValue?.label || options[0].label}
                        </div>
                        <div className="hidden group-hover:block absolute top-full right-0 mt-1 z-20 bg-gray-800 rounded-lg shadow-lg p-1 min-w-[120px]">
                            {options.map((option) => (
                                <button
                                    key={option.label}
                                    onClick={() => handleUpdateValue(item.id, column.id, option)}
                                    className="w-full px-3 py-2 text-sm rounded hover:bg-white/10 flex items-center gap-2"
                                >
                                    <div className="w-3 h-3 rounded" style={{ background: option.color }} />
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case "DATE":
                return (
                    <input
                        type="date"
                        value={(value as string) || ""}
                        onChange={(e) => handleUpdateValue(item.id, column.id, e.target.value)}
                        className="bg-transparent border-none text-sm cursor-pointer"
                        dir="ltr"
                    />
                );

            case "PERSON":
                return (
                    <div className="flex items-center gap-1">
                        {item.assignments.length > 0 ? (
                            <div className="avatar-group">
                                {item.assignments.slice(0, 3).map((a) => (
                                    <div key={a.user.id} className="avatar avatar-sm" title={a.user.name}>
                                        {a.user.name[0]}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <button className="w-7 h-7 rounded-full border border-dashed border-gray-500 flex items-center justify-center hover:border-gray-300">
                                <UserIcon className="w-4 h-4 text-gray-500" />
                            </button>
                        )}
                    </div>
                );

            case "NUMBER":
                return (
                    <input
                        type="number"
                        value={(value as number) || ""}
                        onChange={(e) => handleUpdateValue(item.id, column.id, parseFloat(e.target.value))}
                        className="bg-transparent border-none text-sm w-20"
                        dir="ltr"
                    />
                );

            case "CHECKBOX":
                return (
                    <input
                        type="checkbox"
                        checked={!!value}
                        onChange={(e) => handleUpdateValue(item.id, column.id, e.target.checked)}
                        className="w-5 h-5 rounded"
                    />
                );

            default:
                return <span className="text-sm text-gray-500">-</span>;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (!board) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="text-center">
                    <h2 className="text-xl font-bold mb-2">اللوحة غير موجودة</h2>
                    <button onClick={() => router.push("/dashboard")} className="btn btn-primary">
                        العودة للرئيسية
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-56px)]">
            {/* Board Header */}
            <div className="p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold text-white"
                            style={{ background: board.color }}
                        >
                            {board.name[0]}
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">{board.name}</h1>
                            {board.description && (
                                <p className="text-sm text-gray-400">{board.description}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="btn btn-secondary">
                            <Filter className="w-4 h-4" />
                            فلترة
                        </button>
                        <button className="btn btn-secondary">
                            <SortAsc className="w-4 h-4" />
                            ترتيب
                        </button>
                        <button className="btn btn-primary">
                            <Plus className="w-4 h-4" />
                            عنصر جديد
                        </button>
                    </div>
                </div>

                {/* View Tabs */}
                <div className="flex items-center gap-1">
                    <button className="px-4 py-2 rounded-t-lg font-medium" style={{ background: 'var(--bg-tertiary)' }}>
                        <List className="w-4 h-4 inline-block ml-2" />
                        جدول
                    </button>
                    <button className="px-4 py-2 rounded-t-lg text-gray-400 hover:text-white hover:bg-white/5">
                        <LayoutGrid className="w-4 h-4 inline-block ml-2" />
                        كانبان
                    </button>
                    <button className="px-4 py-2 rounded-t-lg text-gray-400 hover:text-white hover:bg-white/5">
                        <Calendar className="w-4 h-4 inline-block ml-2" />
                        تقويم
                    </button>
                </div>
            </div>

            {/* Board Content */}
            <div className="flex-1 overflow-auto p-4">
                {/* Search Row */}
                <div className="mb-4">
                    <div className="relative w-64">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="بحث في العناصر..."
                            className="input pr-9 py-2 text-sm"
                        />
                    </div>
                </div>

                {/* Groups */}
                {board.groups.map((group) => (
                    <div key={group.id} className="mb-6">
                        {/* Group Header */}
                        <div
                            className="flex items-center gap-2 p-2 rounded-t-lg cursor-pointer select-none"
                            style={{ background: 'var(--bg-tertiary)' }}
                            onClick={() => toggleGroup(group.id)}
                        >
                            <div
                                className="w-1 h-6 rounded"
                                style={{ background: group.color }}
                            />
                            <ChevronDown
                                className={`w-4 h-4 transition-transform ${collapsedGroups.includes(group.id) ? "-rotate-90" : ""
                                    }`}
                            />
                            <span className="font-medium">{group.name}</span>
                            <span className="text-sm text-gray-400">({group.items.length} عنصر)</span>
                            <button className="p-1 rounded hover:bg-white/10 mr-auto">
                                <MoreHorizontal className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Table */}
                        {!collapsedGroups.includes(group.id) && (
                            <div className="border rounded-b-lg overflow-hidden" style={{ borderColor: 'var(--border-color)' }}>
                                <table className="w-full">
                                    <thead>
                                        <tr style={{ background: 'var(--bg-secondary)' }}>
                                            <th className="w-8 p-2"></th>
                                            <th className="p-2 text-right text-sm font-medium text-gray-400 min-w-[200px]">
                                                العنصر
                                            </th>
                                            {board.columns.filter(c => c.type !== "TEXT").map((column) => (
                                                <th
                                                    key={column.id}
                                                    className="p-2 text-right text-sm font-medium text-gray-400 group/col"
                                                    style={{ minWidth: column.width }}
                                                >
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span>{column.title}</span>
                                                        <button
                                                            onClick={() => setSelectedColumn(column)}
                                                            className="p-1 rounded hover:bg-white/10 opacity-0 group-hover/col:opacity-100 transition-opacity"
                                                            title="إعدادات العمود"
                                                        >
                                                            <Settings className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </th>
                                            ))}
                                            <th className="w-20 p-2"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {group.items.map((item) => (
                                            <tr
                                                key={item.id}
                                                className="board-row group"
                                            >
                                                <td className="p-2 text-center">
                                                    <GripVertical className="w-4 h-4 text-gray-600 opacity-0 group-hover:opacity-100 cursor-grab" />
                                                </td>
                                                <td className="p-2">
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="text"
                                                            value={editingItem === item.id ? newItemName : item.name}
                                                            onChange={(e) => setNewItemName(e.target.value)}
                                                            onFocus={() => {
                                                                setEditingItem(item.id);
                                                                setNewItemName(item.name);
                                                            }}
                                                            onBlur={() => setEditingItem(null)}
                                                            className="bg-transparent border-none font-medium focus:outline-none flex-1"
                                                        />
                                                        {item._count && (
                                                            <div className="flex items-center gap-2 text-gray-500">
                                                                {item._count.comments > 0 && (
                                                                    <span className="flex items-center gap-1 text-xs">
                                                                        <MessageSquare className="w-3 h-3" />
                                                                        {item._count.comments}
                                                                    </span>
                                                                )}
                                                                {item._count.attachments > 0 && (
                                                                    <span className="flex items-center gap-1 text-xs">
                                                                        <Paperclip className="w-3 h-3" />
                                                                        {item._count.attachments}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                {board.columns.filter(c => c.type !== "TEXT").map((column) => (
                                                    <td key={column.id} className="p-2">
                                                        {renderCellContent(item, column)}
                                                    </td>
                                                ))}
                                                <td className="p-2">
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                                                        <button className="p-1 rounded hover:bg-white/10">
                                                            <Edit2 className="w-4 h-4 text-gray-400" />
                                                        </button>
                                                        <button className="p-1 rounded hover:bg-white/10">
                                                            <Trash2 className="w-4 h-4 text-red-400" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}

                                        {/* Add Item Row */}
                                        <tr className="border-t" style={{ borderColor: 'var(--border-color)' }}>
                                            <td colSpan={board.columns.length + 2} className="p-2">
                                                {addingToGroup === group.id ? (
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="text"
                                                            value={newItemName}
                                                            onChange={(e) => setNewItemName(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === "Enter") handleAddItem(group.id);
                                                                if (e.key === "Escape") {
                                                                    setAddingToGroup(null);
                                                                    setNewItemName("");
                                                                }
                                                            }}
                                                            placeholder="اسم العنصر الجديد..."
                                                            className="input py-1 flex-1"
                                                            autoFocus
                                                        />
                                                        <button
                                                            onClick={() => handleAddItem(group.id)}
                                                            className="btn btn-primary btn-sm"
                                                        >
                                                            إضافة
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setAddingToGroup(null);
                                                                setNewItemName("");
                                                            }}
                                                            className="btn btn-ghost btn-sm"
                                                        >
                                                            إلغاء
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setAddingToGroup(group.id)}
                                                        className="flex items-center gap-2 text-gray-400 hover:text-white"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                        إضافة عنصر
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ))}

                {/* Add Group */}
                <button className="flex items-center gap-2 text-gray-400 hover:text-white mt-4">
                    <Plus className="w-4 h-4" />
                    إضافة مجموعة جديدة
                </button>
            </div>

            {/* Column Settings Modal */}
            {selectedColumn && (
                <ColumnSettingsModal
                    column={selectedColumn}
                    onSave={handleUpdateColumn}
                    onDelete={handleDeleteColumn}
                    onClose={() => setSelectedColumn(null)}
                />
            )}
        </div>
    );
}
