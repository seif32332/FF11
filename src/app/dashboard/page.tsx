"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Plus,
    Folder,
    Clock,
    Star,
    MoreHorizontal,
    TrendingUp,
    CheckCircle,
    AlertCircle,
    Users,
    Calendar
} from "lucide-react";

interface Board {
    id: string;
    name: string;
    description?: string;
    color: string;
    itemCount: number;
    lastUpdated: string;
    workspace: {
        name: string;
    };
}

interface Stats {
    totalItems: number;
    completedItems: number;
    inProgressItems: number;
    overdueItems: number;
}

export default function DashboardPage() {
    const [recentBoards, setRecentBoards] = useState<Board[]>([]);
    const [stats, setStats] = useState<Stats>({
        totalItems: 0,
        completedItems: 0,
        inProgressItems: 0,
        overdueItems: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [boardsRes, statsRes] = await Promise.all([
                fetch("/api/boards/recent"),
                fetch("/api/stats")
            ]);

            if (boardsRes.ok) {
                const boards = await boardsRes.json();
                setRecentBoards(boards);
            }

            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setStats(statsData);
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            label: "إجمالي المهام",
            value: stats.totalItems,
            icon: Folder,
            color: "var(--primary)",
            bgColor: "rgba(99, 102, 241, 0.15)"
        },
        {
            label: "مكتملة",
            value: stats.completedItems,
            icon: CheckCircle,
            color: "var(--status-done)",
            bgColor: "rgba(0, 200, 117, 0.15)"
        },
        {
            label: "قيد التنفيذ",
            value: stats.inProgressItems,
            icon: TrendingUp,
            color: "var(--status-working)",
            bgColor: "rgba(253, 171, 61, 0.15)"
        },
        {
            label: "متأخرة",
            value: stats.overdueItems,
            icon: AlertCircle,
            color: "var(--status-stuck)",
            bgColor: "rgba(226, 68, 92, 0.15)"
        }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Welcome Section */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold mb-2">مرحباً بك! 👋</h1>
                <p className="text-gray-400">إليك نظرة سريعة على مشاريعك ومهامك</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {statCards.map((stat) => (
                    <div
                        key={stat.label}
                        className="card flex items-center gap-4"
                    >
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: stat.bgColor }}
                        >
                            <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <div className="text-sm text-gray-400">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <button className="card card-hover flex flex-col items-center gap-3 py-6">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--primary)' }}>
                        <Plus className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium">لوحة جديدة</span>
                </button>

                <button className="card card-hover flex flex-col items-center gap-3 py-6">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--status-done)' }}>
                        <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium">مهمة جديدة</span>
                </button>

                <button className="card card-hover flex flex-col items-center gap-3 py-6">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--status-working)' }}>
                        <Users className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium">دعوة عضو</span>
                </button>

                <button className="card card-hover flex flex-col items-center gap-3 py-6">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--status-new)' }}>
                        <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium">التقويم</span>
                </button>
            </div>

            {/* Recent Boards */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Clock className="w-5 h-5 text-gray-400" />
                        تم الوصول مؤخراً
                    </h2>
                    <Link href="/dashboard/boards" className="text-sm hover:underline" style={{ color: 'var(--primary-light)' }}>
                        عرض الكل
                    </Link>
                </div>

                {recentBoards.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {recentBoards.map((board) => (
                            <Link
                                key={board.id}
                                href={`/dashboard/board/${board.id}`}
                                className="card card-hover group"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold text-white"
                                        style={{ background: board.color }}
                                    >
                                        {board.name[0]}
                                    </div>
                                    <button className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-white/10">
                                        <MoreHorizontal className="w-5 h-5 text-gray-400" />
                                    </button>
                                </div>

                                <h3 className="font-bold mb-1">{board.name}</h3>
                                <p className="text-sm text-gray-500 mb-3">{board.workspace.name}</p>

                                <div className="flex items-center justify-between text-sm text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <Folder className="w-4 h-4" />
                                        {board.itemCount} عنصر
                                    </span>
                                    <span>{board.lastUpdated}</span>
                                </div>
                            </Link>
                        ))}

                        {/* Add Board Card */}
                        <button className="card border-2 border-dashed flex flex-col items-center justify-center gap-3 h-full min-h-[150px] opacity-60 hover:opacity-100 transition-opacity" style={{ borderColor: 'var(--border-color)' }}>
                            <Plus className="w-8 h-8" />
                            <span className="font-medium">إنشاء لوحة جديدة</span>
                        </button>
                    </div>
                ) : (
                    <div className="card text-center py-12">
                        <div className="empty-state">
                            <Folder className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                            <h3 className="text-lg font-medium text-gray-400 mb-2">لا توجد لوحات بعد</h3>
                            <p className="text-gray-500 mb-4">ابدأ بإنشاء لوحتك الأولى</p>
                            <button className="btn btn-primary">
                                <Plus className="w-4 h-4" />
                                إنشاء لوحة
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Favorites */}
            <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500" />
                        المفضلة
                    </h2>
                </div>

                <div className="card text-center py-8 opacity-60">
                    <Star className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                    <p className="text-gray-500">أضف لوحات للمفضلة للوصول السريع</p>
                </div>
            </div>
        </div>
    );
}
