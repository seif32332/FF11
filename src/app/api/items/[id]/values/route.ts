import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// PATCH update item value
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

        const { columnId, value } = await request.json();

        if (!columnId) {
            return NextResponse.json({ error: "معرف العمود مطلوب" }, { status: 400 });
        }

        // Verify user has access to the item
        const item = await prisma.item.findFirst({
            where: {
                id,
                group: {
                    board: {
                        workspace: {
                            members: {
                                some: {
                                    userId: session.user.id
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!item) {
            return NextResponse.json({ error: "العنصر غير موجود" }, { status: 404 });
        }

        // Upsert the item value
        const itemValue = await prisma.itemValue.upsert({
            where: {
                itemId_columnId: {
                    itemId: id,
                    columnId
                }
            },
            update: {
                value
            },
            create: {
                itemId: id,
                columnId,
                value
            }
        });

        // Create activity log
        await prisma.activity.create({
            data: {
                type: "UPDATED",
                itemId: id,
                userId: session.user.id,
                data: { columnId, value }
            }
        });

        return NextResponse.json(itemValue);
    } catch (error) {
        console.error("Error updating item value:", error);
        return NextResponse.json(
            { error: "حدث خطأ أثناء تحديث القيمة" },
            { status: 500 }
        );
    }
}
