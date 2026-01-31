"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

interface CalendarItem {
    id: string;
    name: string;
    date?: string;
    status?: { label: string; color: string };
}

interface CalendarViewProps {
    items: CalendarItem[];
    onItemClick: (itemId: string) => void;
    onDateClick: (date: Date) => void;
}

export default function CalendarView({ items, onItemClick, onDateClick }: CalendarViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();

        // Get the day of week for the first day (0 = Sunday, 6 = Saturday)
        // In Arabic calendar, week starts on Saturday
        let startDay = firstDay.getDay();
        // Convert to Arabic week (Saturday = 0)
        startDay = startDay === 6 ? 0 : startDay + 1;

        const days: (Date | null)[] = [];

        // Add empty cells for days before month starts
        for (let i = 0; i < startDay; i++) {
            days.push(null);
        }

        // Add all days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day));
        }

        return days;
    };

    const getItemsForDate = (date: Date | null) => {
        if (!date) return [];

        const dateStr = date.toISOString().split("T")[0];
        return items.filter(item => item.date === dateStr);
    };

    const navigateMonth = (direction: number) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + direction);
        setCurrentDate(newDate);
    };

    const isToday = (date: Date | null) => {
        if (!date) return false;
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const days = getDaysInMonth(currentDate);
    const weekDays = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];

    return (
        <div className="calendar-view">
            {/* Header */}
            <div className="calendar-header">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigateMonth(-1)}
                        className="p-2 rounded-lg hover:bg-white/10"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setCurrentDate(new Date())}
                        className="px-4 py-2 rounded-lg hover:bg-white/10 font-bold text-lg"
                    >
                        {currentDate.toLocaleDateString("ar", { month: "long", year: "numeric" })}
                    </button>
                    <button
                        onClick={() => navigateMonth(1)}
                        className="p-2 rounded-lg hover:bg-white/10"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="calendar-grid-container">
                {/* Week Day Headers */}
                <div className="calendar-weekdays">
                    {weekDays.map((day) => (
                        <div key={day} className="calendar-weekday">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Days */}
                <div className="calendar-days">
                    {days.map((date, idx) => {
                        const dayItems = getItemsForDate(date);
                        const isCurrentDay = isToday(date);

                        return (
                            <div
                                key={idx}
                                className={`calendar-day ${!date ? "empty" : ""} ${isCurrentDay ? "today" : ""}`}
                                onClick={() => date && onDateClick(date)}
                            >
                                {date && (
                                    <>
                                        <div className="calendar-day-number">
                                            {date.getDate()}
                                            {isCurrentDay && <div className="today-indicator" />}
                                        </div>

                                        <div className="calendar-day-items">
                                            {dayItems.slice(0, 3).map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="calendar-item"
                                                    style={{ borderRightColor: item.status?.color || "#6366f1" }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onItemClick(item.id);
                                                    }}
                                                >
                                                    <span className="calendar-item-name">{item.name}</span>
                                                </div>
                                            ))}

                                            {dayItems.length > 3 && (
                                                <div className="calendar-item-more">
                                                    +{dayItems.length - 3} المزيد
                                                </div>
                                            )}

                                            {dayItems.length === 0 && (
                                                <button className="calendar-add-item">
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <style jsx>{`
        .calendar-view {
          height: 100%;
          display: flex;
          flex-direction: column;
          padding: 1rem;
        }

        .calendar-header {
          padding: 1rem 0;
          margin-bottom: 1rem;
        }

        .calendar-grid-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
        }

        .calendar-weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 1px;
          margin-bottom: 1px;
          background: var(--border-color);
        }

        .calendar-weekday {
          background: var(--bg-secondary);
          padding: 0.75rem;
          text-align: center;
          font-weight: 600;
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .calendar-days {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 1px;
          background: var(--border-color);
          flex: 1;
          min-height: 0;
        }

        .calendar-day {
          background: var(--bg-secondary);
          padding: 0.5rem;
          min-height: 100px;
          cursor: pointer;
          transition: background 0.2s;
          display: flex;
          flex-direction: column;
        }

        .calendar-day:hover:not(.empty) {
          background: var(--bg-tertiary);
        }

        .calendar-day.empty {
          background: var(--bg-primary);
          cursor: default;
        }

        .calendar-day.today {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), transparent);
        }

        .calendar-day-number {
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          position: relative;
          width: fit-content;
        }

        .today-indicator {
          position: absolute;
          bottom: -4px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: var(--primary);
        }

        .calendar-day-items {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          overflow: hidden;
        }

        .calendar-item {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          background: var(--bg-tertiary);
          border-right: 3px solid;
          font-size: 0.75rem;
          transition: all 0.2s;
        }

        .calendar-item:hover {
          transform: translateX(-2px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .calendar-item-name {
          display: block;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .calendar-item-more {
          padding: 0.25rem 0.5rem;
          font-size: 0.7rem;
          color: var(--text-secondary);
          text-align: center;
        }

        .calendar-add-item {
          width: 100%;
          padding: 0.5rem;
          border: 1px dashed var(--border-color);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .calendar-day:hover .calendar-add-item {
          opacity: 1;
        }

        .calendar-add-item:hover {
          background: var(--bg-tertiary);
          border-color: var(--primary);
        }
      `}</style>
        </div>
    );
}
