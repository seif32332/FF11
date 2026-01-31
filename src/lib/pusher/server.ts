import Pusher from "pusher";

// Server-side Pusher instance
export const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID || "",
    key: process.env.NEXT_PUBLIC_PUSHER_KEY || "",
    secret: process.env.PUSHER_SECRET || "",
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "eu",
    useTLS: true,
});

// Trigger events
export async function triggerBoardUpdate(boardId: string, event: string, data: unknown) {
    try {
        await pusher.trigger(`board-${boardId}`, event, data);
    } catch (error) {
        console.error("Pusher error:", error);
    }
}

export async function triggerWorkspaceUpdate(workspaceId: string, event: string, data: unknown) {
    try {
        await pusher.trigger(`workspace-${workspaceId}`, event, data);
    } catch (error) {
        console.error("Pusher error:", error);
    }
}

export async function triggerUserNotification(userId: string, data: unknown) {
    try {
        await pusher.trigger(`user-${userId}`, "notification", data);
    } catch (error) {
        console.error("Pusher error:", error);
    }
}
