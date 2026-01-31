import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET recent boards
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
        }

        const boards = await prisma.board.findMany({
            where: {
                workspace: {
                    members: {
                        some: {
                            userId: session.user.id
                        }
                    }
                }
            },
            select: {
                id: true,
                name: true,
                description: true,
                color: true,
                updatedAt: true,
                workspace: {
                    select: {
                        name: true
                    }
                },
                _count: {
                    select: {
                        groups: true
                    }
                }
            },
            orderBy: {
                updatedAt: "desc"
            },
            take: 6
        });

        const formattedBoards = boards.map(board => ({
            ...board,
            itemCount: board._count.groups,
            lastUpdated: formatRelativeTime(board.updatedAt)
        }));

        return NextResponse.json(formattedBoards);
    } catch (error) {
        console.error("Error fetching recent boards:", error);
        return NextResponse.json(
            { error: "حدث خطأ أثناء جلب اللوحات" },
            { status: 500 }
        );
    }
}

function formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "الآن";
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 7) return `منذ ${diffDays} يوم`;
    return date.toLocaleDateString("ar");
}
