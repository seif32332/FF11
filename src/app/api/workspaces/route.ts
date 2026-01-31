import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET all workspaces for current user
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
        }

        const workspaces = await prisma.workspace.findMany({
            where: {
                members: {
                    some: {
                        userId: session.user.id
                    }
                }
            },
            include: {
                boards: {
                    select: {
                        id: true,
                        name: true,
                        icon: true,
                        color: true
                    },
                    orderBy: {
                        updatedAt: "desc"
                    }
                },
                members: {
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
            },
            orderBy: {
                updatedAt: "desc"
            }
        });

        return NextResponse.json(workspaces);
    } catch (error) {
        console.error("Error fetching workspaces:", error);
        return NextResponse.json(
            { error: "حدث خطأ أثناء جلب مساحات العمل" },
            { status: 500 }
        );
    }
}

// POST create new workspace
export async function POST(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
        }

        const { name, description, color } = await request.json();

        if (!name) {
            return NextResponse.json({ error: "اسم مساحة العمل مطلوب" }, { status: 400 });
        }

        const workspace = await prisma.workspace.create({
            data: {
                name,
                description,
                color: color || "#6366f1",
                members: {
                    create: {
                        userId: session.user.id,
                        role: "OWNER"
                    }
                }
            },
            include: {
                boards: true,
                members: {
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

        return NextResponse.json(workspace, { status: 201 });
    } catch (error) {
        console.error("Error creating workspace:", error);
        return NextResponse.json(
            { error: "حدث خطأ أثناء إنشاء مساحة العمل" },
            { status: 500 }
        );
    }
}
