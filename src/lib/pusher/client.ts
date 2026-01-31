"use client";

import PusherClient from "pusher-js";

// Client-side Pusher instance
export const pusherClient = new PusherClient(
    process.env.NEXT_PUBLIC_PUSHER_KEY || "",
    {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "eu",
    }
);

// Subscribe to board updates
export function subscribeToBoardUpdates(
    boardId: string,
    callbacks: {
        onItemCreated?: (data: unknown) => void;
        onItemUpdated?: (data: unknown) => void;
        onItemDeleted?: (data: unknown) => void;
        onColumnUpdated?: (data: unknown) => void;
    }
) {
    const channel = pusherClient.subscribe(`board-${boardId}`);

    if (callbacks.onItemCreated) {
        channel.bind("item-created", callbacks.onItemCreated);
    }
    if (callbacks.onItemUpdated) {
        channel.bind("item-updated", callbacks.onItemUpdated);
    }
    if (callbacks.onItemDeleted) {
        channel.bind("item-deleted", callbacks.onItemDeleted);
    }
    if (callbacks.onColumnUpdated) {
        channel.bind("column-updated", callbacks.onColumnUpdated);
    }

    return () => {
        channel.unbind_all();
        pusherClient.unsubscribe(`board-${boardId}`);
    };
}

// Subscribe to user notifications
export function subscribeToUserNotifications(
    userId: string,
    onNotification: (data: unknown) => void
) {
    const channel = pusherClient.subscribe(`user-${userId}`);
    channel.bind("notification", onNotification);

    return () => {
        channel.unbind_all();
        pusherClient.unsubscribe(`user-${userId}`);
    };
}
