"use client";

import { useState, useRef, useCallback } from "react";
import {
    Upload,
    File,
    FileText,
    Image,
    X,
    Download,
    Trash2,
    Loader2
} from "lucide-react";

interface Attachment {
    id: string;
    filename: string;
    url: string;
    size: number;
    mimeType: string;
    createdAt: string;
    user: {
        id: string;
        name: string;
        avatar?: string;
    };
}

interface FileUploadProps {
    itemId: string;
    attachments: Attachment[];
    onUpload: (attachment: Attachment) => void;
    onDelete: (attachmentId: string) => void;
}

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 بايت";
    const k = 1024;
    const sizes = ["بايت", "ك.ب", "م.ب", "ج.ب"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) {
        return <Image className="w-5 h-5 text-blue-400" />;
    }
    if (mimeType.startsWith("text/") || mimeType.includes("pdf")) {
        return <FileText className="w-5 h-5 text-red-400" />;
    }
    return <File className="w-5 h-5 text-gray-400" />;
};

export default function FileUpload({ itemId, attachments, onUpload, onDelete }: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            uploadFiles(files);
        }
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            uploadFiles(files);
        }
    };

    const uploadFiles = async (files: File[]) => {
        setIsUploading(true);
        setUploadProgress(0);

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const formData = new FormData();
            formData.append("file", file);
            formData.append("itemId", itemId);

            try {
                const response = await fetch("/api/uploads", {
                    method: "POST",
                    body: formData,
                });

                if (response.ok) {
                    const attachment = await response.json();
                    onUpload(attachment);
                }
            } catch (error) {
                console.error("Upload error:", error);
            }

            setUploadProgress(((i + 1) / files.length) * 100);
        }

        setIsUploading(false);
        setUploadProgress(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleDelete = async (attachment: Attachment) => {
        try {
            await fetch(`/api/uploads?id=${attachment.id}`, {
                method: "DELETE",
            });
            onDelete(attachment.id);
        } catch (error) {
            console.error("Delete error:", error);
        }
    };

    return (
        <div className="file-upload-container">
            {/* Drop Zone */}
            <div
                className={`drop-zone ${isDragging ? 'dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                    border: `2px dashed ${isDragging ? 'var(--primary)' : 'var(--border-color)'}`,
                    borderRadius: '8px',
                    padding: '1.5rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: isDragging ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                    transition: 'all 0.2s',
                }}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    style={{ display: 'none' }}
                />
                {isUploading ? (
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--primary)' }} />
                        <p className="text-sm">جاري الرفع... {Math.round(uploadProgress)}%</p>
                        <div
                            className="w-full h-2 rounded-full overflow-hidden"
                            style={{ background: 'var(--bg-tertiary)' }}
                        >
                            <div
                                className="h-full transition-all duration-300"
                                style={{
                                    width: `${uploadProgress}%`,
                                    background: 'var(--primary)',
                                }}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2">
                        <Upload className="w-8 h-8 text-gray-400" />
                        <p className="text-sm text-gray-400">
                            اسحب الملفات هنا أو انقر للاختيار
                        </p>
                    </div>
                )}
            </div>

            {/* Attachments List */}
            {attachments.length > 0 && (
                <div className="attachments-list mt-4 space-y-2">
                    {attachments.map((attachment) => (
                        <div
                            key={attachment.id}
                            className="attachment-item flex items-center gap-3 p-3 rounded-lg"
                            style={{ background: 'var(--bg-tertiary)' }}
                        >
                            {/* File Icon or Preview */}
                            {attachment.mimeType.startsWith("image/") ? (
                                <img
                                    src={attachment.url}
                                    alt={attachment.filename}
                                    className="w-10 h-10 rounded object-cover"
                                />
                            ) : (
                                <div
                                    className="w-10 h-10 rounded flex items-center justify-center"
                                    style={{ background: 'var(--bg-secondary)' }}
                                >
                                    {getFileIcon(attachment.mimeType)}
                                </div>
                            )}

                            {/* File Info */}
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{attachment.filename}</p>
                                <p className="text-xs text-gray-500">
                                    {formatFileSize(attachment.size)} • {attachment.user.name}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1">
                                <a
                                    href={attachment.url}
                                    download={attachment.filename}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded hover:bg-white/10"
                                    title="تحميل"
                                >
                                    <Download className="w-4 h-4" />
                                </a>
                                <button
                                    onClick={() => handleDelete(attachment)}
                                    className="p-2 rounded hover:bg-red-500/20 text-red-400"
                                    title="حذف"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
