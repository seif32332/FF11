"use client";

import { useEffect, useState } from "react";
import { subscribeToBoardUpdates } from "@/lib/pusher/client";

export function useRealtimeBoard(boardId: string) {
    const [updates, setUpdates] = useState<Array<{ type: string; data: unknown }>>([]);

    useEffect(() => {
        const unsubscribe = subscribeToBoardUpdates(boardId, {
            onItemCreated: (data) => {
                setUpdates((prev) => [...prev, { type: "item-created", data }]);
            },
            onItemUpdated: (data) => {
                setUpdates((prev) => [...prev, { type: "item-updated", data }]);
            },
            onItemDeleted: (data) => {
                setUpdates((prev) => [...prev, { type: "item-deleted", data }]);
            },
            onColumnUpdated: (data) => {
                setUpdates((prev) => [...prev, { type: "column-updated", data }]);
            },
        });

        return unsubscribe;
    }, [boardId]);

    return updates;
}
