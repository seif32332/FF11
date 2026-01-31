import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// POST create new item
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        const { id } = await params;

        if (!session?.user?.id) {
            return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
        }

        const { name, groupId } = await request.json();

        if (!name || !groupId) {
            return NextResponse.json({ error: "البيانات غير مكتملة" }, { status: 400 });
        }

        // Verify user has access to the board
        const board = await prisma.board.findFirst({
            where: {
                id,
                workspace: {
                    members: {
                        some: {
                            userId: session.user.id
                        }
                    }
                }
            }
        });

        if (!board) {
            return NextResponse.json({ error: "اللوحة غير موجودة" }, { status: 404 });
        }

        // Get the max position in the group
        const maxPosition = await prisma.item.aggregate({
            where: { groupId },
            _max: { position: true }
        });

        const item = await prisma.item.create({
            data: {
                name,
                groupId,
                creatorId: session.user.id,
                position: (maxPosition._max.position || 0) + 1
            },
            include: {
                values: true,
                assignments: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                avatar: true
                            }
                        }
                    }
                }
            }
        });

        // Create activity log
        await prisma.activity.create({
            data: {
                type: "CREATED",
                itemId: item.id,
                userId: session.user.id,
                data: { itemName: name }
            }
        });

        return NextResponse.json(item, { status: 201 });
    } catch (error) {
        console.error("Error creating item:", error);
        return NextResponse.json(
            { error: "حدث خطأ أثناء إنشاء العنصر" },
            { status: 500 }
        );
    }
}
