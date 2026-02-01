"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    Search,
    Command,
    X,
    Layout,
    FileText,
    Clock,
    Trash2
} from "lucide-react";

interface SearchResult {
    type: "board" | "item" | "workspace";
    id: string;
    name: string;
    boardName?: string;
    workspaceName?: string;
    url: string;
    updatedAt?: string;
}

interface RecentSearch {
    id: string;
    query: string;
    timestamp: number;
}

export default function SearchCommand() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Load recent searches from localStorage
    useEffect(() => {
        const stored = localStorage.getItem("recentSearches");
        if (stored) {
            setRecentSearches(JSON.parse(stored));
        }
    }, []);

    // Keyboard shortcut Cmd+K / Ctrl+K
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setIsOpen(true);
            }
            if (e.key === "Escape" && isOpen) {
                setIsOpen(false);
                setQuery("");
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen]);

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Search debounce
    const searchDebounce = useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setResults([]);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
            if (response.ok) {
                const data = await response.json();
                setResults(data);
            }
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Debounced search effect
    useEffect(() => {
        const timer = setTimeout(() => {
            searchDebounce(query);
        }, 300);

        return () => clearTimeout(timer);
    }, [query, searchDebounce]);

    // Reset selection when results change
    useEffect(() => {
        setSelectedIndex(0);
    }, [results]);

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === "Enter" && results[selectedIndex]) {
            handleSelect(results[selectedIndex]);
        }
    };

    const handleSelect = (result: SearchResult) => {
        // Save to recent searches
        const newRecent: RecentSearch = {
            id: `${Date.now()}`,
            query: result.name,
            timestamp: Date.now(),
        };
        const updatedRecent = [newRecent, ...recentSearches.filter(r => r.query !== result.name)].slice(0, 5);
        setRecentSearches(updatedRecent);
        localStorage.setItem("recentSearches", JSON.stringify(updatedRecent));

        // Navigate
        router.push(result.url);
        setIsOpen(false);
        setQuery("");
    };

    const clearRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem("recentSearches");
    };

    const getResultIcon = (type: string) => {
        switch (type) {
            case "board":
                return <Layout className="w-4 h-4" />;
            case "item":
                return <FileText className="w-4 h-4" />;
            default:
                return <Layout className="w-4 h-4" />;
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="search-trigger"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    minWidth: '200px',
                }}
            >
                <Search className="w-4 h-4" />
                <span className="flex-1 text-right text-sm">بحث...</span>
                <kbd className="hidden sm:flex items-center gap-1 text-xs bg-white/10 px-1.5 py-0.5 rounded">
                    <Command className="w-3 h-3" />K
                </kbd>
            </button>
        );
    }

    return (
        <>
            {/* Backdrop */}
            <div
                className="search-backdrop"
                onClick={() => {
                    setIsOpen(false);
                    setQuery("");
                }}
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 100,
                }}
            />

            {/* Search Modal */}
            <div
                className="search-modal"
                style={{
                    position: 'fixed',
                    top: '15%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '100%',
                    maxWidth: '560px',
                    background: 'var(--bg-secondary)',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    zIndex: 101,
                    overflow: 'hidden',
                }}
            >
                {/* Search Input */}
                <div
                    className="search-input-container"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '1rem',
                        borderBottom: '1px solid var(--border-color)',
                    }}
                >
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="ابحث عن لوحات، عناصر..."
                        className="flex-1 bg-transparent outline-none"
                        style={{ fontSize: '1rem' }}
                    />
                    {query && (
                        <button
                            onClick={() => setQuery("")}
                            className="p-1 rounded hover:bg-white/10"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                    <kbd className="text-xs text-gray-500 bg-white/5 px-1.5 py-0.5 rounded">
                        ESC
                    </kbd>
                </div>

                {/* Results */}
                <div
                    className="search-results"
                    style={{ maxHeight: '400px', overflowY: 'auto' }}
                >
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="loading-spinner" />
                        </div>
                    ) : query && results.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Search className="w-10 h-10 mx-auto mb-3 opacity-50" />
                            <p>لا توجد نتائج لـ "{query}"</p>
                        </div>
                    ) : query && results.length > 0 ? (
                        <div className="py-2">
                            {results.map((result, index) => (
                                <button
                                    key={`${result.type}-${result.id}`}
                                    onClick={() => handleSelect(result)}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                    className={`search-result-item ${index === selectedIndex ? 'selected' : ''}`}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        textAlign: 'right',
                                        background: index === selectedIndex ? 'var(--bg-tertiary)' : 'transparent',
                                        transition: 'background 0.15s',
                                    }}
                                >
                                    <div
                                        className="flex-shrink-0 w-8 h-8 rounded flex items-center justify-center"
                                        style={{ background: 'var(--primary)', opacity: 0.6 }}
                                    >
                                        {getResultIcon(result.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium truncate">{result.name}</div>
                                        {result.boardName && (
                                            <div className="text-xs text-gray-500 truncate">
                                                {result.boardName}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-xs text-gray-500 capitalize">
                                        {result.type === "board" ? "لوحة" : "عنصر"}
                                    </span>
                                </button>
                            ))}
                        </div>
                    ) : recentSearches.length > 0 ? (
                        <div className="py-2">
                            <div
                                className="flex items-center justify-between px-4 py-2"
                                style={{ color: 'var(--text-secondary)' }}
                            >
                                <span className="text-xs flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    عمليات البحث الأخيرة
                                </span>
                                <button
                                    onClick={clearRecentSearches}
                                    className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                                >
                                    <Trash2 className="w-3 h-3" />
                                    مسح
                                </button>
                            </div>
                            {recentSearches.map((recent) => (
                                <button
                                    key={recent.id}
                                    onClick={() => setQuery(recent.query)}
                                    className="flex items-center gap-3 w-full px-4 py-2 text-right hover:bg-white/5"
                                >
                                    <Clock className="w-4 h-4 text-gray-500" />
                                    <span>{recent.query}</span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <Command className="w-10 h-10 mx-auto mb-3 opacity-50" />
                            <p>اكتب للبحث عن لوحات وعناصر</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div
                    className="search-footer"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 1rem',
                        borderTop: '1px solid var(--border-color)',
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                    }}
                >
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                            <kbd className="bg-white/5 px-1.5 py-0.5 rounded">↑↓</kbd>
                            للتنقل
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="bg-white/5 px-1.5 py-0.5 rounded">↵</kbd>
                            للفتح
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
}
