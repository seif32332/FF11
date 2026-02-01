"use client";

import { useState } from "react";
import {
    X,
    Trash2,
    Type,
    Hash,
    Calendar,
    User,
    CheckSquare,
    Link,
    FileText,
    Star,
    Plus,
    GripVertical
} from "lucide-react";

interface StatusOption {
    label: string;
    color: string;
}

interface ColumnSettings {
    title: string;
    type: string;
    width: number;
    options?: StatusOption[];
}

interface ColumnSettingsModalProps {
    column: {
        id: string;
        title: string;
        type: string;
        width: number;
        settings: Record<string, unknown>;
    };
    onSave: (columnId: string, settings: ColumnSettings) => void;
    onDelete: (columnId: string) => void;
    onClose: () => void;
}

const COLUMN_TYPES = [
    { type: "TEXT", label: "نص", icon: Type },
    { type: "NUMBER", label: "رقم", icon: Hash },
    { type: "STATUS", label: "حالة", icon: CheckSquare },
    { type: "DATE", label: "تاريخ", icon: Calendar },
    { type: "PERSON", label: "شخص", icon: User },
    { type: "CHECKBOX", label: "خانة اختيار", icon: CheckSquare },
    { type: "LINK", label: "رابط", icon: Link },
    { type: "FILE", label: "ملف", icon: FileText },
    { type: "RATING", label: "تقييم", icon: Star },
];

const DEFAULT_STATUS_OPTIONS: StatusOption[] = [
    { label: "جديد", color: "#579bfc" },
    { label: "قيد العمل", color: "#fdab3d" },
    { label: "عالق", color: "#e2445c" },
    { label: "مكتمل", color: "#00c875" },
];

const PRESET_COLORS = [
    "#579bfc", "#fdab3d", "#e2445c", "#00c875",
    "#9d50bb", "#ff6b6b", "#4ecdc4", "#45b7d1",
    "#96ceb4", "#ffeaa7", "#dfe6e9", "#636e72"
];

