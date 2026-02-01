import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const query = searchParams.get("q")?.trim();

        if (!query || query.length < 2) {
            return NextResponse.json([]);
        }

        // Search boards
        const boards = await prisma.board.findMany({
            where: {
                workspace: {
                    members: {
                        some: {
                            userId: session.user.id
                        }
                    }
                },
                OR: [
                    { name: { contains: query, mode: "insensitive" } },
                    { description: { contains: query, mode: "insensitive" } }
                ]
            },
            select: {
                id: true,
                name: true,
                updatedAt: true,
                workspace: {
                    select: {
                        name: true
                    }
                }
            },
            take: 5,
            orderBy: { updatedAt: "desc" }
        });

        // Search items
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
                },
                name: { contains: query, mode: "insensitive" }
            },
            select: {
                id: true,
                name: true,
                updatedAt: true,
                group: {
                    select: {
                        board: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            },
            take: 10,
            orderBy: { updatedAt: "desc" }
        });

        // Format results
        const results = [
            ...boards.map(board => ({
                type: "board" as const,
                id: board.id,
                name: board.name,
                workspaceName: board.workspace.name,
                url: `/dashboard/board/${board.id}`,
                updatedAt: board.updatedAt.toISOString()
            })),
            ...items.map(item => ({
                type: "item" as const,
                id: item.id,
                name: item.name,
                boardName: item.group.board.name,
                url: `/dashboard/board/${item.group.board.id}?item=${item.id}`,
                updatedAt: item.updatedAt.toISOString()
            }))
        ];

        // Sort by recency
        results.sort((a, b) =>
            new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
        );

        return NextResponse.json(results.slice(0, 15));
    } catch (error) {
        console.error("Search error:", error);
        return NextResponse.json(
            { error: "حدث خطأ أثناء البحث" },
            { status: 500 }
        );
    }
}
