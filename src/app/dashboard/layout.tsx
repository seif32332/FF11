"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home,
    Layout,
    Users,
    Bell,
    Search,
    Settings,
    LogOut,
    Plus,
    ChevronDown,
    ChevronLeft,
    Folder,
    Star,
    Clock,
    Menu,
    X
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";

interface Workspace {
    id: string;
    name: string;
    color: string;
    boards: Board[];
}

interface Board {
    id: string;
    name: string;
    icon?: string;
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [expandedWorkspaces, setExpandedWorkspaces] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchWorkspaces();
    }, []);

    const fetchWorkspaces = async () => {
        try {
            const response = await fetch("/api/workspaces");
            if (response.ok) {
                const data = await response.json();
                setWorkspaces(data);
                if (data.length > 0) {
                    setExpandedWorkspaces([data[0].id]);
                }
            }
        } catch (error) {
            console.error("Error fetching workspaces:", error);
        }
    };

    const toggleWorkspace = (id: string) => {
        setExpandedWorkspaces(prev =>
            prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]
        );
    };

    const getUserInitials = () => {
        if (session?.user?.name) {
            return session.user.name.split(" ").map(n => n[0]).join("").slice(0, 2);
        }
        return "م";
    };

    const navItems = [
        { icon: Home, label: "الرئيسية", href: "/dashboard" },
        { icon: Clock, label: "حديث", href: "/dashboard/recent" },
        { icon: Star, label: "المفضلة", href: "/dashboard/favorites" },
        { icon: Users, label: "الفريق", href: "/dashboard/team" },
    ];

    return (
        <div className="min-h-screen flex">
            {/* Mobile Sidebar Overlay */}
            {mobileSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setMobileSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed lg:sticky top-0 right-0 h-screen z-50
          ${sidebarOpen ? "w-64" : "w-16"}
          ${mobileSidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
          transition-all duration-300
        `}
                style={{ background: 'var(--bg-secondary)', borderLeft: '1px solid var(--border-color)' }}
            >
                {/* Sidebar Header */}
                <div className="h-14 flex items-center justify-between px-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
                    {sidebarOpen && (
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary)' }}>
                                <Layout className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-bold">إدارة المهام</span>
                        </div>
                    )}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 rounded-lg hover:bg-white/10 hidden lg:block"
                    >
                        <ChevronLeft className={`w-4 h-4 transition-transform ${!sidebarOpen ? "rotate-180" : ""}`} />
                    </button>
                    <button
                        onClick={() => setMobileSidebarOpen(false)}
                        className="p-2 rounded-lg hover:bg-white/10 lg:hidden"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Search */}
                {sidebarOpen && (
                    <div className="p-3">
                        <div className="relative">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="بحث..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pr-9 py-2 text-sm rounded-lg"
                                style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}
                            />
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <nav className="p-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`sidebar-item ${isActive ? "active" : ""}`}
                            >
                                <item.icon className="w-5 h-5 flex-shrink-0" />
                                {sidebarOpen && <span>{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Workspaces */}
                {sidebarOpen && (
                    <div className="mt-4 px-2">
                        <div className="flex items-center justify-between px-3 mb-2">
                            <span className="text-xs font-medium text-gray-500">مساحات العمل</span>
                            <button className="p-1 rounded hover:bg-white/10">
                                <Plus className="w-4 h-4 text-gray-500" />
                            </button>
                        </div>

                        {workspaces.map((workspace) => (
                            <div key={workspace.id}>
                                <button
                                    onClick={() => toggleWorkspace(workspace.id)}
                                    className="sidebar-item w-full"
                                >
                                    <div
                                        className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                        style={{ background: workspace.color }}
                                    >
                                        {workspace.name[0]}
                                    </div>
                                    <span className="flex-1 text-right truncate">{workspace.name}</span>
                                    <ChevronDown
                                        className={`w-4 h-4 transition-transform ${expandedWorkspaces.includes(workspace.id) ? "rotate-180" : ""
                                            }`}
                                    />
                                </button>

                                {expandedWorkspaces.includes(workspace.id) && (
                                    <div className="mr-6 mt-1 space-y-1">
                                        {workspace.boards?.map((board) => (
                                            <Link
                                                key={board.id}
                                                href={`/dashboard/board/${board.id}`}
                                                className={`sidebar-item text-sm ${pathname === `/dashboard/board/${board.id}` ? "active" : ""
                                                    }`}
                                            >
                                                <Folder className="w-4 h-4 flex-shrink-0" />
                                                <span className="truncate">{board.name}</span>
                                            </Link>
                                        ))}
                                        <button className="sidebar-item text-sm w-full opacity-60 hover:opacity-100">
                                            <Plus className="w-4 h-4 flex-shrink-0" />
                                            <span>إضافة لوحة</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* User Profile */}
                <div className="absolute bottom-0 left-0 right-0 p-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                    <div className={`flex items-center ${sidebarOpen ? "gap-3" : "justify-center"}`}>
                        <div className="avatar flex-shrink-0">
                            {getUserInitials()}
                        </div>
                        {sidebarOpen && (
                            <>
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate">{session?.user?.name || "المستخدم"}</div>
                                    <div className="text-xs text-gray-500 truncate">{session?.user?.email}</div>
                                </div>
                                <div className="flex gap-1">
                                    <Link href="/dashboard/settings" className="p-2 rounded-lg hover:bg-white/10">
                                        <Settings className="w-4 h-4" />
                                    </Link>
                                    <button onClick={() => signOut()} className="p-2 rounded-lg hover:bg-white/10 text-red-400">
                                        <LogOut className="w-4 h-4" />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
                {/* Top Header */}
                <header className="header justify-between">
                    <button
                        onClick={() => setMobileSidebarOpen(true)}
                        className="p-2 rounded-lg hover:bg-white/10 lg:hidden"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-3 mr-auto">
                        <button className="p-2 rounded-lg hover:bg-white/10 relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500"></span>
                        </button>
                        <div className="avatar avatar-sm">
                            {getUserInitials()}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main>
                    {children}
                </main>
            </div>
        </div>
    );
}
