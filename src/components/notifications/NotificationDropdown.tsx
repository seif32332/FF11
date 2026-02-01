"use client";

import { useState, useEffect, useRef } from "react";
import {
    Bell,
    Check,
    CheckCheck,
    User,
    MessageSquare,
    Calendar,
    ArrowLeft,
    Zap,
    X
} from "lucide-react";
import { subscribeToUserNotifications } from "@/lib/pusher/client";

interface Notification {
    id: string;
    type: "MENTION" | "ASSIGNMENT" | "DUE_DATE" | "STATUS_CHANGE" | "COMMENT" | "ITEM_UPDATE" | "AUTOMATION";
    title: string;
    message: string;
    read: boolean;
    data: Record<string, unknown>;
    createdAt: string;
}

interface NotificationDropdownProps {
    userId: string;
}

const NOTIFICATION_ICONS = {
    MENTION: MessageSquare,
    ASSIGNMENT: User,
    DUE_DATE: Calendar,
    STATUS_CHANGE: Zap,
    COMMENT: MessageSquare,
    ITEM_UPDATE: Zap,
    AUTOMATION: Zap,
};

const NOTIFICATION_COLORS = {
    MENTION: "#579bfc",
    ASSIGNMENT: "#00c875",
    DUE_DATE: "#fdab3d",
    STATUS_CHANGE: "#9d50bb",
    COMMENT: "#579bfc",
    ITEM_UPDATE: "#6366f1",
    AUTOMATION: "#ff6b6b",
};

export default function NotificationDropdown({ userId }: NotificationDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        fetchNotifications();

        // Subscribe to real-time notifications
        const unsubscribe = subscribeToUserNotifications(userId, (data) => {
            const newNotification = data as Notification;
            setNotifications(prev => [newNotification, ...prev]);
        });

        return unsubscribe;
    }, [userId]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/notifications");
            if (response.ok) {
                const data = await response.json();
                setNotifications(data);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId: string) => {
        try {
            await fetch(`/api/notifications/${notificationId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ read: true }),
            });

            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
            );
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await fetch("/api/notifications/mark-all-read", {
                method: "POST",
            });

            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error("Error marking all as read:", error);
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) return "الآن";
        if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
        if (diffInMinutes < 1440) return `منذ ${Math.floor(diffInMinutes / 60)} ساعة`;
        return `منذ ${Math.floor(diffInMinutes / 1440)} يوم`;
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg hover:bg-white/10 relative"
                aria-label="الإشعارات"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div
                    className="notification-dropdown"
                    style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        marginTop: '0.5rem',
                        width: '360px',
                        background: 'var(--bg-secondary)',
                        borderRadius: '12px',
                        border: '1px solid var(--border-color)',
                        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
                        zIndex: 100,
                        maxHeight: '480px',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    {/* Header */}
                    <div
                        className="flex items-center justify-between p-4 border-b"
                        style={{ borderColor: 'var(--border-color)' }}
                    >
                        <h3 className="font-bold text-lg">الإشعارات</h3>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="flex items-center gap-1 text-sm text-gray-400 hover:text-white"
                                >
                                    <CheckCheck className="w-4 h-4" />
                                    تحديد الكل كمقروء
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 rounded hover:bg-white/10"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="loading-spinner" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>لا توجد إشعارات</p>
                            </div>
                        ) : (
                            <div>
                                {notifications.map((notification) => {
                                    const IconComponent = NOTIFICATION_ICONS[notification.type] || Bell;
                                    const iconColor = NOTIFICATION_COLORS[notification.type] || "#6366f1";

                                    return (
                                        <div
                                            key={notification.id}
                                            className={`notification-item ${!notification.read ? 'unread' : ''}`}
                                            onClick={() => !notification.read && markAsRead(notification.id)}
                                            style={{
                                                padding: '1rem',
                                                borderBottom: '1px solid var(--border-color)',
                                                cursor: 'pointer',
                                                transition: 'background 0.2s',
                                                display: 'flex',
                                                gap: '0.75rem',
                                                background: !notification.read ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = !notification.read ? 'rgba(99, 102, 241, 0.05)' : 'transparent'}
                                        >
                                            {/* Icon */}
                                            <div
                                                className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                                                style={{ background: `${iconColor}20` }}
                                            >
                                                <IconComponent
                                                    className="w-5 h-5"
                                                    style={{ color: iconColor }}
                                                />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className="font-medium text-sm">{notification.title}</p>
                                                    {!notification.read && (
                                                        <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-400 truncate">{notification.message}</p>
                                                <p className="text-xs text-gray-500 mt-1">{formatTime(notification.createdAt)}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div
                            className="p-3 border-t text-center"
                            style={{ borderColor: 'var(--border-color)' }}
                        >
                            <button className="text-sm hover:underline flex items-center justify-center gap-1 mx-auto" style={{ color: 'var(--primary-light)' }}>
                                عرض جميع الإشعارات
                                <ArrowLeft className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
