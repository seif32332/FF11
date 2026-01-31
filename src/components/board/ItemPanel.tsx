"use client";

import { useState } from "react";
import { X, MessageSquare, Paperclip, Clock, User, Send, Trash2 } from "lucide-react";

interface ItemPanelProps {
    item: {
        id: string;
        name: string;
        createdAt: string;
        creator: { name: string };
        values: Array<{ columnId: string; value: unknown }>;
        assignments: Array<{ user: { id: string; name: string; avatar?: string } }>;
        comments: Array<{
            id: string;
            content: string;
            createdAt: string;
            user: { name: string; avatar?: string };
        }>;
        attachments: Array<{
            id: string;
            name: string;
            url: string;
            type: string;
            size: number;
        }>;
    };
    columns: Array<{ id: string; title: string; type: string }>;
    onClose: () => void;
    onUpdate: (itemId: string, data: Record<string, unknown>) => void;
    onAddComment: (itemId: string, content: string) => void;
}

export default function ItemPanel({
    item,
    onClose,
    onAddComment
}: ItemPanelProps) {
    const [activeTab, setActiveTab] = useState<"updates" | "files" | "activity">("updates");
    const [newComment, setNewComment] = useState("");

    const handleAddComment = () => {
        if (!newComment.trim()) return;
        onAddComment(item.id, newComment);
        setNewComment("");
    };

    return (
        <div className="fixed inset-0 z-50 flex">
            {/* Overlay */}
            <div
                className="flex-1 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Panel */}
            <div
                className="w-full max-w-xl h-full overflow-y-auto animate-slideUp"
                style={{ background: 'var(--bg-secondary)' }}
            >
                {/* Header */}
                <div className="sticky top-0 z-10 p-4 border-b flex items-center justify-between" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                    <h2 className="text-lg font-bold truncate">{item.name}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-white/10"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Meta Info */}
                <div className="p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {item.creator.name}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(item.createdAt).toLocaleDateString("ar")}
                        </span>
                    </div>

                    {/* Assignees */}
                    <div className="mt-4">
                        <label className="text-sm text-gray-400 mb-2 block">المسؤولين</label>
                        <div className="flex items-center gap-2">
                            {item.assignments.map((a) => (
                                <div
                                    key={a.user.id}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                                    style={{ background: 'var(--bg-tertiary)' }}
                                >
                                    <div className="avatar avatar-sm">{a.user.name[0]}</div>
                                    <span className="text-sm">{a.user.name}</span>
                                </div>
                            ))}
                            <button className="p-2 rounded-full border border-dashed border-gray-500 hover:border-gray-300">
                                <User className="w-4 h-4 text-gray-500" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <button
                        onClick={() => setActiveTab("updates")}
                        className={`flex-1 py-3 text-center font-medium transition-colors ${activeTab === "updates"
                                ? "border-b-2"
                                : "text-gray-400 hover:text-white"
                            }`}
                        style={activeTab === "updates" ? { borderColor: 'var(--primary)' } : {}}
                    >
                        <MessageSquare className="w-4 h-4 inline-block ml-1" />
                        التحديثات ({item.comments.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("files")}
                        className={`flex-1 py-3 text-center font-medium transition-colors ${activeTab === "files"
                                ? "border-b-2"
                                : "text-gray-400 hover:text-white"
                            }`}
                        style={activeTab === "files" ? { borderColor: 'var(--primary)' } : {}}
                    >
                        <Paperclip className="w-4 h-4 inline-block ml-1" />
                        الملفات ({item.attachments.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("activity")}
                        className={`flex-1 py-3 text-center font-medium transition-colors ${activeTab === "activity"
                                ? "border-b-2"
                                : "text-gray-400 hover:text-white"
                            }`}
                        style={activeTab === "activity" ? { borderColor: 'var(--primary)' } : {}}
                    >
                        <Clock className="w-4 h-4 inline-block ml-1" />
                        النشاط
                    </button>
                </div>

                {/* Tab Content */}
                <div className="p-4">
                    {activeTab === "updates" && (
                        <div>
                            {/* Add Comment */}
                            <div className="mb-4">
                                <div className="flex gap-3">
                                    <div className="avatar flex-shrink-0">م</div>
                                    <div className="flex-1">
                                        <textarea
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="أضف تعليقاً..."
                                            className="input min-h-[80px] resize-none"
                                        />
                                        <div className="flex justify-end mt-2">
                                            <button
                                                onClick={handleAddComment}
                                                disabled={!newComment.trim()}
                                                className="btn btn-primary"
                                            >
                                                <Send className="w-4 h-4" />
                                                إرسال
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Comments List */}
                            <div className="space-y-4">
                                {item.comments.length > 0 ? (
                                    item.comments.map((comment) => (
                                        <div key={comment.id} className="comment">
                                            <div className="avatar flex-shrink-0">
                                                {comment.user.name[0]}
                                            </div>
                                            <div className="comment-content">
                                                <div className="comment-header">
                                                    <span className="comment-author">{comment.user.name}</span>
                                                    <span className="comment-time">
                                                        {new Date(comment.createdAt).toLocaleDateString("ar")}
                                                    </span>
                                                </div>
                                                <p className="text-gray-300">{comment.content}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p>لا توجد تعليقات بعد</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "files" && (
                        <div>
                            {/* Upload Area */}
                            <div className="border-2 border-dashed rounded-lg p-8 text-center mb-4" style={{ borderColor: 'var(--border-color)' }}>
                                <Paperclip className="w-8 h-8 mx-auto mb-2 text-gray-500" />
                                <p className="text-gray-400 mb-2">اسحب الملفات هنا أو</p>
                                <button className="btn btn-secondary">
                                    اختر ملفات
                                </button>
                            </div>

                            {/* Files List */}
                            <div className="space-y-2">
                                {item.attachments.length > 0 ? (
                                    item.attachments.map((file) => (
                                        <div
                                            key={file.id}
                                            className="flex items-center gap-3 p-3 rounded-lg"
                                            style={{ background: 'var(--bg-tertiary)' }}
                                        >
                                            <Paperclip className="w-5 h-5 text-gray-400" />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{file.name}</p>
                                                <p className="text-xs text-gray-500">
                                                    {(file.size / 1024).toFixed(1)} KB
                                                </p>
                                            </div>
                                            <button className="p-2 rounded hover:bg-white/10 text-red-400">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <Paperclip className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p>لا توجد ملفات مرفقة</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "activity" && (
                        <div className="text-center py-8 text-gray-500">
                            <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>سجل النشاط قريباً</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
