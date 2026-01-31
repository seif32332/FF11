"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, Loader2, User } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (password !== confirmPassword) {
            setError("كلمتا المرور غير متطابقتين");
            setLoading(false);
            return;
        }

        if (password.length < 8) {
            setError("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "حدث خطأ أثناء إنشاء الحساب");
            } else {
                router.push("/login?registered=true");
            }
        } catch {
            setError("حدث خطأ أثناء إنشاء الحساب");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)' }}>
            <div className="w-full max-w-md">
                {/* الشعار */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))' }}>
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold mb-2">إنشاء حساب جديد</h1>
                    <p className="text-gray-400">انضم إلينا وابدأ في إدارة مهامك</p>
                </div>

                {/* نموذج التسجيل */}
                <form onSubmit={handleSubmit} className="card">
                    {error && (
                        <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'rgba(226, 68, 92, 0.1)', color: 'var(--status-stuck)' }}>
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* الاسم */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                الاسم الكامل
                            </label>
                            <div className="relative">
                                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="input pr-10"
                                    placeholder="أحمد محمد"
                                    required
                                />
                            </div>
                        </div>

                        {/* البريد الإلكتروني */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                البريد الإلكتروني
                            </label>
                            <div className="relative">
                                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input pr-10"
                                    placeholder="email@example.com"
                                    required
                                    dir="ltr"
                                />
                            </div>
                        </div>

                        {/* كلمة المرور */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                كلمة المرور
                            </label>
                            <div className="relative">
                                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input pr-10 pl-10"
                                    placeholder="••••••••"
                                    required
                                    dir="ltr"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* تأكيد كلمة المرور */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                تأكيد كلمة المرور
                            </label>
                            <div className="relative">
                                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="input pr-10"
                                    placeholder="••••••••"
                                    required
                                    dir="ltr"
                                />
                            </div>
                        </div>

                        {/* زر التسجيل */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full py-3 text-base"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    جاري إنشاء الحساب...
                                </>
                            ) : (
                                "إنشاء حساب"
                            )}
                        </button>
                    </div>

                    {/* رابط تسجيل الدخول */}
                    <div className="mt-6 text-center text-gray-400">
                        لديك حساب بالفعل؟{" "}
                        <Link href="/login" className="font-medium hover:underline" style={{ color: 'var(--primary-light)' }}>
                            سجّل دخولك
                        </Link>
                    </div>
                </form>

                {/* حقوق النشر */}
                <p className="mt-8 text-center text-sm text-gray-500">
                    © 2026 إدارة المهام. جميع الحقوق محفوظة.
                </p>
            </div>
        </div>
    );
}
