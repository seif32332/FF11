"use client";

import { useState } from "react";
import { X, Plus, Zap, Play, Trash2, Settings } from "lucide-react";

interface AutomationBuilderProps {
    boardId: string;
    columns: Array<{ id: string; title: string; type: string; settings?: unknown }>;
    onClose: () => void;
    onSave: (automation: {
        name: string;
        description: string;
        triggers: Array<{ type: string; conditions: Record<string, unknown> }>;
        actions: Array<{ type: string; settings: Record<string, unknown> }>;
    }) => void;
}

const TRIGGER_TYPES = [
    { value: "STATUS_CHANGE", label: "عند تغيير الحالة", icon: "🔄" },
    { value: "DATE_ARRIVED", label: "عند وصول التاريخ", icon: "📅" },
    { value: "ITEM_CREATED", label: "عند إنشاء عنصر", icon: "➕" },
    { value: "ITEM_UPDATED", label: "عند تحديث عنصر", icon: "✏️" },
    { value: "PERSON_ASSIGNED", label: "عند تعيين شخص", icon: "👤" },
    { value: "COLUMN_CHANGE", label: "عند تغيير عمود", icon: "📊" }
];

const ACTION_TYPES = [
    { value: "NOTIFY", label: "إرسال إشعار", icon: "🔔" },
    { value: "CHANGE_STATUS", label: "تغيير الحالة", icon: "🎯" },
    { value: "ASSIGN_PERSON", label: "تعيين شخص", icon: "👥" },
    { value: "MOVE_ITEM", label: "نقل العنصر", icon: "🔀" },
    { value: "CREATE_ITEM", label: "إنشاء عنصر", icon: "✨" },
    { value: "UPDATE_COLUMN", label: "تحديث عمود", icon: "📝" },
    { value: "SEND_EMAIL", label: "إرسال بريد", icon: "📧" }
];