export default function ColumnSettingsModal({
    column,
    onSave,
    onDelete,
    onClose,
}: ColumnSettingsModalProps) {
    const [title, setTitle] = useState(column.title);
    const [type, setType] = useState(column.type);
    const [width, setWidth] = useState(column.width);
    const [statusOptions, setStatusOptions] = useState<StatusOption[]>(
        (column.settings as { options?: StatusOption[] })?.options || DEFAULT_STATUS_OPTIONS
    );
    const [showTypeSelector, setShowTypeSelector] = useState(false);
    const [editingOptionIndex, setEditingOptionIndex] = useState<number | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleSave = () => {
        const settings: ColumnSettings = {
            title,
            type,
            width,
        };

        if (type === "STATUS") {
            settings.options = statusOptions;
        }

        onSave(column.id, settings);
        onClose();
    };

    const handleAddOption = () => {
        const newOption: StatusOption = {
            label: `حالة ${statusOptions.length + 1}`,
            color: PRESET_COLORS[statusOptions.length % PRESET_COLORS.length]
        };
        setStatusOptions([...statusOptions, newOption]);
        setEditingOptionIndex(statusOptions.length);
    };

    const handleUpdateOption = (index: number, field: 'label' | 'color', value: string) => {
        const updated = [...statusOptions];
        updated[index] = { ...updated[index], [field]: value };
        setStatusOptions(updated);
    };

    const handleRemoveOption = (index: number) => {
        if (statusOptions.length > 1) {
            setStatusOptions(statusOptions.filter((_, i) => i !== index));
        }
    };

    const handleDelete = () => {
        onDelete(column.id);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: "480px" }}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold">إعدادات العمود</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-white/10"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Column Title */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                        اسم العمود
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="input w-full"
                        placeholder="أدخل اسم العمود..."
                    />
                </div>

                {/* Column Type */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                        نوع العمود
                    </label>
                    <button
                        onClick={() => setShowTypeSelector(!showTypeSelector)}
                        className="input w-full flex items-center justify-between"
                    >
                        <span className="flex items-center gap-2">
                            {(() => {
                                const TypeIcon = COLUMN_TYPES.find(t => t.type === type)?.icon || Type;
                                return <TypeIcon className="w-4 h-4" />;
                            })()}
                            {COLUMN_TYPES.find(t => t.type === type)?.label || type}
                        </span>
                    </button>

                    {showTypeSelector && (
                        <div className="mt-2 p-2 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>
                            <div className="grid grid-cols-3 gap-2">
                                {COLUMN_TYPES.map((t) => (
                                    <button
                                        key={t.type}
                                        onClick={() => {
                                            setType(t.type);
                                            setShowTypeSelector(false);
                                        }}
                                        className={`p-3 rounded-lg text-center hover:bg-white/10 ${type === t.type ? 'bg-white/10 ring-1 ring-primary' : ''
                                            }`}
                                    >
                                        <t.icon className="w-5 h-5 mx-auto mb-1" />
                                        <span className="text-xs">{t.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Status Options (only for STATUS type) */}
                {type === "STATUS" && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            خيارات الحالة
                        </label>
                        <div className="space-y-2">
                            {statusOptions.map((option, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-2 p-2 rounded-lg"
                                    style={{ background: 'var(--bg-tertiary)' }}
                                >
                                    <GripVertical className="w-4 h-4 text-gray-500 cursor-grab" />

                                    {/* Color Picker */}
                                    <div className="relative">
                                        <button
                                            className="w-6 h-6 rounded"
                                            style={{ background: option.color }}
                                            onClick={() => setEditingOptionIndex(
                                                editingOptionIndex === index ? null : index
                                            )}
                                        />
                                        {editingOptionIndex === index && (
                                            <div
                                                className="absolute top-full right-0 mt-2 p-2 rounded-lg grid grid-cols-6 gap-1 z-20"
                                                style={{ background: 'var(--bg-secondary)' }}
                                            >
                                                {PRESET_COLORS.map((color) => (
                                                    <button
                                                        key={color}
                                                        className="w-6 h-6 rounded"
                                                        style={{ background: color }}
                                                        onClick={() => {
                                                            handleUpdateOption(index, 'color', color);
                                                            setEditingOptionIndex(null);
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Label Input */}
                                    <input
                                        type="text"
                                        value={option.label}
                                        onChange={(e) => handleUpdateOption(index, 'label', e.target.value)}
                                        className="flex-1 bg-transparent border-none text-sm focus:outline-none"
                                        placeholder="اسم الحالة..."
                                    />

                                    {/* Remove Button */}
                                    {statusOptions.length > 1 && (
                                        <button
                                            onClick={() => handleRemoveOption(index)}
                                            className="p-1 rounded hover:bg-white/10 text-red-400"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}

                            <button
                                onClick={handleAddOption}
                                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white p-2"
                            >
                                <Plus className="w-4 h-4" />
                                إضافة حالة جديدة
                            </button>
                        </div>
                    </div>
                )}

                {/* Column Width */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                        عرض العمود: {width}px
                    </label>
                    <input
                        type="range"
                        min="100"
                        max="400"
                        value={width}
                        onChange={(e) => setWidth(parseInt(e.target.value))}
                        className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>ضيق</span>
                        <span>عريض</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                    {!showDeleteConfirm ? (
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="btn btn-ghost text-red-400 hover:bg-red-500/10"
                        >
                            <Trash2 className="w-4 h-4" />
                            حذف العمود
                        </button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-red-400">هل أنت متأكد؟</span>
                            <button
                                onClick={handleDelete}
                                className="btn btn-sm bg-red-500 hover:bg-red-600"
                            >
                                نعم، احذف
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="btn btn-ghost btn-sm"
                            >
                                إلغاء
                            </button>
                        </div>
                    )}

                    <div className="flex gap-2">
                        <button onClick={onClose} className="btn btn-secondary">
                            إلغاء
                        </button>
                        <button onClick={handleSave} className="btn btn-primary">
                            حفظ التغييرات
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.6);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 100;
                    padding: 1rem;
                }

                .modal-content {
                    background: var(--bg-secondary);
                    border-radius: 12px;
                    padding: 1.5rem;
                    width: 100%;
                    max-height: 90vh;
                    overflow-y: auto;
                    border: 1px solid var(--border-color);
                }
            `}</style>
        </div>
    );
}
