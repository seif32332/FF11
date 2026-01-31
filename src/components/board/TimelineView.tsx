"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

interface TimelineItem {
    id: string;
    name: string;
    startDate?: string;
    endDate?: string;
    status?: { label: string; color: string };
    groupId: string;
    groupName: string;
    groupColor: string;
}

interface TimelineViewProps {
    items: TimelineItem[];
    onItemClick: (itemId: string) => void;
    onUpdateDates: (itemId: string, startDate: string, endDate: string) => void;
}

export default function TimelineView({ items, onItemClick, onUpdateDates }: TimelineViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<"week" | "month" | "quarter">("month");
    const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);

    useEffect(() => {
        setTimelineItems(items.filter(item => item.startDate && item.endDate));
    }, [items]);

    // Generate timeline columns based on view mode
    const getTimelineColumns = () => {
        const columns: Date[] = [];
        const start = new Date(currentDate);
        start.setDate(1);

        if (viewMode === "week") {
            for (let i = 0; i < 7; i++) {
                const date = new Date(start);
                date.setDate(start.getDate() + i);
                columns.push(date);
            }
        } else if (viewMode === "month") {
            const daysInMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
            for (let i = 0; i < daysInMonth; i++) {
                const date = new Date(start);
                date.setDate(i + 1);
                columns.push(date);
            }
        } else {
            for (let i = 0; i < 90; i++) {
                const date = new Date(start);
                date.setDate(start.getDate() + i);
                columns.push(date);
            }
        }

        return columns;
    };

    const columns = getTimelineColumns();

    const navigateMonth = (direction: number) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + direction);
        setCurrentDate(newDate);
    };

    const getItemPosition = (item: TimelineItem) => {
        if (!item.startDate || !item.endDate) return null;

        const start = new Date(item.startDate);
        const end = new Date(item.endDate);
        const timelineStart = columns[0];
        const timelineEnd = columns[columns.length - 1];

        if (end < timelineStart || start > timelineEnd) return null;

        const dayWidth = 100 / columns.length;
        const startPos = Math.max(0, Math.floor((start.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24)));
        const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        return {
            left: `${startPos * dayWidth}%`,
            width: `${duration * dayWidth}%`,
            color: item.status?.color || "#6366f1"
        };
    };

    // Group items by group
    const groupedItems = timelineItems.reduce((acc, item) => {
        if (!acc[item.groupId]) {
            acc[item.groupId] = {
                name: item.groupName,
                color: item.groupColor,
                items: []
            };
        }
        acc[item.groupId].items.push(item);
        return acc;
    }, {} as Record<string, { name: string; color: string; items: TimelineItem[] }>);

    return (
        <div className="timeline-view">
            {/* Header */}
            <div className="timeline-header">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigateMonth(-1)}
                            className="p-2 rounded-lg hover:bg-white/10"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setCurrentDate(new Date())}
                            className="px-4 py-2 rounded-lg hover:bg-white/10 font-medium"
                        >
                            <CalendarIcon className="w-4 h-4 inline-block ml-1" />
                            {currentDate.toLocaleDateString("ar", { month: "long", year: "numeric" })}
                        </button>
                        <button
                            onClick={() => navigateMonth(1)}
                            className="p-2 rounded-lg hover:bg-white/10"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setViewMode("week")}
                            className={`px-3 py-1.5 rounded-lg text-sm ${viewMode === "week" ? "bg-primary text-white" : "hover:bg-white/10"
                                }`}
                        >
                            أسبوع
                        </button>
                        <button
                            onClick={() => setViewMode("month")}
                            className={`px-3 py-1.5 rounded-lg text-sm ${viewMode === "month" ? "bg-primary text-white" : "hover:bg-white/10"
                                }`}
                        >
                            شهر
                        </button>
                        <button
                            onClick={() => setViewMode("quarter")}
                            className={`px-3 py-1.5 rounded-lg text-sm ${viewMode === "quarter" ? "bg-primary text-white" : "hover:bg-white/10"
                                }`}
                        >
                            ربع سنة
                        </button>
                    </div>
                </div>
            </div>

            {/* Timeline Grid */}
            <div className="timeline-container">
                {/* Column Headers */}
                <div className="timeline-columns-header">
                    <div className="timeline-item-label">العناصر</div>
                    <div className="timeline-grid-header">
                        {columns.map((date, idx) => (
                            <div key={idx} className="timeline-column-header">
                                <div className="text-xs font-medium">
                                    {viewMode === "week" && date.toLocaleDateString("ar", { weekday: "short" })}
                                    {viewMode === "month" && date.getDate()}
                                    {viewMode === "quarter" && date.toLocaleDateString("ar", { day: "numeric", month: "short" })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Timeline Rows */}
                <div className="timeline-rows">
                    {Object.entries(groupedItems).map(([groupId, group]) => (
                        <div key={groupId} className="timeline-group">
                            <div className="timeline-group-header" style={{ borderRightColor: group.color }}>
                                <div className="w-3 h-3 rounded-full" style={{ background: group.color }} />
                                <span className="font-medium">{group.name}</span>
                                <span className="text-xs text-gray-500">({group.items.length})</span>
                            </div>

                            {group.items.map((item) => {
                                const position = getItemPosition(item);
                                if (!position) return null;

                                return (
                                    <div key={item.id} className="timeline-row">
                                        <div className="timeline-item-label">
                                            <span className="timeline-item-name">{item.name}</span>
                                        </div>
                                        <div className="timeline-grid">
                                            {columns.map((_, idx) => (
                                                <div key={idx} className="timeline-grid-cell" />
                                            ))}
                                            <div
                                                className="timeline-bar"
                                                style={{
                                                    left: position.left,
                                                    width: position.width,
                                                    background: position.color
                                                }}
                                                onClick={() => onItemClick(item.id)}
                                            >
                                                <span className="timeline-bar-label">{item.name}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}

                    {timelineItems.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>لا توجد عناصر مع تواريخ محددة</p>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
        .timeline-view {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .timeline-header {
          padding: 1rem;
          border-bottom: 1px solid var(--border-color);
        }

        .timeline-container {
          flex: 1;
          overflow: auto;
        }

        .timeline-columns-header {
          display: flex;
          position: sticky;
          top: 0;
          z-index: 10;
          background: var(--bg-secondary);
          border-bottom: 2px solid var(--border-color);
        }

        .timeline-item-label {
          width: 250px;
          min-width: 250px;
          padding: 0.75rem 1rem;
          border-left: 1px solid var(--border-color);
          font-size: 0.875rem;
          font-weight: 500;
          position: sticky;
          right: 0;
          background: var(--bg-secondary);
          z-index: 5;
        }

        .timeline-grid-header {
          flex: 1;
          display: flex;
          min-width: 0;
        }

        .timeline-column-header {
          flex: 1;
          min-width: 40px;
          padding: 0.5rem;
          text-align: center;
          border-left: 1px solid var(--border-color);
          color: var(--text-secondary);
        }

        .timeline-rows {
          position: relative;
        }

        .timeline-group {
          border-bottom: 1px solid var(--border-color);
        }

        .timeline-group-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: var(--bg-tertiary);
          border-right: 3px solid;
          font-size: 0.875rem;
        }

        .timeline-row {
          display: flex;
          border-bottom: 1px solid var(--border-color);
          min-height: 48px;
        }

        .timeline-item-name {
          display: block;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .timeline-grid {
          flex: 1;
          display: flex;
          position: relative;
          min-width: 0;
        }

        .timeline-grid-cell {
          flex: 1;
          min-width: 40px;
          border-left: 1px solid var(--border-color);
        }

        .timeline-bar {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          height: 28px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          padding: 0 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .timeline-bar:hover {
          transform: translateY(-50%) scale(1.02);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }

        .timeline-bar-label {
          color: white;
          font-size: 0.75rem;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>
        </div>
    );
}
