import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// PATCH update column
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string; columnId: string }> }
) {
    try {
        const session = await auth();
        const { id, columnId } = await params;

        if (!session?.user?.id) {
            return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
        }

        const data = await request.json();

        // Verify user has access to the board
        const board = await prisma.board.findFirst({
            where: {
                id,
                workspace: {
                    members: {
                        some: {
                            userId: session.user.id,
                            role: { in: ["OWNER", "ADMIN", "MEMBER"] }
                        }
                    }
                }
            }
        });

        if (!board) {
            return NextResponse.json({ error: "اللوحة غير موجودة" }, { status: 404 });
        }

        // Build update data
        const updateData: Record<string, unknown> = {};

        if (data.title !== undefined) {
            updateData.title = data.title;
        }
        if (data.type !== undefined) {
            updateData.type = data.type;
        }
        if (data.width !== undefined) {
            updateData.width = data.width;
        }
        if (data.options !== undefined) {
            updateData.settings = { options: data.options };
        }

        const column = await prisma.boardColumn.update({
            where: { id: columnId },
            data: updateData
        });

        return NextResponse.json(column);
    } catch (error) {
        console.error("Error updating column:", error);
        return NextResponse.json(
            { error: "حدث خطأ أثناء تحديث العمود" },
            { status: 500 }
        );
    }
}

// DELETE column
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string; columnId: string }> }
) {
    try {
        const session = await auth();
        const { id, columnId } = await params;

        if (!session?.user?.id) {
            return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
        }

        // Verify user has access to the board
        const board = await prisma.board.findFirst({
            where: {
                id,
                workspace: {
                    members: {
                        some: {
                            userId: session.user.id,
                            role: { in: ["OWNER", "ADMIN"] }
                        }
                    }
                }
            }
        });

        if (!board) {
            return NextResponse.json({ error: "اللوحة غير موجودة" }, { status: 404 });
        }

        // Delete the column (cascade will delete item values)
        await prisma.boardColumn.delete({
            where: { id: columnId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting column:", error);
        return NextResponse.json(
            { error: "حدث خطأ أثناء حذف العمود" },
            { status: 500 }
        );
    }
}
