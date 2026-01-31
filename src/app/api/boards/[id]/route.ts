import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET board by ID
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        const { id } = await params;

        if (!session?.user?.id) {
            return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
        }

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
            },
            include: {
                columns: {
                    orderBy: { position: "asc" }
                },
                groups: {
                    orderBy: { position: "asc" },
                    include: {
                        items: {
                            orderBy: { position: "asc" },
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
                                },
                                _count: {
                                    select: {
                                        comments: true,
                                        attachments: true
                                    }
                                }
                            }
                        }
                    }
                },
                views: {
                    orderBy: { position: "asc" }
                },
                workspace: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        if (!board) {
            return NextResponse.json({ error: "اللوحة غير موجودة" }, { status: 404 });
        }

        return NextResponse.json(board);
    } catch (error) {
        console.error("Error fetching board:", error);
        return NextResponse.json(
            { error: "حدث خطأ أثناء جلب اللوحة" },
            { status: 500 }
        );
    }
}

// PATCH update board
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

        const data = await request.json();

        const board = await prisma.board.updateMany({
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
            },
            data: {
                name: data.name,
                description: data.description,
                color: data.color,
                icon: data.icon
            }
        });

        return NextResponse.json(board);
    } catch (error) {
        console.error("Error updating board:", error);
        return NextResponse.json(
            { error: "حدث خطأ أثناء تحديث اللوحة" },
            { status: 500 }
        );
    }
}

// DELETE board
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

        await prisma.board.deleteMany({
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

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting board:", error);
        return NextResponse.json(
            { error: "حدث خطأ أثناء حذف اللوحة" },
            { status: 500 }
        );
    }
}
