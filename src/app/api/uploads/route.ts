import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { put, del } from "@vercel/blob";

// POST upload file
export async function POST(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get("file") as File;
        const itemId = formData.get("itemId") as string;

        if (!file) {
            return NextResponse.json({ error: "لا يوجد ملف" }, { status: 400 });
        }

        if (!itemId) {
            return NextResponse.json({ error: "معرف العنصر مطلوب" }, { status: 400 });
        }

        // Verify user has access to the item's board
        const item = await prisma.item.findFirst({
            where: {
                id: itemId,
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

        // Upload to Vercel Blob
        const blob = await put(`attachments/${itemId}/${file.name}`, file, {
            access: "public",
        });

        // Create attachment record
        const attachment = await prisma.attachment.create({
            data: {
                itemId,
                userId: session.user.id,
                filename: file.name,
                url: blob.url,
                size: file.size,
                mimeType: file.type,
            }
        });

        return NextResponse.json(attachment);
    } catch (error) {
        console.error("Error uploading file:", error);
        return NextResponse.json(
            { error: "حدث خطأ أثناء رفع الملف" },
            { status: 500 }
        );
    }
}

// GET list attachments for an item
export async function GET(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const itemId = searchParams.get("itemId");

        if (!itemId) {
            return NextResponse.json({ error: "معرف العنصر مطلوب" }, { status: 400 });
        }

        const attachments = await prisma.attachment.findMany({
            where: {
                itemId,
                item: {
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
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json(attachments);
    } catch (error) {
        console.error("Error fetching attachments:", error);
        return NextResponse.json(
            { error: "حدث خطأ أثناء جلب المرفقات" },
            { status: 500 }
        );
    }
}

// DELETE attachment
export async function DELETE(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const attachmentId = searchParams.get("id");

        if (!attachmentId) {
            return NextResponse.json({ error: "معرف المرفق مطلوب" }, { status: 400 });
        }

        // Verify user has access
        const attachment = await prisma.attachment.findFirst({
            where: {
                id: attachmentId,
                item: {
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
            }
        });

        if (!attachment) {
            return NextResponse.json({ error: "المرفق غير موجود" }, { status: 404 });
        }

        // Delete from Vercel Blob
        if (attachment.url) {
            await del(attachment.url);
        }

        // Delete from database
        await prisma.attachment.delete({
            where: { id: attachmentId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting attachment:", error);
        return NextResponse.json(
            { error: "حدث خطأ أثناء حذف المرفق" },
            { status: 500 }
        );
    }
}
