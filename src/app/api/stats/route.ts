import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET dashboard stats
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
        }

        // Get all items the user has access to
        const items = await prisma.item.findMany({
            where: {
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
            },
            include: {
                values: {
                    include: {
                        column: true
                    }
                }
            }
        });

        let completedItems = 0;
        let inProgressItems = 0;
        let overdueItems = 0;

        items.forEach(item => {
            item.values.forEach(value => {
                if (value.column.type === "STATUS") {
                    const statusValue = value.value as { label?: string } | null;
                    if (statusValue?.label === "مكتمل") {
                        completedItems++;
                    } else if (statusValue?.label === "قيد العمل") {
                        inProgressItems++;
                    } else if (statusValue?.label === "عالق") {
                        overdueItems++;
                    }
                }
            });
        });

        return NextResponse.json({
            totalItems: items.length,
            completedItems,
            inProgressItems,
            overdueItems
        });
    } catch (error) {
        console.error("Error fetching stats:", error);
        return NextResponse.json(
            { error: "حدث خطأ أثناء جلب الإحصائيات" },
            { status: 500 }
        );
    }
}