export default function AutomationBuilder({
    boardId,
    columns,
    onClose,
    onSave
}: AutomationBuilderProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [triggers, setTriggers] = useState<Array<{ type: string; conditions: Record<string, unknown> }>>([
        { type: "STATUS_CHANGE", conditions: {} }
    ]);
    const [actions, setActions] = useState<Array<{ type: string; settings: Record<string, unknown> }>>([
        { type: "NOTIFY", settings: {} }
    ]);
    const [showTemplates, setShowTemplates] = useState(true);

    const templates = [
        {
            name: "إشعار عند الاكتمال",
            description: "أرسل إشعاراً عندما يتم إكمال عنصر",
            trigger: { type: "STATUS_CHANGE", conditions: { value: "مكتمل" } },
            action: { type: "NOTIFY", settings: { message: "تم إكمال {item.name}" } }
        },
        {
            name: "نقل عند التأخير",
            description: "انقل العنصر إلى مجموعة 'متأخر' عند تجاوز الموعد",
            trigger: { type: "DATE_ARRIVED", conditions: {} },
            action: { type: "MOVE_ITEM", settings: {} }
        },
        {
            name: "تعيين تلقائي",
            description: "عيّن مسؤولاً عند إنشاء عنصر جديد",
            trigger: { type: "ITEM_CREATED", conditions: {} },
            action: { type: "ASSIGN_PERSON", settings: {} }
        }
    ];

    const applyTemplate = (template: typeof templates[0]) => {
        setName(template.name);
        setDescription(template.description);
        setTriggers([template.trigger]);
        setActions([template.action]);
        setShowTemplates(false);
    };

    const addTrigger = () => {
        setTriggers([...triggers, { type: "STATUS_CHANGE", conditions: {} }]);
    };

    const removeTrigger = (index: number) => {
        setTriggers(triggers.filter((_, i) => i !== index));
    };

    const addAction = () => {
        setActions([...actions, { type: "NOTIFY", settings: {} }]);
    };

    const removeAction = (index: number) => {
        setActions(actions.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        if (!name.trim()) {
            alert("يرجى إدخال اسم للأتمتة");
            return;
        }

        onSave({ name, description, triggers, actions });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div
                className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-xl shadow-2xl animate-slideUp"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">بناء أتمتة مخصصة</h2>
                            <p className="text-sm text-gray-400">صمم سير عمل تلقائي لتسهيل مهامك</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
                    {showTemplates ? (
                        /* Templates Section */
                        <div className="p-6">
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-primary" />
                                قوالب جاهزة
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                {templates.map((template, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => applyTemplate(template)}
                                        className="p-4 rounded-lg border-2 border-dashed text-right hover:border-primary transition-all"
                                        style={{ borderColor: 'var(--border-color)', background: 'var(--bg-tertiary)' }}
                                    >
                                        <div className="font-bold mb-1">{template.name}</div>
                                        <div className="text-sm text-gray-400">{template.description}</div>
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setShowTemplates(false)}
                                className="w-full p-3 rounded-lg border border-dashed hover:border-primary"
                                style={{ borderColor: 'var(--border-color)' }}
                            >
                                أو ابدأ من الصفر
                            </button>
                        </div>
                    ) : (
                        <div className="p-6 space-y-6">
                            {/* Basic Info */}
                            <div>
                                <label className="block text-sm font-medium mb-2">اسم الأتمتة</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="مثال: إشعار عند الاكتمال"
                                    className="input w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">الوصف (اختياري)</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="اشرح ماذا تفعل هذه الأتمتة..."
                                    className="input w-full min-h-[60px]"
                                />
                            </div>

                            {/* Triggers */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-bold flex items-center gap-2">
                                        <Play className="w-5 h-5 text-green-500" />
                                        المحفزات (متى تعمل؟)
                                    </h3>
                                    <button onClick={addTrigger} className="btn btn-secondary btn-sm">
                                        <Plus className="w-4 h-4" />
                                        إضافة محفز
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {triggers.map((trigger, idx) => (
                                        <div
                                            key={idx}
                                            className="p-4 rounded-lg border relative"
                                            style={{ borderColor: 'var(--border-color)', background: 'var(--bg-tertiary)' }}
                                        >
                                            {triggers.length > 1 && (
                                                <button
                                                    onClick={() => removeTrigger(idx)}
                                                    className="absolute top-2 left-2 p-1 rounded hover:bg-red-500/20 text-red-400"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}

                                            <label className="block text-sm font-medium mb-2">نوع المحفز</label>
                                            <select
                                                value={trigger.type}
                                                onChange={(e) => {
                                                    const newTriggers = [...triggers];
                                                    newTriggers[idx].type = e.target.value;
                                                    setTriggers(newTriggers);
                                                }}
                                                className="input w-full"
                                            >
                                                {TRIGGER_TYPES.map((t) => (
                                                    <option key={t.value} value={t.value}>
                                                        {t.icon} {t.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-bold flex items-center gap-2">
                                        <Settings className="w-5 h-5 text-blue-500" />
                                        الإجراءات (ماذا ستفعل؟)
                                    </h3>
                                    <button onClick={addAction} className="btn btn-secondary btn-sm">
                                        <Plus className="w-4 h-4" />
                                        إضافة إجراء
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {actions.map((action, idx) => (
                                        <div
                                            key={idx}
                                            className="p-4 rounded-lg border relative"
                                            style={{ borderColor: 'var(--border-color)', background: 'var(--bg-tertiary)' }}
                                        >
                                            {actions.length > 1 && (
                                                <button
                                                    onClick={() => removeAction(idx)}
                                                    className="absolute top-2 left-2 p-1 rounded hover:bg-red-500/20 text-red-400"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}

                                            <label className="block text-sm font-medium mb-2">نوع الإجراء</label>
                                            <select
                                                value={action.type}
                                                onChange={(e) => {
                                                    const newActions = [...actions];
                                                    newActions[idx].type = e.target.value;
                                                    setActions(newActions);
                                                }}
                                                className="input w-full"
                                            >
                                                {ACTION_TYPES.map((a) => (
                                                    <option key={a.value} value={a.value}>
                                                        {a.icon} {a.label}
                                                    </option>
                                                ))}
                                            </select>

                                            {action.type === "NOTIFY" && (
                                                <div className="mt-3">
                                                    <label className="block text-sm font-medium mb-2">نص الإشعار</label>
                                                    <input
                                                        type="text"
                                                        placeholder="مثال: تم تحديث {item.name}"
                                                        className="input w-full"
                                                        value={(action.settings.message as string) || ""}
                                                        onChange={(e) => {
                                                            const newActions = [...actions];
                                                            newActions[idx].settings.message = e.target.value;
                                                            setActions(newActions);
                                                        }}
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        يمكنك استخدام: {"{item.name}"}, {"{board.name}"}, {"{user.name}"}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {!showTemplates && (
                    <div className="flex items-center justify-between p-6 border-t" style={{ borderColor: 'var(--border-color)' }}>
                        <button onClick={() => setShowTemplates(true)} className="btn btn-secondary">
                            عودة للقوالب
                        </button>
                        <div className="flex gap-2">
                            <button onClick={onClose} className="btn btn-secondary">
                                إلغاء
                            </button>
                            <button onClick={handleSave} className="btn btn-primary">
                                <Zap className="w-4 h-4" />
                                حفظ الأتمتة
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
