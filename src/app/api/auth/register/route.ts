import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
    try {
        const { name, email, password } = await request.json();

        // التحقق من البيانات
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: "جميع الحقول مطلوبة" },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" },
                { status: 400 }
            );
        }

        // التحقق من وجود المستخدم
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "البريد الإلكتروني مستخدم بالفعل" },
                { status: 400 }
            );
        }

        // تشفير كلمة المرور
        const hashedPassword = await hash(password, 12);

        // إنشاء المستخدم
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        // إنشاء مساحة عمل افتراضية للمستخدم
        const workspace = await prisma.workspace.create({
            data: {
                name: "مساحة العمل الرئيسية",
                description: "مساحة العمل الافتراضية",
                members: {
                    create: {
                        userId: user.id,
                        role: "OWNER",
                    },
                },
            },
        });

        // إنشاء لوحة افتراضية
        await prisma.board.create({
            data: {
                name: "مشروعي الأول",
                workspaceId: workspace.id,
                creatorId: user.id,
                columns: {
                    create: [
                        { title: "العنصر", type: "TEXT", position: 0 },
                        {
                            title: "الحالة", type: "STATUS", position: 1, settings: {
                                options: [
                                    { label: "جديد", color: "#579bfc" },
                                    { label: "قيد العمل", color: "#fdab3d" },
                                    { label: "عالق", color: "#e2445c" },
                                    { label: "مكتمل", color: "#00c875" },
                                ]
                            }
                        },
                        { title: "التاريخ", type: "DATE", position: 2 },
                        { title: "المسؤول", type: "PERSON", position: 3 },
                    ],
                },
                groups: {
                    create: [
                        { name: "المهام الجديدة", color: "#579bfc", position: 0 },
                        { name: "قيد التنفيذ", color: "#fdab3d", position: 1 },
                        { name: "مكتملة", color: "#00c875", position: 2 },
                    ],
                },
                views: {
                    create: [
                        { name: "جدول", type: "TABLE", isDefault: true, position: 0 },
                        { name: "كانبان", type: "KANBAN", position: 1 },
                        { name: "الجدول الزمني", type: "TIMELINE", position: 2 },
                    ],
                },
            },
        });

        return NextResponse.json(
            { message: "تم إنشاء الحساب بنجاح", userId: user.id },
            { status: 201 }
        );
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { error: "حدث خطأ أثناء إنشاء الحساب" },
            { status: 500 }
        );
    }
}
