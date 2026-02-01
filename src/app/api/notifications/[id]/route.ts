import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// PATCH update notification (mark as read)
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        const { id } = await params;

        if (!session?.user?.id) {
            return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
        }

        const { read } = await request.json();

        const notification = await prisma.notification.updateMany({
            where: {
                id,
                userId: session.user.id,
            },
            data: {
                read,
            },
        });

        return NextResponse.json(notification);
    } catch (error) {
        console.error("Error updating notification:", error);
        return NextResponse.json(
            { error: "حدث خطأ أثناء تحديث الإشعار" },
            { status: 500 }
        );
    }
}

// DELETE notification
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        const { id } = await params;

        if (!session?.user?.id) {
            return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
        }

        await prisma.notification.deleteMany({
            where: {
                id,
                userId: session.user.id,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting notification:", error);
        return NextResponse.json(
            { error: "حدث خطأ أثناء حذف الإشعار" },
            { status: 500 }
        );
    }
}
