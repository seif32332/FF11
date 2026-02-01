import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET notifications for current user
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
        }

        const notifications = await prisma.notification.findMany({
            where: {
                userId: session.user.id,
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 50,
        });

        return NextResponse.json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return NextResponse.json(
            { error: "حدث خطأ أثناء جلب الإشعارات" },
            { status: 500 }
        );
    }
}

// POST create a notification (internal use)
export async function POST(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
        }

        const { userId, type, title, message, data } = await request.json();

        const notification = await prisma.notification.create({
            data: {
                userId,
                type,
                title,
                message,
                data: data || {},
            },
        });

        return NextResponse.json(notification);
    } catch (error) {
        console.error("Error creating notification:", error);
        return NextResponse.json(
            { error: "حدث خطأ أثناء إنشاء الإشعار" },
            { status: 500 }
        );
    }
}
