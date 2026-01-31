import { prisma } from "@/lib/db";

export type TriggerType =
    | "STATUS_CHANGE"
    | "DATE_ARRIVED"
    | "ITEM_CREATED"
    | "ITEM_UPDATED"
    | "PERSON_ASSIGNED"
    | "COLUMN_CHANGE";

export type ActionType =
    | "NOTIFY"
    | "CHANGE_STATUS"
    | "ASSIGN_PERSON"
    | "MOVE_ITEM"
    | "CREATE_ITEM"
    | "SEND_EMAIL"
    | "UPDATE_COLUMN";

interface TriggerData {
    type: TriggerType;
    itemId: string;
    boardId: string;
    userId: string;
    data: Record<string, unknown>;
}

interface AutomationContext {
    item: {
        id: string;
        name: string;
        groupId: string;
    };
    board: {
        id: string;
        name: string;
    };
    user: {
        id: string;
        name: string;
        email: string;
    };
    trigger: TriggerData;
}

// Execute automations when a trigger fires
export async function executeAutomations(trigger: TriggerData) {
    try {
        // Find all active automations for this board with matching triggers
        const automations = await prisma.automation.findMany({
            where: {
                boardId: trigger.boardId,
                isActive: true,
                triggers: {
                    some: {
                        type: trigger.type
                    }
                }
            },
            include: {
                triggers: true,
                actions: true,
                board: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        // Get item and user context
        const item = await prisma.item.findUnique({
            where: { id: trigger.itemId },
            select: { id: true, name: true, groupId: true }
        });

        const user = await prisma.user.findUnique({
            where: { id: trigger.userId },
            select: { id: true, name: true, email: true }
        });

        if (!item || !user) return;

        // Execute each automation
        for (const automation of automations) {
            // Check if trigger conditions match
            const matchingTrigger = automation.triggers.find((t: { type: string; conditions: unknown }) => {
                if (t.type !== trigger.type) return false;

                // Check additional conditions
                const conditions = t.conditions as Record<string, unknown>;
                if (conditions.columnId && conditions.columnId !== trigger.data.columnId) {
                    return false;
                }
                if (conditions.value && conditions.value !== trigger.data.newValue) {
                    return false;
                }

                return true;
            });

            if (!matchingTrigger) continue;

            const context: AutomationContext = {
                item,
                board: automation.board,
                user,
                trigger
            };

            // Execute all actions
            for (const action of automation.actions) {
                await executeAction(action.type as ActionType, action.settings as Record<string, unknown>, context);
            }
        }
    } catch (error) {
        console.error("Error executing automations:", error);
    }
}

async function executeAction(
    type: ActionType,
    settings: Record<string, unknown>,
    context: AutomationContext
) {
    switch (type) {
        case "NOTIFY":
            await createNotification(settings, context);
            break;
        case "CHANGE_STATUS":
            await changeStatus(settings, context);
            break;
        case "ASSIGN_PERSON":
            await assignPerson(settings, context);
            break;
        case "MOVE_ITEM":
            await moveItem(settings, context);
            break;
        case "CREATE_ITEM":
            await createItem(settings, context);
            break;
        case "UPDATE_COLUMN":
            await updateColumn(settings, context);
            break;
        case "SEND_EMAIL":
            await sendEmail(settings, context);
            break;
    }
}

// Action implementations
async function createNotification(
    settings: Record<string, unknown>,
    context: AutomationContext
) {
    const targetUserId = (settings.targetUserId as string) || context.user.id;
    const message = replaceVariables(settings.message as string, context);

    await prisma.notification.create({
        data: {
            type: "AUTOMATION",
            title: "إشعار تلقائي",
            message,
            userId: targetUserId,
            data: {
                itemId: context.item.id,
                boardId: context.board.id,
                automationType: context.trigger.type
            }
        }
    });
}

async function changeStatus(
    settings: Record<string, unknown>,
    context: AutomationContext
) {
    const columnId = settings.columnId as string;
    const newValue = settings.value as object;

    await prisma.itemValue.upsert({
        where: {
            itemId_columnId: {
                itemId: context.item.id,
                columnId
            }
        },
        update: { value: newValue },
        create: {
            itemId: context.item.id,
            columnId,
            value: newValue
        }
    });
}

async function assignPerson(
    settings: Record<string, unknown>,
    context: AutomationContext
) {
    const targetUserId = settings.userId as string;

    await prisma.itemAssignment.upsert({
        where: {
            itemId_userId: {
                itemId: context.item.id,
                userId: targetUserId
            }
        },
        update: {},
        create: {
            itemId: context.item.id,
            userId: targetUserId
        }
    });

    // Notify the assigned person
    await prisma.notification.create({
        data: {
            type: "ASSIGNMENT",
            title: "تم تعيينك",
            message: `تم تعيينك على "${context.item.name}"`,
            userId: targetUserId,
            data: {
                itemId: context.item.id,
                boardId: context.board.id
            }
        }
    });
}

async function moveItem(
    settings: Record<string, unknown>,
    context: AutomationContext
) {
    const targetGroupId = settings.groupId as string;

    await prisma.item.update({
        where: { id: context.item.id },
        data: { groupId: targetGroupId }
    });
}

async function createItem(
    settings: Record<string, unknown>,
    context: AutomationContext
) {
    const groupId = settings.groupId as string;
    const name = replaceVariables(settings.name as string, context);

    const maxPosition = await prisma.item.aggregate({
        where: { groupId },
        _max: { position: true }
    });

    await prisma.item.create({
        data: {
            name,
            groupId,
            creatorId: context.user.id,
            position: (maxPosition._max.position || 0) + 1
        }
    });
}

async function updateColumn(
    settings: Record<string, unknown>,
    context: AutomationContext
) {
    const columnId = settings.columnId as string;
    const value = settings.value as object;

    await prisma.itemValue.upsert({
        where: {
            itemId_columnId: {
                itemId: context.item.id,
                columnId
            }
        },
        update: { value },
        create: {
            itemId: context.item.id,
            columnId,
            value
        }
    });
}

async function sendEmail(
    settings: Record<string, unknown>,
    context: AutomationContext
) {
    // In production, use Resend or similar service
    console.log("Would send email:", {
        to: settings.to || context.user.email,
        subject: replaceVariables(settings.subject as string, context),
        body: replaceVariables(settings.body as string, context)
    });

    // Example with Resend:
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: "notifications@yourapp.com",
    //   to: settings.to || context.user.email,
    //   subject: replaceVariables(settings.subject, context),
    //   html: replaceVariables(settings.body, context)
    // });
}

// Helper to replace variables in strings
function replaceVariables(template: string, context: AutomationContext): string {
    if (!template) return "";

    return template
        .replace(/\{item\.name\}/g, context.item.name)
        .replace(/\{board\.name\}/g, context.board.name)
        .replace(/\{user\.name\}/g, context.user.name)
        .replace(/\{user\.email\}/g, context.user.email);
}

// Pre-built automation templates
export const automationTemplates = [
    {
        name: "إشعار عند تغيير الحالة",
        description: "أرسل إشعاراً عندما تتغير حالة العنصر",
        trigger: { type: "STATUS_CHANGE" as TriggerType },
        action: { type: "NOTIFY" as ActionType, settings: { message: "تم تغيير حالة {item.name}" } }
    },
    {
        name: "نقل عند الاكتمال",
        description: "انقل العنصر إلى مجموعة أخرى عند اكتماله",
        trigger: { type: "STATUS_CHANGE" as TriggerType, conditions: { value: "مكتمل" } },
        action: { type: "MOVE_ITEM" as ActionType }
    },
    {
        name: "تعيين تلقائي",
        description: "عيّن شخصاً تلقائياً عند إنشاء عنصر جديد",
        trigger: { type: "ITEM_CREATED" as TriggerType },
        action: { type: "ASSIGN_PERSON" as ActionType }
    },
    {
        name: "تذكير بالتاريخ",
        description: "أرسل إشعاراً عند وصول تاريخ الاستحقاق",
        trigger: { type: "DATE_ARRIVED" as TriggerType },
        action: { type: "NOTIFY" as ActionType, settings: { message: "تذكير: {item.name} مستحق اليوم" } }
    }
];
