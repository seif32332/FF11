import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// POST mark all notifications as read
export async function POST() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
        }

        await prisma.notification.updateMany({
            where: {
                userId: session.user.id,
                read: false,
            },
            data: {
                read: true,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error marking all as read:", error);
        return NextResponse.json(
            { error: "حدث خطأ أثناء تحديث الإشعارات" },
            { status: 500 }
        );
    }
}
